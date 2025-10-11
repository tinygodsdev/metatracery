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
    test('should generate all possible combinations for basic grammar', () => {
      const basicGrammar = {
        "S": ["A", "B", "C"],
        "origin": ["#S# #S# #S#"]
      };
      const basicEngine = new GrammarEngine(basicGrammar);
      const results = basicEngine.generateAllCombinations('#origin#');
      
      expect(results).toBeDefined();
      expect(results.length).toBe(27); // 3^3 = 27 combinations
      
      // Check that all results have content
      results.forEach(result => {
        expect(result.content).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.metadata.parameters).toBeDefined();
      });

      // Check that we have all possible combinations
      const contents = results.map(r => r.content);
      const uniqueContents = [...new Set(contents)];
      expect(uniqueContents.length).toBe(27); // All should be unique
      
      // Check some specific examples
      expect(contents).toContain('A A A');
      expect(contents).toContain('A A B');
      expect(contents).toContain('A A C');
      expect(contents).toContain('B B B');
      expect(contents).toContain('C C C');
    });

    test('should generate all possible combinations', () => {
      const results = engine.generateAllCombinations('#origin#');
      
      expect(results).toBeDefined();
      expect(results.length).toBe(24); // 2 word_order × 2 NP × 3 VP × 2 NP
      
      // Check that all results have content
      results.forEach(result => {
        expect(result.content).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.metadata.parameters).toBeDefined();
      });

      // Check specific content examples
      const svoResults = results.filter(r => r.metadata.relevantParameters.word_order === '#SVO#');
      const vsoResults = results.filter(r => r.metadata.relevantParameters.word_order === '#VSO#');
      
      expect(svoResults.length).toBe(12);
      expect(vsoResults.length).toBe(12);
      
      // Check that SVO results have correct word order (Subject Verb Object)
      svoResults.forEach(result => {
        const words = result.content.split(' ');
        expect(words.length).toBe(3); // Should have exactly 3 words
        // The order should be: NP VP NP (Subject Verb Object)
        expect(['girl', 'cat']).toContain(words[0]); // First NP
        expect(['loves', 'eats', 'pets']).toContain(words[1]); // VP
        expect(['girl', 'cat']).toContain(words[2]); // Second NP
      });
      
      // Check that VSO results have correct word order (Verb Subject Object)
      vsoResults.forEach(result => {
        const words = result.content.split(' ');
        expect(words.length).toBe(3); // Should have exactly 3 words
        // The order should be: VP NP NP (Verb Subject Object)
        expect(['loves', 'eats', 'pets']).toContain(words[0]); // VP
        expect(['girl', 'cat']).toContain(words[1]); // First NP
        expect(['girl', 'cat']).toContain(words[2]); // Second NP
      });
    });

    test('should include both SVO and VSO orders in combinations', () => {
      const results = engine.generateAllCombinations('#origin#');
      
      const svoResults = results.filter(r => r.metadata.relevantParameters.word_order === '#SVO#');
      const vsoResults = results.filter(r => r.metadata.relevantParameters.word_order === '#VSO#');
      
      expect(svoResults.length).toBe(12); // 2 NP × 2 NP × 3 VP = 12
      expect(vsoResults.length).toBe(12); // 2 NP × 2 NP × 3 VP = 12
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
      
      // Now stats.totalVariants should use the correct method
      expect(stats.totalVariants).toBe(24); // Correct count based on grammar structure
      
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

  describe('Randomization and State Management', () => {
    test('should not have stuck parameters after generateWithParameters', () => {
      // Generate with specific parameters
      const result1 = engine.generateWithParameters('#origin#', {
        NP: 'cat',
        VP: 'loves',
        word_order: '#SVO#'
      });
      
      expect(result1.content).toContain('cat');
      expect(result1.content).toContain('loves');
      
      // Generate again without parameters - should be random
      const result2 = engine.generateWithParameters('#origin#', {});
      const result3 = engine.generateWithParameters('#origin#', {});
      const result4 = engine.generateWithParameters('#origin#', {});
      
      // Results should be different (random)
      const results = [result2.content, result3.content, result4.content];
      const uniqueResults = new Set(results);
      
      // With 3 random generations, we should get at least 2 different results
      // (probability of all 3 being identical is very low with multiple parameters)
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    test('should not have stuck parameters after generateAllCombinations', () => {
      // Generate all combinations
      const allResults = engine.generateAllCombinations('#origin#');
      expect(allResults.length).toBe(24); // 2 × 2 × 3 × 2 (SVO/VSO orders)
      
      // Generate single random result after generateAllCombinations
      const randomResult1 = engine.generateWithParameters('#origin#', {});
      const randomResult2 = engine.generateWithParameters('#origin#', {});
      const randomResult3 = engine.generateWithParameters('#origin#', {});
      
      // Results should be different (random)
      const results = [randomResult1.content, randomResult2.content, randomResult3.content];
      const uniqueResults = new Set(results);
      
      // Should get different random results
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    test('should clear parameters between generateWithParameters calls', () => {
      // Generate with specific parameters
      engine.generateWithParameters('#origin#', {
        NP: 'cat',
        VP: 'loves',
        word_order: '#SVO#'
      });
      
      // Generate with different specific parameters
      const result = engine.generateWithParameters('#origin#', {
        NP: 'girl',
        VP: 'eats',
        word_order: '#VSO#'
      });
      
      // Should use the new parameters, not the old ones
      expect(result.content).toContain('girl');
      expect(result.content).toContain('eats');
      
      // VSO order should produce: VP SP OP = "eats girl girl"
      // So the result should start with the verb (eats)
      expect(result.content).toMatch(/^eats/);
    });

    test('should produce different results when called multiple times with empty parameters', () => {
      const results: string[] = [];
      
      // Generate 10 random results
      for (let i = 0; i < 10; i++) {
        const result = engine.generateWithParameters('#origin#', {});
        results.push(result.content);
      }
      
      // Should have some variety (not all identical)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
      
      // Should contain expected words from our grammar
      const allContent = results.join(' ');
      expect(allContent).toMatch(/cat|girl/); // Should contain NP values
      expect(allContent).toMatch(/loves|eats|pets/); // Should contain VP values
    });
  });

  describe('Simple Grammar Generation', () => {
    test('should generate all combinations for simple S grammar', () => {
      const simpleGrammar: GrammarRule = {
        "S": ["A", "B", "C"],
        "origin": ["#S# #S# #S#"]
      };
      
      const simpleEngine = new GrammarEngine(simpleGrammar);
      
      // Generate all combinations
      const allResults = simpleEngine.generateAllCombinations('#origin#');
      
      // Should have 3^3 = 27 combinations
      expect(allResults.length).toBe(27);
      
      // Extract all generated content
      const allContent = allResults.map(result => result.content);
      
      // Should contain all possible combinations
      const expectedCombinations = [
        'A A A', 'A A B', 'A A C',
        'A B A', 'A B B', 'A B C',
        'A C A', 'A C B', 'A C C',
        'B A A', 'B A B', 'B A C',
        'B B A', 'B B B', 'B B C',
        'B C A', 'B C B', 'B C C',
        'C A A', 'C A B', 'C A C',
        'C B A', 'C B B', 'C B C',
        'C C A', 'C C B', 'C C C'
      ];
      
      // Check that we have all expected combinations
      for (const expected of expectedCombinations) {
        expect(allContent).toContain(expected);
      }
      
      // Check that we don't have duplicates
      const uniqueContent = new Set(allContent);
      expect(uniqueContent.size).toBe(27);
      
      // Check that all results contain only A, B, C and spaces
      for (const content of allContent) {
        expect(content).toMatch(/^[ABC] [ABC] [ABC]$/);
      }
    });

    test('should generate correct parameter combinations for simple S grammar', () => {
      const simpleGrammar: GrammarRule = {
        "S": ["A", "B", "C"],
        "origin": ["#S# #S# #S#"]
      };
      
      const simpleEngine = new GrammarEngine(simpleGrammar);
      
      // Generate all combinations
      const allResults = simpleEngine.generateAllCombinations('#origin#');
      
      // Check that each result has correct relevant parameters
      for (const result of allResults) {
        const relevantParams = result.metadata.relevantParameters;
        
        // Should have S parameter
        expect(relevantParams).toHaveProperty('S');
        expect(['A', 'B', 'C']).toContain(relevantParams.S);
        
        // Should have generation path
        expect(result.metadata.generationPath).toBeDefined();
        expect(result.metadata.generationPath.length).toBeGreaterThan(0);
      }
      
      // Check that we have all 3 different S values
      const sValues = allResults.map(result => result.metadata.relevantParameters.S);
      const uniqueSValues = new Set(sValues);
      expect(uniqueSValues.size).toBe(3);
      expect(uniqueSValues).toContain('A');
      expect(uniqueSValues).toContain('B');
      expect(uniqueSValues).toContain('C');
    });

    test('should generate single random results correctly for simple S grammar', () => {
      const simpleGrammar: GrammarRule = {
        "S": ["A", "B", "C"],
        "origin": ["#S# #S# #S#"]
      };
      
      const simpleEngine = new GrammarEngine(simpleGrammar);
      
      // Generate multiple random results
      const results: string[] = [];
      for (let i = 0; i < 20; i++) {
        const result = simpleEngine.generateWithParameters('#origin#', {});
        results.push(result.content);
      }
      
      // Should have some variety
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
      
      // All results should be valid
      for (const content of results) {
        expect(content).toMatch(/^[ABC] [ABC] [ABC]$/);
      }
      
      // Should contain all possible letters
      const allContent = results.join(' ');
      expect(allContent).toContain('A');
      expect(allContent).toContain('B');
      expect(allContent).toContain('C');
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
