/**
 * Graph helpers for grammar visualization. Regex must stay in sync with Engine.ts parseTemplate.
 */

import type { GrammarRule } from './types';
import { FULL_PLACEHOLDER, parsePlaceholderInner } from './placeholderParse';

/** Same pattern as Engine.ts — keep in sync */
export { FULL_PLACEHOLDER as GRAMMAR_PLACEHOLDER };

/**
 * All rule names referenced by #name# or #name.mod# in a template (order of first occurrence).
 */
export function extractRefNamesFromTemplate(template: string): string[] {
  const names: string[] = [];
  for (const m of template.matchAll(FULL_PLACEHOLDER)) {
    try {
      names.push(parsePlaceholderInner(m[1]!).ruleName);
    } catch {
      // skip invalid tags
    }
  }
  return names;
}

/**
 * Static = no #symbol# placeholders (literals only, including empty).
 */
export function isStaticAlternative(template: string): boolean {
  return extractRefNamesFromTemplate(template).length === 0;
}

/**
 * Stable signature for graph layout (dagre): rule keys, alternative counts, and #ref# sets per line.
 * Editing literals only keeps the same fingerprint so layout can be debounced while typing.
 */
export function grammarLayoutFingerprint(grammar: GrammarRule): string {
  const keys = Object.keys(grammar).sort();
  const lines: string[] = [];
  for (const k of keys) {
    const alts = grammar[k] ?? [];
    const altParts = alts.map((a) => {
      const refs = extractRefNamesFromTemplate(a);
      return [...refs].sort().join('\u001f');
    });
    lines.push(`${k}\u001e${alts.length}\u001e${altParts.join('\u001d')}`);
  }
  return lines.join('\u0001');
}

export type GrammarEdge = { source: string; target: string };

/**
 * Directed edges for symbols that appear both as keys and as #ref# in another rule.
 */
export function buildEdges(grammar: GrammarRule): GrammarEdge[] {
  const keys = new Set(Object.keys(grammar));
  const out: GrammarEdge[] = [];
  const seen = new Set<string>();

  for (const [fromSymbol, alts] of Object.entries(grammar)) {
    for (const alt of alts) {
      for (const ref of extractRefNamesFromTemplate(alt)) {
        if (!keys.has(ref)) continue;
        const id = `${fromSymbol}\0${ref}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ source: fromSymbol, target: ref });
      }
    }
  }
  return out;
}

/**
 * Refs in templates that do not exist as keys (possible typos).
 */
export function findMissingRefs(grammar: GrammarRule): string[] {
  const keys = new Set(Object.keys(grammar));
  const missing = new Set<string>();
  for (const alts of Object.values(grammar)) {
    for (const alt of alts) {
      for (const ref of extractRefNamesFromTemplate(alt)) {
        if (!keys.has(ref)) missing.add(ref);
      }
    }
  }
  return [...missing].sort();
}

/**
 * Unique key for a new rule (e.g. rule, rule_1, rule_2).
 */
export function generateUniqueRuleName(grammar: GrammarRule, base = 'rule'): string {
  if (!(base in grammar)) return base;
  let i = 1;
  while (`${base}_${i}` in grammar) i += 1;
  return `${base}_${i}`;
}

/** Same identifier rule as placeholderParse rule name */
export function isValidSymbolName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Collect every symbol name referenced via #name# anywhere in the grammar.
 */
export function collectAllReferencedSymbols(grammar: GrammarRule): Set<string> {
  const refs = new Set<string>();
  for (const alts of Object.values(grammar)) {
    for (const alt of alts) {
      for (const name of extractRefNamesFromTemplate(alt)) {
        refs.add(name);
      }
    }
  }
  return refs;
}

/**
 * For each #symbol# used in any template, ensure grammar has that key (empty rule by default).
 * Call after edits so new references create nodes automatically.
 */
export function ensureRulesForReferences(grammar: GrammarRule): GrammarRule {
  const refs = collectAllReferencedSymbols(grammar);
  const next = { ...grammar };
  for (const name of refs) {
    if (!(name in next)) {
      next[name] = [''];
    }
  }
  return next;
}

/**
 * Rename a rule key and replace #oldName# with #newName# in every alternative string.
 * Does not merge if newName already exists as a different rule.
 */
export function renameRule(grammar: GrammarRule, oldName: string, newName: string): GrammarRule {
  const trimmed = newName.trim();
  if (oldName === trimmed) return grammar;
  if (!isValidSymbolName(trimmed)) {
    throw new Error('Invalid symbol name (use letters, digits, underscore; must not start with a digit)');
  }
  if (!(oldName in grammar)) return grammar;
  if (trimmed in grammar) {
    throw new Error(`A rule named "${trimmed}" already exists`);
  }

  const reExact = new RegExp(`#${escapeRegExp(oldName)}#`, 'g');
  const reDotted = new RegExp(`#${escapeRegExp(oldName)}\\.`, 'g');
  const next: GrammarRule = {};

  const rewrite = (s: string) =>
    s.replace(reDotted, `#${trimmed}.`).replace(reExact, `#${trimmed}#`);

  for (const [k, v] of Object.entries(grammar)) {
    if (k === oldName) continue;
    next[k] = v.map(rewrite);
  }
  next[trimmed] = grammar[oldName]!.map(rewrite);
  return next;
}
