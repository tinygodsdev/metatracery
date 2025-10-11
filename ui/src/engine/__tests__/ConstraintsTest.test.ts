import { GrammarEngine } from '../GrammarEngine';
import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GrammarRule } from '../types';

describe('Constraints Test', () => {
  let engine: GrammarEngine;
  let analyzer: GrammarAnalyzer;
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
    analyzer = new GrammarAnalyzer(testGrammar);
  });

  describe('Unified countAllPaths with constraints', () => {
    test('should count all combinations without constraints', () => {
      const totalCombinations = analyzer.countAllPaths();
      expect(totalCombinations).toBe(24);
    });

    test('should count combinations with single constraint', () => {
      // Constrain NP to "girl" only
      const constrainedCombinations = analyzer.countAllPaths({ NP: "girl" });
      // Both SP and OP must use "girl", so: 2 word_order × 3 VP = 6
      expect(constrainedCombinations).toBe(6);
    });

    test('should count combinations with multiple constraints', () => {
      // Constrain NP to "girl" and VP to "loves"
      const constrainedCombinations = analyzer.countAllPaths({ NP: "girl", VP: "loves" });
      // Both SP and OP must use "girl", VP must be "loves": 2 word_order × 1 VP = 2
      expect(constrainedCombinations).toBe(2);
    });

    test('should return 0 for invalid constraint', () => {
      // Constrain NP to non-existent value
      const constrainedCombinations = analyzer.countAllPaths({ NP: "invalid" });
      expect(constrainedCombinations).toBe(0);
    });

    test('should work with GrammarEngine.getTotalCombinations', () => {
      // Test the unified API through GrammarEngine
      const totalCombinations = engine.getTotalCombinations();
      expect(totalCombinations).toBe(24);

      const constrainedCombinations = engine.getTotalCombinations({ NP: "girl" });
      expect(constrainedCombinations).toBe(6);
    });
  });

  describe('Syllable grammar with constraints', () => {
    let syllableEngine: GrammarEngine;
    let syllableAnalyzer: GrammarAnalyzer;
    let syllableGrammar: GrammarRule;

    beforeEach(() => {
      syllableGrammar = {
        "origin": ["#S#", "#S##S#", "#S##S##S#"],
        "S": ["#V##C#", "#V#", "#C##V#"],
        "V": ["a", "e", "i", "o", "u"],
        "C": ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
      };
      syllableEngine = new GrammarEngine(syllableGrammar);
      syllableAnalyzer = new GrammarAnalyzer(syllableGrammar);
    });

    test('should count syllable combinations with vowel constraint', () => {
      // Constrain V to "a" only
      const constrainedCombinations = syllableAnalyzer.countAllPaths({ V: "a" });
      
      // Expected: 1 vowel × 21 consonants + 1 vowel + 21 consonants × 1 vowel = 43 per syllable
      // Total: 43 + 43² + 43³ = 43 + 1849 + 79507 = 81399
      expect(constrainedCombinations).toBe(81399);
    });

    test('should count syllable combinations with consonant constraint', () => {
      // Constrain C to "b" only
      const constrainedCombinations = syllableAnalyzer.countAllPaths({ C: "b" });
      
      // Expected: 5 vowels × 1 consonant + 5 vowels + 1 consonant × 5 vowels = 15 per syllable
      // Total: 15 + 15² + 15³ = 15 + 225 + 3375 = 3615
      expect(constrainedCombinations).toBe(3615);
    });

    test('should count syllable combinations with both vowel and consonant constraints', () => {
      // Constrain V to "a" and C to "b"
      const constrainedCombinations = syllableAnalyzer.countAllPaths({ V: "a", C: "b" });
      
      // Expected: 1 vowel × 1 consonant + 1 vowel + 1 consonant × 1 vowel = 3 per syllable
      // Total: 3 + 3² + 3³ = 3 + 9 + 27 = 39
      expect(constrainedCombinations).toBe(39);
    });

    test('should handle origin constraints', () => {
      // Test constraining origin to specific alternatives
      
      // Constrain origin to single syllable only
      const singleSyllableCombinations = syllableAnalyzer.countAllPaths({ origin: "#S#" });
      // Expected: 215 combinations (only single syllable patterns)
      expect(singleSyllableCombinations).toBe(215);
      
      // Constrain origin to double syllables only
      const doubleSyllableCombinations = syllableAnalyzer.countAllPaths({ origin: "#S##S#" });
      // Expected: 215² = 46,225 combinations
      expect(doubleSyllableCombinations).toBe(46225);
      
      // Constrain origin to triple syllables only
      const tripleSyllableCombinations = syllableAnalyzer.countAllPaths({ origin: "#S##S##S#" });
      // Expected: 215³ = 9,938,375 combinations
      expect(tripleSyllableCombinations).toBe(9938375);
      
      // Test invalid origin constraint
      const invalidOriginCombinations = syllableAnalyzer.countAllPaths({ origin: "#INVALID#" });
      expect(invalidOriginCombinations).toBe(0);
    });

    test('should handle origin constraints with other parameter constraints', () => {
      // Constrain origin to single syllable AND vowel to "a"
      const constrainedCombinations = syllableAnalyzer.countAllPaths({ 
        origin: "#S#", 
        V: "a" 
      });
      
      // Expected: 1 vowel × 21 consonants + 1 vowel + 21 consonants × 1 vowel = 43 combinations
      expect(constrainedCombinations).toBe(43);
    });
  });
});
