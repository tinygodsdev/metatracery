import {
  parseGrammarLibraryJson,
  createEmptyLibraryState,
  GRAMMAR_LIBRARY_VERSION,
} from './grammarLibraryStorage';

describe('parseGrammarLibraryJson', () => {
  it('parses valid payload', () => {
    const json = JSON.stringify({
      version: GRAMMAR_LIBRARY_VERSION,
      activeId: 'a',
      items: [
        {
          id: 'a',
          name: 'Test',
          updatedAt: '2020-01-01T00:00:00.000Z',
          grammar: { origin: ['x'] },
        },
      ],
    });
    const parsed = parseGrammarLibraryJson(json);
    expect(parsed).not.toBeNull();
    expect(parsed!.activeId).toBe('a');
    expect(parsed!.items).toHaveLength(1);
    expect(parsed!.items[0].grammar.origin).toEqual(['x']);
  });

  it('returns null for wrong version', () => {
    expect(parseGrammarLibraryJson(JSON.stringify({ version: 99, items: [], activeId: null }))).toBeNull();
  });

  it('returns null for invalid grammar shape', () => {
    const bad = JSON.stringify({
      version: GRAMMAR_LIBRARY_VERSION,
      activeId: null,
      items: [{ id: 'x', name: 'n', updatedAt: 't', grammar: { origin: [1] } }],
    });
    expect(parseGrammarLibraryJson(bad)).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(parseGrammarLibraryJson('not json')).toBeNull();
  });
});

describe('createEmptyLibraryState', () => {
  it('has empty items and null activeId', () => {
    const s = createEmptyLibraryState();
    expect(s.version).toBe(GRAMMAR_LIBRARY_VERSION);
    expect(s.items).toEqual([]);
    expect(s.activeId).toBeNull();
  });
});
