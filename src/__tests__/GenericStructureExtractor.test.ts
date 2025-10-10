import { GenericStructureExtractor } from '../GenericStructureExtractor';
import { AppliedRule } from '../types';

describe('GenericStructureExtractor', () => {
  let extractor: GenericStructureExtractor;

  beforeEach(() => {
    extractor = new GenericStructureExtractor();
  });

  describe('Basic Structure Extraction', () => {
    test('should extract basic properties from result', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'test',
          selectedRule: 'hello world',
          result: 'hello world',
          depth: 0,
          alternatives: ['hello world'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.length).toBe(11);
      expect(structure.wordCount).toBe(2);
      expect(structure.extractedAt).toBeDefined();
      expect(structure.extractor).toBe('GenericStructureExtractor');
    });

    test('should extract references from rules', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'sentence',
          selectedRule: '#subject# #verb# #object#',
          result: 'The cat runs',
          depth: 0,
          alternatives: ['#subject# #verb# #object#'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.references).toEqual(['subject', 'verb', 'object']);
    });

    test('should extract sequence from rules', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'sentence',
          selectedRule: '#SP# #VP# #OP#',
          result: 'The cat runs',
          depth: 0,
          alternatives: ['#SP# #VP# #OP#'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.sequence).toEqual(['SP', 'VP', 'OP']);
    });
  });

  describe('Pattern Extraction', () => {
    test('should extract uppercase patterns', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'order',
          selectedRule: 'SVO pattern',
          result: 'SVO pattern',
          depth: 0,
          alternatives: ['SVO pattern'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.patterns).toEqual(['SVO']);
    });

    test('should extract quoted strings', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'text',
          selectedRule: '"hello" world "test"',
          result: '"hello" world "test"',
          depth: 0,
          alternatives: ['"hello" world "test"'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.quotedValues).toEqual(['hello', 'test']);
    });

    test('should extract numeric values', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'math',
          selectedRule: '1 + 2 = 3',
          result: '1 + 2 = 3',
          depth: 0,
          alternatives: ['1 + 2 = 3'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.numericValues).toEqual([1, 2, 3]);
    });

    test('should extract operators', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'math',
          selectedRule: '1 + 2 * 3 - 4',
          result: '1 + 2 * 3 - 4',
          depth: 0,
          alternatives: ['1 + 2 * 3 - 4'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.operators).toEqual(['+', '*', '-']);
    });

    test('should detect parentheses', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'expression',
          selectedRule: '(1 + 2) * 3',
          result: '(1 + 2) * 3',
          depth: 0,
          alternatives: ['(1 + 2) * 3'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.hasParentheses).toBe(true);
    });

    test('should detect brackets', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'array',
          selectedRule: '[1, 2, 3]',
          result: '[1, 2, 3]',
          depth: 0,
          alternatives: ['[1, 2, 3]'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.hasBrackets).toBe(true);
    });
  });

  describe('Text Properties', () => {
    test('should detect capital start', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'sentence',
          selectedRule: 'Hello world',
          result: 'Hello world',
          depth: 0,
          alternatives: ['Hello world'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.startsWithCapital).toBe(true);
    });

    test('should detect punctuation end', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'sentence',
          selectedRule: 'Hello world!',
          result: 'Hello world!',
          depth: 0,
          alternatives: ['Hello world!'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.endsWithPunctuation).toBe(true);
    });
  });

  describe('Multiple Rules', () => {
    test('should combine structure from multiple rules', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'subject',
          selectedRule: 'The cat',
          result: 'The cat',
          depth: 1,
          alternatives: ['The cat'],
          timestamp: Date.now()
        },
        {
          symbol: 'verb',
          selectedRule: 'runs',
          result: 'runs',
          depth: 1,
          alternatives: ['runs', 'walks'],
          timestamp: Date.now()
        },
        {
          symbol: 'sentence',
          selectedRule: '#subject# #verb#',
          result: 'The cat runs',
          depth: 0,
          alternatives: ['#subject# #verb#'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.length).toBe(12); // From final result "The cat runs"
      expect(structure.wordCount).toBe(3); // From final result
      expect(structure.references).toEqual(['subject', 'verb']); // From sentence rule
      expect(structure.sequence).toEqual(['subject', 'verb']); // From sentence rule
    });
  });

  describe('Empty and Edge Cases', () => {
    test('should handle empty rules', () => {
      const appliedRules: AppliedRule[] = [];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.extractedAt).toBeDefined();
      expect(structure.extractor).toBe('GenericStructureExtractor');
    });

    test('should handle rules with no patterns', () => {
      const appliedRules: AppliedRule[] = [
        {
          symbol: 'simple',
          selectedRule: 'simple text',
          result: 'simple text',
          depth: 0,
          alternatives: ['simple text'],
          timestamp: Date.now()
        }
      ];

      const structure = extractor.extractStructure(appliedRules);

      expect(structure.length).toBe(11);
      expect(structure.wordCount).toBe(2);
      expect(structure.extractedAt).toBeDefined();
    });
  });
});
