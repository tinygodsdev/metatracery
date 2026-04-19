import { applyModifierPipeline, DEFAULT_ENGLISH_MODIFIERS } from "./baseEngModifiers";
import {
  decodePlaceholderInner,
  parsePlaceholderInner,
  splitTemplateSegments,
} from "./placeholderParse";
import type { ModifierApplication } from "./types";

export type Grammar = Record<string, string[]>;
type Constraints = Record<string, string | string[]>;
export type GenerationStrategy = "uniform" | "weighted";

type AstNode = LiteralNode | ReferenceNode | SequenceNode | AlternationNode;

interface LiteralNode {
  kind: "literal";
  text: string;
}
interface ReferenceNode {
  kind: "reference";
  name: string;
  modifiers: string[];
}
interface SequenceNode {
  kind: "sequence";
  parts: AstNode[];
}
interface AlternationNode {
  kind: "alternation";
  options: AstNode[];
}

type Trace = Record<string, string[]>;

export interface Generated {
  text: string;
  trace: Trace; // rule -> list of chosen alternatives
  /** Present when processModifiers ran and at least one #rule.mod# had modifiers */
  modifierApplications?: ModifierApplication[];
}

const Literal = (text: string): LiteralNode => ({ kind: "literal", text });
const Ref = (name: string, modifiers: string[] = []): ReferenceNode => ({
  kind: "reference",
  name,
  modifiers,
});
const Sequence = (parts: AstNode[]): AstNode =>
  parts.length === 1 ? parts[0]! : { kind: "sequence", parts };
const Alternation = (options: AstNode[]): AlternationNode => ({
  kind: "alternation",
  options,
});

function ruleNameFromPattern(pat: string): string | undefined {
  try {
    const segs = splitTemplateSegments(pat);
    if (segs.length !== 1 || segs[0]!.kind !== "placeholder") return undefined;
    return parsePlaceholderInner(decodePlaceholderInner(segs[0].innerRaw)).ruleName;
  } catch {
    return undefined;
  }
}

export class GrammarEngine {
  private readonly ruleAst: Record<string, AlternationNode>;

  constructor(rules: Grammar) {
    this.ruleAst = Object.fromEntries(
      Object.entries(rules).map(([name, templates]) => [
        name,
        Alternation(templates.map(this.parseTemplate)),
      ]),
    );
  }

  // Parse a template like "#NP# eats #OP#" or "#noun.a#"; `\#` / `\\` for literal # and \
  private parseTemplate = (template: string): AstNode => {
    const parts: AstNode[] = [];
    for (const seg of splitTemplateSegments(template)) {
      if (seg.kind === "literal") {
        if (seg.text) parts.push(Literal(seg.text));
        continue;
      }
      const decoded = decodePlaceholderInner(seg.innerRaw);
      const { ruleName, modifierSegments } = parsePlaceholderInner(decoded);
      parts.push(Ref(ruleName, modifierSegments));
    }
    return Sequence(parts);
  };

  // Render a node back to a pattern string with #Nonterm# placeholders
  private renderPattern = (node: AstNode): string => {
    switch (node.kind) {
      case "literal":
        return node.text;
      case "reference":
        return node.modifiers.length
          ? `#${node.name}.${node.modifiers.join(".")}#`
          : `#${node.name}#`;
      case "sequence":
        return node.parts.map(this.renderPattern).join("");
      case "alternation":
        return node.options.length ? this.renderPattern(node.options[0]!) : "";
    }
  };

  // Human friendly label for a chosen alternative
  private choiceLabel = (node: AstNode): string => {
    if (node.kind === "reference") {
      return node.modifiers.length ? this.renderPattern(node) : node.name;
    }
    const pattern = this.renderPattern(node);
    const onlyRef = /^#([A-Za-z_][A-Za-z0-9_]*)#$/.exec(pattern)?.[1];
    return onlyRef ?? pattern;
  };

  // Apply constraints to an alternation under a rule name
  private applyConstraints = (
    ruleName: string,
    alt: AlternationNode | undefined,
    constraints?: Constraints,
  ): AlternationNode => {
    if (!alt) return Alternation([]);
    if (!constraints || !(ruleName in constraints)) return alt;
    const required = constraints[ruleName];
    const allowed = new Set(Array.isArray(required) ? required : [required]);

    const filtered = alt.options.filter((option) => {
      const pat = this.renderPattern(option);
      if (allowed.has(pat)) return true;
      if (option.kind === "reference") {
        if (allowed.has(option.name)) return true;
        if (allowed.has(`#${option.name}#`)) return true;
      }
      const rn = ruleNameFromPattern(pat);
      return rn ? allowed.has(rn) : false;
    });
    if (!filtered.length)
      throw new Error(`Constraint eliminates all options of rule "${ruleName}"`);
    return Alternation(filtered);
  };

