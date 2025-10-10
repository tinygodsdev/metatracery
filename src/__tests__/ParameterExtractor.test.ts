import { ParameterExtractor } from '../ParameterExtractor';
import { GrammarRule } from '../types';

describe('ParameterExtractor', () => {
  let extractor: ParameterExtractor;

  beforeEach(() => {
    extractor = new ParameterExtractor();
  });

  describe('Parameter Detection', () => {
    test('should detect symbols with multiple alternatives as parameters', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog", "bird"],
        "color": ["red", "blue"],
        "single": ["only_one"]
      };

      const parameters = extractor.extractParameters(grammar);

      expect(parameters.animal).toBeDefined();
      expect(parameters.animal.isParameter).toBe(true);
      expect(parameters.animal.values).toEqual(['cat', 'dog', 'bird']);

      expect(parameters.color).toBeDefined();
      expect(parameters.color.isParameter).toBe(true);
      expect(parameters.color.values).toEqual(['red', 'blue']);

      // Single alternative should not be a parameter
      expect(parameters.single).toBeUndefined();
    });

    test('should detect symbols that reference parameter symbols', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog"],
        "sentence": ["The #animal# is cute"]
      };

      const parameters = extractor.extractParameters(grammar);

      expect(parameters.animal).toBeDefined();
      expect(parameters.animal.isParameter).toBe(true);

      // sentence should be a parameter because it references animal
      expect(parameters.sentence).toBeDefined();
      expect(parameters.sentence.isParameter).toBe(true);
    });

    test('should not detect symbols with single non-parameter references', () => {
      const grammar: GrammarRule = {
        "animal": ["cat"],
        "sentence": ["The #animal# is cute"]
      };

      const parameters = extractor.extractParameters(grammar);

      expect(parameters.animal).toBeUndefined(); // Single alternative
      expect(parameters.sentence).toBeUndefined(); // References non-parameter
    });
  });

  describe('Combination Generation', () => {
    test('should generate all parameter combinations', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog"],
        "color": ["red", "blue"]
      };

      const parameters = extractor.extractParameters(grammar);
      const combinations = extractor.getAllParameterCombinations(parameters);

      expect(combinations).toHaveLength(4); // 2 × 2
      expect(combinations).toContainEqual({ animal: 'cat', color: 'red' });
      expect(combinations).toContainEqual({ animal: 'cat', color: 'blue' });
      expect(combinations).toContainEqual({ animal: 'dog', color: 'red' });
      expect(combinations).toContainEqual({ animal: 'dog', color: 'blue' });
    });

    test('should handle single parameter', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog", "bird"]
      };

      const parameters = extractor.extractParameters(grammar);
      const combinations = extractor.getAllParameterCombinations(parameters);

      expect(combinations).toHaveLength(3);
      expect(combinations).toContainEqual({ animal: 'cat' });
      expect(combinations).toContainEqual({ animal: 'dog' });
      expect(combinations).toContainEqual({ animal: 'bird' });
    });

    test('should handle empty parameters', () => {
      const grammar: GrammarRule = {
        "single": ["only_one"]
      };

      const parameters = extractor.extractParameters(grammar);
      const combinations = extractor.getAllParameterCombinations(parameters);

      // When there are no parameters, we get one empty combination
      expect(combinations).toHaveLength(1);
      expect(combinations[0]).toEqual({});
    });
  });

  describe('Parameter Filtering', () => {
    test('should filter by required parameters', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog", "bird"],
        "color": ["red", "blue", "green"]
      };

      const parameters = extractor.extractParameters(grammar);
      const filtered = extractor.filterParameters(parameters, {
        required: { animal: 'cat' }
      });

      expect(filtered.animal.values).toEqual(['cat']);
      expect(filtered.color.values).toEqual(['red', 'blue', 'green']);
    });

    test('should filter by excluded parameters', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog", "bird"],
        "color": ["red", "blue", "green"]
      };

      const parameters = extractor.extractParameters(grammar);
      const filtered = extractor.filterParameters(parameters, {
        excluded: { animal: ['bird'], color: ['green'] }
      });

      expect(filtered.animal.values).toEqual(['cat', 'dog']);
      expect(filtered.color.values).toEqual(['red', 'blue']);
    });

    test('should combine required and excluded filters', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog", "bird"],
        "color": ["red", "blue", "green"]
      };

      const parameters = extractor.extractParameters(grammar);
      const filtered = extractor.filterParameters(parameters, {
        required: { animal: 'cat' },
        excluded: { color: ['green'] }
      });

      expect(filtered.animal.values).toEqual(['cat']);
      expect(filtered.color.values).toEqual(['red', 'blue']);
    });
  });

  describe('Contextual Parameters', () => {
    test('should extract contextual parameters', () => {
      const grammar: GrammarRule = {
        "SP": ["#NP#"],
        "OP": ["#NP#"],
        "NP": ["girl", "cat"],
        "SVO": ["#SP# #VP# #OP#"]
      };

      const contexts = extractor.extractContextualParameters(grammar);

      expect(contexts.NP).toBeDefined();
      expect(contexts.NP).toContain('SP');
      expect(contexts.NP).toContain('OP');
      // NP is referenced in SVO rule, but SVO itself doesn't reference NP directly
      // The context extraction looks at direct references, not transitive ones

      expect(contexts.SP).toBeDefined();
      expect(contexts.SP).toContain('SVO');
    });

    test('should handle symbols with no contexts', () => {
      const grammar: GrammarRule = {
        "animal": ["cat", "dog"],
        "sentence": ["The animal is cute"]
      };

      const contexts = extractor.extractContextualParameters(grammar);

      expect(contexts.animal).toBeUndefined();
      expect(contexts.sentence).toBeUndefined();
    });
  });
});
