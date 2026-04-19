import {
  decodePlaceholderInner,
  parsePlaceholderInner,
  splitTemplateSegments,
} from '../placeholderParse';

describe('splitTemplateSegments', () => {
  test('splits placeholders and literals', () => {
    expect(splitTemplateSegments('a #x# b')).toEqual([
      { kind: 'literal', text: 'a ' },
      { kind: 'placeholder', innerRaw: 'x' },
      { kind: 'literal', text: ' b' },
    ]);
  });

  test('\\# and \\\\ outside placeholders', () => {
    expect(splitTemplateSegments(String.raw`a \# b`)).toEqual([{ kind: 'literal', text: 'a # b' }]);
    expect(splitTemplateSegments(String.raw`a \\ b`)).toEqual([{ kind: 'literal', text: 'a \\ b' }]);
  });

  test('escaped hash inside #…# does not close the placeholder early', () => {
    expect(splitTemplateSegments(String.raw`#a \# b#`)).toEqual([
      { kind: 'placeholder', innerRaw: String.raw`a \# b` },
    ]);
  });

  test('unclosed # is literal', () => {
    expect(splitTemplateSegments('#only')).toEqual([{ kind: 'literal', text: '#only' }]);
    expect(splitTemplateSegments('pre #mid')).toEqual([{ kind: 'literal', text: 'pre #mid' }]);
  });
});

describe('decodePlaceholderInner', () => {
  test('decodes escapes inside #…#', () => {
    expect(decodePlaceholderInner(String.raw`a\.b`)).toBe(String.raw`a.b`);
    expect(decodePlaceholderInner(String.raw`x\#y`)).toBe('x#y');
    expect(decodePlaceholderInner(String.raw`x\\y`)).toBe(String.raw`x\y`);
  });
});

describe('parsePlaceholderInner', () => {
  test('parses rule and modifiers', () => {
    expect(parsePlaceholderInner('NP')).toEqual({ ruleName: 'NP', modifierSegments: [] });
    expect(parsePlaceholderInner('NP.capitalize')).toEqual({
      ruleName: 'NP',
      modifierSegments: ['capitalize'],
    });
  });
});