  // -------- Exact counting --------
  countStrings(start = "origin", constraints?: Constraints, maxDepth = Infinity): number {
    const memo = new Map<string, number>();
    const key = (node: AstNode, depth: number) =>
      `${depth}|${this.renderPattern(node)}`;

    const count = (node: AstNode, depth: number): number => {
      if (depth < 0) return 0;
      const k = key(node, depth);
      if (memo.has(k)) return memo.get(k)!;

      let total: number;
      switch (node.kind) {
        case "literal":
          total = 1;
          break;
        case "reference": {
          const root = this.ruleAst[node.name];
          if (!root) {
            total = 0;
            break;
          }
          total = count(
            this.applyConstraints(node.name, root, constraints),
            depth - 1,
          );
          break;
        }
        case "sequence":
          total = node.parts.reduce((prod, part) => prod * count(part, depth), 1);
          break;
        case "alternation":
          total = node.options.reduce((sum, opt) => sum + count(opt, depth), 0);
          break;
      }
      memo.set(k, total);
      return total;
    };

    const depth = isFinite(maxDepth) ? maxDepth : 1e9;
    return count(Ref(start), depth);
  }

  // -------- Random generation with metadata --------
  generate(
    start = "origin",
    constraints?: Constraints,
    maxDepth = Infinity,
    rng: () => number = Math.random,
    strategy: GenerationStrategy = "uniform",
    processModifiers = false,
  ): Generated {
    const memo = new Map<string, number>();
    const key = (node: AstNode, depth: number) =>
      `${depth}|${this.renderPattern(node)}`;

    const count = (node: AstNode, depth: number): number => {
      if (depth < 0) return 0;
      const k = key(node, depth);
      if (memo.has(k)) return memo.get(k)!;
      let v = 0;
      if (node.kind === "literal") v = 1;
      else if (node.kind === "reference") {
        const root = this.ruleAst[node.name];
        v = root
          ? count(this.applyConstraints(node.name, root, constraints), depth - 1)
          : 0;
      } else if (node.kind === "sequence")
        v = node.parts.reduce((p, c) => p * count(c, depth), 1);
      else v = node.options.reduce((s, c) => s + count(c, depth), 0);
      memo.set(k, v);
      return v;
    };

    const trace: Trace = {};
    const modifierApplications: ModifierApplication[] = [];
    const addTrace = (rule: string, label: string) => {
      (trace[rule] ??= []).push(label);
    };

    const buildFromRule = (ruleName: string, depth: number): string => {
      const alt = this.applyConstraints(ruleName, this.ruleAst[ruleName], constraints);
      if (alt.options.length === 0) return "";

      let chosen: AstNode;
      if (strategy === "uniform") {
        const pick = Math.floor(rng() * alt.options.length);
        chosen = alt.options[pick]!;
      } else {
        const weights = alt.options.map((o) => count(o, depth));
        const total = weights.reduce((a, b) => a + b, 0);
        if (!total) return "";
        let pick = Math.floor(rng() * total);
        chosen = alt.options[0]!;
        for (let i = 0; i < alt.options.length; i++) {
          if (pick < weights[i]!) {
            chosen = alt.options[i]!;
            break;
          }
          pick -= weights[i]!;
        }
      }

      addTrace(ruleName, this.choiceLabel(chosen));
      return buildNode(chosen, depth);
    };

    const buildNode = (node: AstNode, depth: number): string => {
      if (depth < 0) return "";
      switch (node.kind) {
        case "literal":
          return node.text;
        case "reference": {
          const expanded = buildFromRule(node.name, depth - 1);
          let t = expanded;
          if (processModifiers && node.modifiers.length > 0) {
            t = applyModifierPipeline(
              expanded,
              node.modifiers,
              DEFAULT_ENGLISH_MODIFIERS,
            );
            modifierApplications.push({
              rule: node.name,
              expandedText: expanded,
              modifiers: [...node.modifiers],
              resultText: t,
            });
          }
          return t;
        }
        case "sequence":
          return node.parts.map((p) => buildNode(p, depth)).join("");
        case "alternation":
          throw new Error("Alternation nodes occur only at rule roots");
      }
    };

    const depth = isFinite(maxDepth) ? maxDepth : 1e9;
    const text = buildFromRule(start, depth);
    return {
      text,
      trace,
      ...(modifierApplications.length > 0 ? { modifierApplications } : {}),
    };
  }

