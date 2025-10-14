export type Grammar = Record<string, string[]>;
type Constraints = Record<string, string | string[]>;

type AstNode = LiteralNode | ReferenceNode | SequenceNode | AlternationNode;

interface LiteralNode { kind: "literal"; text: string }
interface ReferenceNode { kind: "reference"; name: string }
interface SequenceNode { kind: "sequence"; parts: AstNode[] }
interface AlternationNode { kind: "alternation"; options: AstNode[] }

type Trace = Record<string, string[]>;

export interface Generated {
  text: string;
  trace: Trace;                   // rule -> list of chosen alternatives
}

const PLACEHOLDER = /#([A-Za-z_][A-Za-z0-9_]*)#/g;

const Literal = (text: string): LiteralNode => ({ kind: "literal", text });
const Ref = (name: string): ReferenceNode => ({ kind: "reference", name });
const Sequence = (parts: AstNode[]): AstNode => parts.length === 1 ? parts[0] : ({ kind: "sequence", parts });
const Alternation = (options: AstNode[]): AlternationNode => ({ kind: "alternation", options });

export class GrammarEngine {
  // private readonly sourceRules: Grammar;
  private readonly ruleAst: Record<string, AlternationNode>;

  constructor(rules: Grammar) {
    // this.sourceRules = rules;
    this.ruleAst = Object.fromEntries(
      Object.entries(rules).map(([name, templates]) => [name, Alternation(templates.map(this.parseTemplate))])
    );
  }

  // Parse a template like "#NP# eats #OP#"
  private parseTemplate = (template: string): AstNode => {
    const parts: AstNode[] = [];
    let last = 0;
    for (const match of template.matchAll(PLACEHOLDER)) {
      const idx = match.index ?? 0;
      if (idx > last) {
        const text = template.slice(last, idx);
        if (text) parts.push(Literal(text));
      }
      parts.push(Ref(match[1]));
      last = idx + match[0].length;
    }
    if (last < template.length) parts.push(Literal(template.slice(last)));
    return Sequence(parts);
  };

  // Render a node back to a pattern string with #Nonterm# placeholders
  private renderPattern = (node: AstNode): string => {
    switch (node.kind) {
      case "literal": return node.text;
      case "reference": return `#${node.name}#`;
      case "sequence": return node.parts.map(this.renderPattern).join("");
      case "alternation": return node.options.length ? this.renderPattern(node.options[0]) : "";
    }
  };

  // Human friendly label for a chosen alternative
  private choiceLabel = (node: AstNode): string => {
    if (node.kind === "reference") return node.name; // single ref like SVO
    const pattern = this.renderPattern(node);
    const onlyRef = /^#([A-Za-z_][A-Za-z0-9_]*)#$/.exec(pattern)?.[1];
    return onlyRef ?? pattern;
  };

  // Apply constraints to an alternation under a rule name
  private applyConstraints = (ruleName: string, alt: AlternationNode, constraints?: Constraints): AlternationNode => {
    if (!constraints || !(ruleName in constraints)) return alt;
    const required = constraints[ruleName];
    const allowed = new Set(Array.isArray(required) ? required : [required]);

    const filtered = alt.options.filter(option => {
      const pat = this.renderPattern(option);
      if (allowed.has(pat)) return true;
      if (option.kind === "reference" && allowed.has(option.name)) return true;
      const onlyRef = /^#([A-Za-z_][A-Za-z0-9_]*)#$/.exec(pat)?.[1];
      return onlyRef ? allowed.has(onlyRef) : false;
    });
    if (!filtered.length) throw new Error(`Constraint eliminates all options of rule "${ruleName}"`);
    return Alternation(filtered);
  };

