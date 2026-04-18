import {
  DEFAULT_ENGLISH_MODIFIERS,
  applyModifierPipeline,
  parseModifierSegment,
} from "../baseEngModifiers";

describe("parseModifierSegment", () => {
  test("parses name without params", () => {
    expect(parseModifierSegment("capitalize")).toEqual({ name: "capitalize", params: [] });
  });

  test("parses replace with two params", () => {
    expect(parseModifierSegment("replace(hello,world)")).toEqual({
      name: "replace",
      params: ["hello", "world"],
    });
  });
});

describe("DEFAULT_ENGLISH_MODIFIERS", () => {
  const m = DEFAULT_ENGLISH_MODIFIERS;

  test("a: vowel start -> an", () => {
    expect(m.a("apple", [])).toBe("an apple");
  });

  test("a: consonant -> a", () => {
    expect(m.a("cat", [])).toBe("a cat");
  });

  test("a: u…i exception -> a", () => {
    expect(m.a("unicorn", [])).toBe("a unicorn");
  });

  test("capitalize", () => {
    expect(m.capitalize("hello", [])).toBe("Hello");
  });

  test("s: default plural", () => {
    expect(m.s("cat", [])).toBe("cats");
  });

  test("s: y after consonant -> ies", () => {
    expect(m.s("city", [])).toBe("cities");
  });

  test("replace", () => {
    expect(m.replace("a a a", ["a", "b"])).toBe("b b b");
  });

  test("ed: default", () => {
    expect(m.ed("walk", [])).toBe("walked");
  });

  test("ed: e ending", () => {
    expect(m.ed("love", [])).toBe("loved");
  });
});

describe("applyModifierPipeline", () => {
  test("applies chain in order", () => {
    const r = applyModifierPipeline("hello", ["capitalize"], DEFAULT_ENGLISH_MODIFIERS);
    expect(r).toBe("Hello");
  });

  test("marks missing modifier", () => {
    const r = applyModifierPipeline("x", ["unknownMod"], DEFAULT_ENGLISH_MODIFIERS);
    expect(r).toBe("x((.unknownMod))");
  });
});
