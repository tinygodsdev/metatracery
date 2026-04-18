/**
 * Tracery-compatible English string modifiers (ported from tracery.js baseEngModifiers).
 */

export type ModifierFn = (s: string, params: string[]) => string;

function isVowel(c: string): boolean {
  const c2 = c.toLowerCase();
  return c2 === "a" || c2 === "e" || c2 === "i" || c2 === "o" || c2 === "u";
}

function isAlphaNum(c: string): boolean {
  return (
    (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    (c >= "0" && c <= "9")
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
}

export const DEFAULT_ENGLISH_MODIFIERS: Record<string, ModifierFn> = {
  replace(s, params) {
    return s.replace(new RegExp(escapeRegExp(params[0] ?? ""), "g"), params[1] ?? "");
  },

  capitalizeAll(s) {
    let s2 = "";
    let capNext = true;
    for (let i = 0; i < s.length; i++) {
      if (!isAlphaNum(s.charAt(i))) {
        capNext = true;
        s2 += s.charAt(i);
      } else if (!capNext) {
        s2 += s.charAt(i);
      } else {
        s2 += s.charAt(i).toUpperCase();
        capNext = false;
      }
    }
    return s2;
  },

  capitalize(s) {
    return s.charAt(0).toUpperCase() + s.substring(1);
  },

  a(s) {
    if (s.length > 0) {
      if (s.charAt(0).toLowerCase() === "u") {
        if (s.length > 2 && s.charAt(2).toLowerCase() === "i") {
          return `a ${s}`;
        }
      }
      if (isVowel(s.charAt(0))) {
        return `an ${s}`;
      }
    }
    return `a ${s}`;
  },

  firstS(s) {
    const s2 = s.split(" ");
    if (s2.length === 0) return s;
    return `${DEFAULT_ENGLISH_MODIFIERS.s(s2[0]!, [])} ${s2.slice(1).join(" ")}`.trimEnd();
  },

  s(s) {
    const last = s.charAt(s.length - 1);
    switch (last) {
      case "s":
      case "h":
      case "x":
        return `${s}es`;
      case "y":
        if (!isVowel(s.charAt(s.length - 2))) {
          return s.substring(0, s.length - 1) + "ies";
        }
        return `${s}s`;
      default:
        return `${s}s`;
    }
  },

  ed(s) {
    const last = s.charAt(s.length - 1);
    switch (last) {
      case "s":
        return `${s}ed`;
      case "e":
        return `${s}d`;
      case "h":
      case "x":
        return `${s}ed`;
      case "y":
        if (!isVowel(s.charAt(s.length - 2))) {
          return s.substring(0, s.length - 1) + "ied";
        }
        return `${s}d`;
      default:
        return `${s}ed`;
    }
  },
};

/**
 * Parse one modifier segment: "capitalize" or "replace(a,b)".
 */
export function parseModifierSegment(segment: string): { name: string; params: string[] } {
  const open = segment.indexOf("(");
  if (open <= 0) {
    return { name: segment, params: [] };
  }
  const regExp = /\(([^)]+)\)/;
  const results = regExp.exec(segment);
  if (!results || results.length < 2) {
    return { name: segment.substring(0, open), params: [] };
  }
  const name = segment.substring(0, open);
  const params = results[1]!.split(",").map((p) => p.trim());
  return { name, params };
}

/**
 * Apply Tracery-style modifier chain left-to-right. Missing modifiers append ((.name)) like tracery.js.
 */
export function applyModifierPipeline(
  text: string,
  modifierSegments: string[],
  registry: Record<string, ModifierFn>,
): string {
  let out = text;
  for (const seg of modifierSegments) {
    const { name, params } = parseModifierSegment(seg);
    const mod = registry[name];
    if (!mod) {
      out += `((.${name}))`;
    } else {
      out = mod(out, params);
    }
  }
  return out;
}