  // -------- Exact counting --------
  countStrings(start = "origin", constraints?: Constraints, maxDepth = Infinity): number {
    const memo = new Map<string, number>();
    const key = (node: AstNode, depth: number) => `${depth}|${this.renderPattern(node)}`;

    const count = (node: AstNode, depth: number): number => {
      if (depth < 0) return 0;
      const k = key(node, depth);
      if (memo.has(k)) return memo.get(k)!;

      let total: number;
      switch (node.kind) {
        case "literal": total = 1; break;
        case "reference":
          total = count(this.applyConstraints(node.name, this.ruleAst[node.name], constraints), depth - 1);
          break;
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
  generate(start = "origin", constraints?: Constraints, maxDepth = Infinity, rng: () => number = Math.random): Generated {
    const memo = new Map<string, number>();
    const key = (node: AstNode, depth: number) => `${depth}|${this.renderPattern(node)}`;

    const count = (node: AstNode, depth: number): number => {
      if (depth < 0) return 0;
      const k = key(node, depth);
      if (memo.has(k)) return memo.get(k)!;
      let v = 0;
      if (node.kind === "literal") v = 1;
      else if (node.kind === "reference") v = count(this.applyConstraints(node.name, this.ruleAst[node.name], constraints), depth - 1);
      else if (node.kind === "sequence") v = node.parts.reduce((p, c) => p * count(c, depth), 1);
      else v = node.options.reduce((s, c) => s + count(c, depth), 0);
      memo.set(k, v);
      return v;
    };

    const trace: Trace = {};
    const addTrace = (rule: string, label: string) => {
      (trace[rule] ??= []).push(label);
    };

    const buildFromRule = (ruleName: string, depth: number): string => {
      const alt = this.applyConstraints(ruleName, this.ruleAst[ruleName], constraints);
      const weights = alt.options.map(o => count(o, depth));
      const total = weights.reduce((a, b) => a + b, 0);
      if (!total) return "";
      let pick = Math.floor(rng() * total);
      let chosen = alt.options[0];
      for (let i = 0; i < alt.options.length; i++) {
        if (pick < weights[i]) { chosen = alt.options[i]; break; }
        pick -= weights[i];
      }
      addTrace(ruleName, this.choiceLabel(chosen));
      return buildNode(chosen, depth);
    };

    const buildNode = (node: AstNode, depth: number): string => {
      if (depth < 0) return "";
      switch (node.kind) {
        case "literal": return node.text;
        case "reference": return buildFromRule(node.name, depth - 1);
        case "sequence": return node.parts.map(p => buildNode(p, depth)).join("");
        case "alternation": throw new Error("Alternation nodes occur only at rule roots");
      }
    };

    const depth = isFinite(maxDepth) ? maxDepth : 1e9;
    const text = buildFromRule(start, depth);
    return { text, trace };
  }

  // Generate n results - optionally unique by text
  generateMany(n: number, start = "origin", constraints?: Constraints, unique = false, maxDepth = Infinity): Generated[] {
    if (!unique) return Array.from({ length: n }, () => this.generate(start, constraints, maxDepth));
    const seen = new Set<string>();
    const results: Generated[] = [];
    const limit = this.countStrings(start, constraints, maxDepth);
    while (results.length < Math.min(n, limit)) {
      const g = this.generate(start, constraints, maxDepth);
      if (!seen.has(g.text)) {
        seen.add(g.text);
        results.push(g);
      }
    }
    return results;
  }

  // -------- Full expansion with metadata --------
  expandAll(start = "origin", constraints?: Constraints, maxDepth = Infinity, cap = Infinity): Generated[] {
    const depth = isFinite(maxDepth) ? maxDepth : 1e9;

    const mergeTraces = (left: Trace, right: Trace): Trace => {
      const out: Trace = {};
      // clone arrays from left
      for (const [k, v] of Object.entries(left)) out[k] = [...v];
      // append clones from right
      for (const [k, v] of Object.entries(right)) (out[k] ??= []).push(...v);
      return out;
    };

    const expandFromRule = (ruleName: string, d: number): Generated[] => {
      const alt = this.applyConstraints(ruleName, this.ruleAst[ruleName], constraints);
      const results: Generated[] = [];
      for (const option of alt.options) {
        const tail = expandNode(option, d);
        const label = this.choiceLabel(option);
        for (const t of tail) {
          results.push({
            text: t.text,
            trace: mergeTraces({ [ruleName]: [label] }, t.trace),
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
          return [{ text: node.text, trace: {} }];
        case "reference":
          return expandFromRule(node.name, d - 1);
        case "sequence": {
          return node.parts.reduce<Generated[]>((acc, part) => {
            const right = expandNode(part, d);
            const merged: Generated[] = [];
            for (const left of acc) {
              for (const r of right) {
                merged.push({
                  text: left.text + r.text,
                  trace: mergeTraces(left.trace, r.trace),
                });
                if (merged.length >= cap) return merged;
              }
            }
            return merged;
          }, [{ text: "", trace: {} }]);
        }
        case "alternation":
          throw new Error("Alternation nodes occur only at rule roots");
      }
    };

    const results = expandFromRule(start, depth);
    return results;
  }
}
