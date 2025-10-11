import { GrammarEngine } from '../GrammarEngine';
import { GrammarRule } from '../types';

describe('GrammarEngine', () => {
  let engine: GrammarEngine;
  let testGrammar: GrammarRule;

  beforeEach(() => {
    testGrammar = {
      "SP": ["#NP#"],
      "OP": ["#NP#"],
      "NP": ["girl", "cat"],
      "VP": ["loves", "eats", "pets"],
      "SVO": ["#SP# #VP# #OP#"],
      "VSO": ["#VP# #SP# #OP#"],
      "word_order": ["#SVO#", "#VSO#"],
      "origin": ["#word_order#"]
    };
    engine = new GrammarEngine(testGrammar);
  });

  describe('Parameter Extraction', () => {
    test('should extract parameters from grammar', () => {
      const parameters = engine.getParameters();
      
      expect(parameters).toBeDefined();
      expect(parameters.NP).toBeDefined();
      expect(parameters.NP.values).toEqual(['girl', 'cat']);
      expect(parameters.NP.isParameter).toBe(true);
      
      expect(parameters.VP).toBeDefined();
      expect(parameters.VP.values).toEqual(['loves', 'eats', 'pets']);
      expect(parameters.VP.isParameter).toBe(true);
      
      expect(parameters.word_order).toBeDefined();
      expect(parameters.word_order.values).toEqual(['#SVO#', '#VSO#']);
      expect(parameters.word_order.isParameter).toBe(true);
    });

    test('should extract symbols that reference parameter symbols', () => {
      const parameters = engine.getParameters();
      
      // SP and OP should be parameters because they reference NP (which is a parameter)
      expect(parameters.SP).toBeDefined();
      expect(parameters.SP.isParameter).toBe(true);
      expect(parameters.OP).toBeDefined();
      expect(parameters.OP.isParameter).toBe(true);
    });
  });

  describe('Generation with Parameters', () => {
    test('should generate with specific parameters', () => {
      const result = engine.generateWithParameters('#origin#', {
        word_order: '#SVO#',
        NP: 'girl',
        VP: 'loves'
      });

      expect(result.content).toBe('girl loves girl');
      expect(result.metadata.parameters.word_order).toBe('#SVO#');
      expect(result.metadata.parameters.NP).toBe('girl');
      expect(result.metadata.parameters.VP).toBe('loves');
    });

    test('should generate with VSO order', () => {
      const result = engine.generateWithParameters('#origin#', {
        word_order: '#VSO#',
        NP: 'cat',
        VP: 'eats'
      });

      expect(result.content).toBe('eats cat cat');
      expect(result.metadata.parameters.word_order).toBe('#VSO#');
    });

    test('should track applied rules', () => {
      const result = engine.generateWithParameters('#origin#', {
        word_order: '#SVO#',
        NP: 'girl',
        VP: 'loves'
      });

      expect(result.metadata.appliedRules).toBeDefined();
      expect(result.metadata.appliedRules.length).toBeGreaterThan(0);
      
      // Check that we have rules for key symbols
      const symbols = result.metadata.appliedRules.map(rule => rule.symbol);
      expect(symbols).toContain('origin');
      expect(symbols).toContain('word_order');
      expect(symbols).toContain('SVO');
    });

    test('should track generation path', () => {
      const result = engine.generateWithParameters('#origin#', {
        word_order: '#SVO#',
        NP: 'girl',
        VP: 'loves'
      });

      expect(result.metadata.generationPath).toBeDefined();
      expect(result.metadata.generationPath.length).toBeGreaterThan(0);
      expect(result.metadata.generationPath[0]).toBe('origin');
    });
  });

  describe('All Combinations Generation', () => {
    test('should generate all possible combinations', () => {
      const results = engine.generateAllCombinations('#origin#');
      
      expect(results).toBeDefined();
      expect(results.length).toBe(12); // 2 word_order × 2 NP × 3 VP × 2 NP
      
      // Check that all results have content
      results.forEach(result => {
        expect(result.content).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.metadata.parameters).toBeDefined();
      });
    });

    test('should include both SVO and VSO orders in combinations', () => {
      const results = engine.generateAllCombinations('#origin#');
      
      const svoResults = results.filter(r => r.metadata.parameters.word_order === '#SVO#');
      const vsoResults = results.filter(r => r.metadata.parameters.word_order === '#VSO#');
      
      expect(svoResults.length).toBeGreaterThan(0);
      expect(vsoResults.length).toBeGreaterThan(0);
      expect(svoResults.length + vsoResults.length).toBe(results.length);
    });
  });

  describe('Parameter Matrix Generation', () => {
    test('should generate parameter matrix', () => {
      const matrix = engine.generateParameterMatrix('#origin#', {
        word_order: ['#SVO#', '#VSO#'],
        VP: ['loves', 'eats']
      });

      expect(matrix).toBeDefined();
      expect(matrix.length).toBe(2); // 2 word_order values
      expect(matrix[0].length).toBe(2); // 2 VP values
      expect(matrix[1].length).toBe(2); // 2 VP values
    });

    test('should have correct matrix dimensions', () => {
      const matrix = engine.generateParameterMatrix('#origin#', {
        word_order: ['#SVO#', '#VSO#'],
        VP: ['loves', 'eats', 'pets']
      });

      expect(matrix.length).toBe(2); // 2 word_order values
      expect(matrix[0].length).toBe(3); // 3 VP values
      expect(matrix[1].length).toBe(3); // 3 VP values
    });
  });

  describe('Statistics', () => {
    test('should calculate correct statistics', () => {
      const stats = engine.getParameterStatistics();
      
      expect(stats.totalVariants).toBe(12); // 2 × 2 × 3 × 2
      expect(stats.parameterCounts).toBeDefined();
      expect(stats.parameterCounts.NP).toBeDefined();
      expect(stats.parameterCounts.VP).toBeDefined();
      expect(stats.parameterCounts.word_order).toBeDefined();
    });
  });

  describe('Contextual Parameters', () => {
    test('should identify contextual parameters', () => {
      const contextualParams = engine.getContextualParameters();
      
      expect(contextualParams.NP).toBeDefined();
      expect(contextualParams.NP).toContain('SP');
      expect(contextualParams.NP).toContain('OP');
    });
  });

  describe('Relevant Parameters Tracking', () => {
    test('should track only parameters that were actually used in generation', () => {
      const result = engine.generateWithParameters('#origin#', {
        NP: 'cat',
        VP: 'loves',
        word_order: '#VSO#'
      });
      
      // Check that relevantParameters contains only used symbols
      const relevantParams = result.metadata.relevantParameters;
      
      // These should be present (used in generation)
      expect(relevantParams).toHaveProperty('NP');
      expect(relevantParams).toHaveProperty('VP');
      expect(relevantParams).toHaveProperty('word_order');
      expect(relevantParams).toHaveProperty('VSO'); // VSO was used via word_order
      expect(relevantParams).toHaveProperty('SP'); // SP was used via VSO
      expect(relevantParams).toHaveProperty('OP'); // OP was used via VSO
      
      // These should NOT be present (not used in generation)
      expect(relevantParams).not.toHaveProperty('SVO');
      expect(relevantParams).not.toHaveProperty('SOV');
      
      // Check values
      expect(relevantParams.NP).toBe('cat');
      expect(relevantParams.VP).toBe('loves');
      expect(relevantParams.word_order).toBe('#VSO#');
    });

    test('should track parameters correctly for different word orders', () => {
      // Test SVO order
      const svoResult = engine.generateWithParameters('#origin#', {
        NP: 'girl',
        VP: 'eats',
        word_order: '#SVO#'
      });
      
      const svoRelevant = svoResult.metadata.relevantParameters;
      expect(svoRelevant).toHaveProperty('SVO');
      expect(svoRelevant).toHaveProperty('SP');
      expect(svoRelevant).toHaveProperty('OP');
      expect(svoRelevant).not.toHaveProperty('VSO');
      expect(svoRelevant).not.toHaveProperty('SOV');
      
      // Test VSO order (since SOV is not defined in test grammar)
      const vsoResult = engine.generateWithParameters('#origin#', {
        NP: 'dog',
        VP: 'chases',
        word_order: '#VSO#'
      });
      
      const vsoRelevant = vsoResult.metadata.relevantParameters;
      expect(vsoRelevant).toHaveProperty('VSO');
      expect(vsoRelevant).toHaveProperty('SP');
      expect(vsoRelevant).toHaveProperty('OP');
      expect(vsoRelevant).not.toHaveProperty('SVO');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing symbols gracefully', () => {
      const result = engine.generateWithParameters('#missingSymbol#', {});
      
      expect(result.content).toContain('((missing:missingSymbol))');
    });

    test('should handle empty grammar', () => {
      const emptyEngine = new GrammarEngine({});
      const result = emptyEngine.generateWithParameters('#test#', {});
      
      expect(result.content).toContain('((missing:test))');
    });
  });
});
