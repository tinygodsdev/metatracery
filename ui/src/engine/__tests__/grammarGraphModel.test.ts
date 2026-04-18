import {
  extractRefNamesFromTemplate,
  isStaticAlternative,
  buildEdges,
  findMissingRefs,
  generateUniqueRuleName,
  ensureRulesForReferences,
  renameRule,
  isValidSymbolName,
  grammarLayoutFingerprint,
} from '../grammarGraphModel';

describe('grammarGraphModel', () => {
  test('extractRefNamesFromTemplate preserves order', () => {
    expect(extractRefNamesFromTemplate('#A# x #B#')).toEqual(['A', 'B']);
    expect(extractRefNamesFromTemplate('plain')).toEqual([]);
    expect(extractRefNamesFromTemplate('#word_order#')).toEqual(['word_order']);
  });

  test('extractRefNamesFromTemplate uses rule name only when modifiers present', () => {
    expect(extractRefNamesFromTemplate('#NP.capitalize#')).toEqual(['NP']);
    expect(extractRefNamesFromTemplate('#a# #b.s#')).toEqual(['a', 'b']);
  });

  test('isStaticAlternative', () => {
    expect(isStaticAlternative('girl')).toBe(true);
    expect(isStaticAlternative('hello world')).toBe(true);
    expect(isStaticAlternative('')).toBe(true);
    expect(isStaticAlternative('#NP#')).toBe(false);
    expect(isStaticAlternative('a #b# c')).toBe(false);
  });

  test('buildEdges dedupes and skips missing keys', () => {
    const g = {
      origin: ['#a#'],
      a: ['#b#', 'lit'],
      b: ['x'],
    };
    expect(buildEdges(g)).toEqual(
      expect.arrayContaining([
        { source: 'origin', target: 'a' },
        { source: 'a', target: 'b' },
      ]),
    );
    expect(buildEdges(g).length).toBe(2);
  });

  test('findMissingRefs', () => {
    const g = {
      origin: ['#ghost#'],
      a: ['ok'],
    };
    expect(findMissingRefs(g)).toEqual(['ghost']);
  });

  test('generateUniqueRuleName', () => {
    expect(generateUniqueRuleName({})).toBe('rule');
    expect(generateUniqueRuleName({ rule: [''] })).toBe('rule_1');
    expect(generateUniqueRuleName({ rule: [''], rule_1: [''] })).toBe('rule_2');
  });

  test('ensureRulesForReferences', () => {
    const g = { origin: ['#a#'], b: ['x'] };
    const out = ensureRulesForReferences(g);
    expect(out.a).toEqual(['']);
    expect(out.origin).toEqual(['#a#']);
    expect(out.b).toEqual(['x']);
  });

  test('renameRule updates keys and templates', () => {
    const g = {
      origin: ['#NP#'],
      NP: ['girl'],
    };
    const out = renameRule(g, 'NP', 'NounPhrase');
    expect(out.origin).toEqual(['#NounPhrase#']);
    expect(out.NounPhrase).toEqual(['girl']);
    expect(out.NP).toBeUndefined();
  });

  test('renameRule updates dotted placeholders', () => {
    const g = {
      origin: ['#NP.a#'],
      NP: ['x'],
    };
    const out = renameRule(g, 'NP', 'NounPhrase');
    expect(out.origin).toEqual(['#NounPhrase.a#']);
    expect(out.NounPhrase).toEqual(['x']);
  });

  test('isValidSymbolName', () => {
    expect(isValidSymbolName('NP')).toBe(true);
    expect(isValidSymbolName('rule_1')).toBe(true);
    expect(isValidSymbolName('1a')).toBe(false);
    expect(isValidSymbolName('a-b')).toBe(false);
  });

  test('grammarLayoutFingerprint ignores literal-only edits', () => {
    const a = { origin: ['hello'], NP: ['x'] };
    const b = { origin: ['hello world'], NP: ['x'] };
    expect(grammarLayoutFingerprint(a)).toBe(grammarLayoutFingerprint(b));
  });

  test('grammarLayoutFingerprint changes when refs or structure change', () => {
    const a = { origin: ['#NP#'], NP: ['a'] };
    const b = { origin: ['#VP#'], NP: ['a'] };
    expect(grammarLayoutFingerprint(a)).not.toBe(grammarLayoutFingerprint(b));

    const oneAlt = { origin: ['x'], NP: ['a'] };
    const twoAlts = { origin: ['x', 'y'], NP: ['a'] };
    expect(grammarLayoutFingerprint(oneAlt)).not.toBe(grammarLayoutFingerprint(twoAlts));
  });
});
