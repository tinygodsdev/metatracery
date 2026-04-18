/**
 * Tracery-style placeholders: #ruleName# or #ruleName.mod1.mod2# (modifiers after first dot).
 * Keep in sync with GrammarEngine.parseTemplate.
 */

/** Full tag: any non-# inside hashes */
export const FULL_PLACEHOLDER = /#([^#]+)#/g;

const RULE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Split inner content of #…# into rule name and modifier segments (Tracery: split by ".").
 */
export function parsePlaceholderInner(inner: string): { ruleName: string; modifierSegments: string[] } {
  if (!inner.trim()) {
    throw new Error("Empty placeholder");
  }
  const parts = inner.split(".");
  const ruleName = parts[0]!;
  if (!RULE_NAME.test(ruleName)) {
    throw new Error(`Invalid rule name in placeholder: "${ruleName}"`);
  }
  return { ruleName, modifierSegments: parts.slice(1) };
}