  // Generate n results - optionally unique by text
  generateMany(
    n: number,
    start = "origin",
    constraints?: Constraints,
    unique = false,
    maxDepth = Infinity,
    strategy: GenerationStrategy = "uniform",
    processModifiers = false,
  ): Generated[] {
    if (!unique)
      return Array.from({ length: n }, () =>
        this.generate(start, constraints, maxDepth, Math.random, strategy, processModifiers),
      );
    const seen = new Set<string>();
    const results: Generated[] = [];
    const limit = this.countStrings(start, constraints, maxDepth);
    while (results.length < Math.min(n, limit)) {
      const g = this.generate(
        start,
        constraints,
        maxDepth,
        Math.random,
        strategy,
        processModifiers,
      );
      if (!seen.has(g.text)) {
        seen.add(g.text);
        results.push(g);
      }
    }
    return results;
  }

  // -------- Full expansion with metadata --------
  expandAll(
    start = "origin",
    constraints?: Constraints,
    maxDepth = Infinity,
    cap = Infinity,
    processModifiers = false,
  ): Generated[] {
    const depth = isFinite(maxDepth) ? maxDepth : 1e9;

    const mergeTraces = (left: Trace, right: Trace): Trace => {
      const out: Trace = {};
      for (const [k, v] of Object.entries(left)) out[k] = [...v];
      for (const [k, v] of Object.entries(right)) (out[k] ??= []).push(...v);
      return out;
    };

    const mergeModifierApplications = (
      left: ModifierApplication[] | undefined,
      right: ModifierApplication[] | undefined,
    ): ModifierApplication[] | undefined => {
      const a = left ?? [];
      const b = right ?? [];
      if (a.length === 0 && b.length === 0) return undefined;
      return [...a, ...b];
    };

    const expandFromRule = (ruleName: string, d: number): Generated[] => {
      const alt = this.applyConstraints(
        ruleName,
        this.ruleAst[ruleName],
        constraints,
      );
      const results: Generated[] = [];
      for (const option of alt.options) {
        const tail = expandNode(option, d);
        const label = this.choiceLabel(option);
        for (const t of tail) {
          results.push({
            text: t.text,
            trace: mergeTraces({ [ruleName]: [label] }, t.trace),
            modifierApplications: t.modifierApplications,
          });
          if (results.length >= cap) return results;
        }
      }
      return results;
    };

    const expandNode = (node: AstNode, d: number): Generated[] => {
      if (d < 0) return [];
      switch (node.kind) {
        case "literal":
          return [{ text: node.text, trace: {}, modifierApplications: [] }];
        case "reference": {
          const inner = expandFromRule(node.name, d - 1);
          return inner.map((t) => {
            let text = t.text;
            let modApps = t.modifierApplications ?? [];
            if (processModifiers && node.modifiers.length > 0) {
              const expanded = text;
              text = applyModifierPipeline(
                expanded,
                node.modifiers,
                DEFAULT_ENGLISH_MODIFIERS,
              );
              modApps = [
                ...modApps,
                {
                  rule: node.name,
                  expandedText: expanded,
                  modifiers: [...node.modifiers],
                  resultText: text,
                },
              ];
            }
            return {
              text,
              trace: t.trace,
              modifierApplications: modApps,
            };
          });
        }
        case "sequence": {
          return node.parts.reduce<Generated[]>((acc, part) => {
            const right = expandNode(part, d);
            const merged: Generated[] = [];
            for (const left of acc) {
              for (const r of right) {
                merged.push({
                  text: left.text + r.text,
                  trace: mergeTraces(left.trace, r.trace),
                  modifierApplications: mergeModifierApplications(
                    left.modifierApplications,
                    r.modifierApplications,
                  ),
                });
                if (merged.length >= cap) return merged;
              }
            }
            return merged;
          }, [{ text: "", trace: {}, modifierApplications: [] }]);
        }
        case "alternation":
          throw new Error("Alternation nodes occur only at rule roots");
      }
    };

    const results = expandFromRule(start, depth);
    return results;
  }
}
