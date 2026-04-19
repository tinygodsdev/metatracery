import { GrammarEngine } from '../Engine';
import { GrammarProcessor } from '../GrammarEngine';

describe('GrammarEngine modifiers', () => {
  const grammar = {
    origin: ['#noun.a#'],
    noun: ['apple', 'cat'],
  };

  test('processModifiers false leaves expanded text without article', () => {
    const engine = new GrammarEngine(grammar);
    const g = engine.generate('origin', {}, Infinity, () => 0.5, 'uniform', false);
    expect(['apple', 'cat']).toContain(g.text);
  });

  test('processModifiers true applies a/an', () => {
    const engine = new GrammarEngine(grammar);
    const gApple = engine.generate('origin', {}, Infinity, () => 0, 'uniform', true);
    expect(gApple.text).toBe('an apple');
    expect(gApple.modifierApplications).toHaveLength(1);
    expect(gApple.modifierApplications![0]).toMatchObject({
      rule: 'noun',
      modifiers: ['a'],
      expandedText: 'apple',
      resultText: 'an apple',
    });
    const gCat = engine.generate('origin', {}, Infinity, () => 0.99, 'uniform', true);
    expect(gCat.text).toBe('a cat');
  });

  test('expandAll applies modifiers when flag true', () => {
    const engine = new GrammarEngine({
      origin: ['#w.capitalize#'],
      w: ['hello'],
    });
    const off = engine.expandAll('origin', {}, Infinity, Infinity, false);
    expect(off[0].text).toBe('hello');
    const on = engine.expandAll('origin', {}, Infinity, Infinity, true);
    expect(on[0].text).toBe('Hello');
    expect(on[0].modifierApplications).toHaveLength(1);
    expect(on[0].modifierApplications![0]).toMatchObject({
      rule: 'w',
      modifiers: ['capitalize'],
      expandedText: 'hello',
      resultText: 'Hello',
    });
  });
});

describe('GrammarProcessor processModifiers', () => {
  test('respects config flag', () => {
    const proc = new GrammarProcessor(
      {
        origin: ['#x.capitalize#'],
        x: ['hi'],
      },
      { processModifiers: true },
    );
    const r = proc.generateWithParameters('origin', {});
    expect(r.content).toBe('Hi');
    expect(r.metadata.modifierApplications).toHaveLength(1);
    expect(r.metadata.modifierApplications![0].rule).toBe('x');
    expect(r.metadata.modifierApplications![0].resultText).toBe('Hi');
  });
});
