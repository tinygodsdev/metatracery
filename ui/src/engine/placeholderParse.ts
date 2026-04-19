/**
 * Tracery-style placeholders: #ruleName# or #ruleName.mod1.mod2# (modifiers after first dot).
 *
 * Escapes (outside and inside #…#):
 * - `\#` — literal `#`
 * - `\\` — literal `\`
 * - any other `\x` — literal `x` (backslash dropped)
 *
 * Keep in sync with GrammarEngine.parseTemplate.
 */

/** @deprecated Use splitTemplateSegments — does not honor \\ or \\#. Kept for rare debugging only. */
export const FULL_PLACEHOLDER = /#([^#]+)#/g;

const RULE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export type TemplateSegment =
  | { kind: 'literal'; text: string }
  | { kind: 'placeholder'; innerRaw: string };

/**
 * Find index of closing `#` for a placeholder opened at `openIdx` (openIdx points at opening `#`).
 * Skips `\\` and `\#` pairs inside the inner region so they do not terminate the placeholder.
 */
function findClosingHash(template: string, openIdx: number): number {
  let j = openIdx + 1;
  while (j < template.length) {
    if (template[j] === '\\' && j + 1 < template.length) {
      j += 2;
      continue;
    }
    if (template[j] === '#') return j;
    j += 1;
  }
  return -1;
}

/**
 * Split a template into literal runs and #inner# placeholders (respects `\#` and `\\`).
 */
export function splitTemplateSegments(template: string): TemplateSegment[] {
  const out: TemplateSegment[] = [];
  let i = 0;
  let lit = '';

  const flushLit = () => {
    if (lit.length > 0) {
      out.push({ kind: 'literal', text: lit });
      lit = '';
    }
  };

  while (i < template.length) {
    const c = template[i]!;
    if (c === '\\' && i + 1 < template.length) {
      const n = template[i + 1]!;
      if (n === '#' || n === '\\') {
        lit += n === '#' ? '#' : '\\';
        i += 2;
        continue;
      }
      lit += n;
      i += 2;
      continue;
    }
    if (c === '#') {
      const close = findClosingHash(template, i);
      if (close < 0) {
        // No closing `#` — treat remainder as literal (same as naive #…# regex, which never matched this case)
        lit += template.slice(i);
        break;
      }
      const innerRaw = template.slice(i + 1, close);
      flushLit();
      out.push({ kind: 'placeholder', innerRaw });
      i = close + 1;
      continue;
    }
    lit += c;
    i += 1;
  }
  flushLit();
  return out;
}

/**
 * Decode `\#` and `\\` inside placeholder inner text (before splitting rule.modifiers).
 */
export function decodePlaceholderInner(raw: string): string {
  let result = '';
  let k = 0;
  while (k < raw.length) {
    if (raw[k] === '\\' && k + 1 < raw.length) {
      const n = raw[k + 1]!;
      if (n === '#' || n === '\\') {
        result += n === '#' ? '#' : '\\';
        k += 2;
        continue;
      }
      result += n;
      k += 2;
      continue;
    }
    result += raw[k]!;
    k += 1;
  }
  return result;
}

/**
 * Split inner content of #…# into rule name and modifier segments (Tracery: split by ".").
 */
export function parsePlaceholderInner(inner: string): { ruleName: string; modifierSegments: string[] } {
  if (!inner.trim()) {
    throw new Error('Empty placeholder');
  }
  const parts = inner.split('.');
  const ruleName = parts[0]!;
  if (!RULE_NAME.test(ruleName)) {
    throw new Error(`Invalid rule name in placeholder: "${ruleName}"`);
  }
  return { ruleName, modifierSegments: parts.slice(1) };
}
