import { GrammarEngine } from '../GrammarEngine';
import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GrammarRule } from '../types';

describe('Syllable Grammar', () => {
  let engine: GrammarEngine;
  let analyzer: GrammarAnalyzer;
  let syllableGrammar: GrammarRule;

  beforeEach(() => {
    syllableGrammar = {
      "origin": ["#S#", "#S##S#", "#S##S##S#"],
      "S": ["#V##C#", "#V#", "#C##V#"],
      "V": ["a", "e", "i", "o", "u"],
      "C": ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
    };
    engine = new GrammarEngine(syllableGrammar);
    analyzer = new GrammarAnalyzer(syllableGrammar);
  });

  describe('Manual calculation verification', () => {
    test('should calculate syllable combinations correctly', () => {
      // Manual calculation:
      // V: 5 options (a, e, i, o, u)
      // C: 21 options (b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z)
      
      // S combinations:
      // - #V##C#: 5 × 21 = 105
      // - #V#: 5 = 5
      // - #C##V#: 21 × 5 = 105
      // Total S: 105 + 5 + 105 = 215
      
      // Origin combinations:
      // - #S#: 215
      // - #S##S#: 215 × 215 = 46,225
      // - #S##S##S#: 215 × 215 × 215 = 9,938,375
      // Total: 215 + 46,225 + 9,938,375 = 9,984,815
      
      const totalCombinations = analyzer.countAllPaths();

      // Expected: 9,984,815
      expect(totalCombinations).toBe(9984815);
    });

    test('should generate sample combinations for each origin pattern', () => {
      // Test single syllable - should match one of the syllable patterns
      const singleSyllable = engine.generateWithParameters('#origin#', { origin: '#S#' });
      expect(singleSyllable.content).toMatch(/^([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])$/);
      
      // Test double syllable
      const doubleSyllable = engine.generateWithParameters('#origin#', { origin: '#S##S#' });
      expect(doubleSyllable.content).toMatch(/^([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])$/);
      
      // Test triple syllable
      const tripleSyllable = engine.generateWithParameters('#origin#', { origin: '#S##S##S#' });
      expect(tripleSyllable.content).toMatch(/^([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])$/);
    });

    test('should verify syllable structure patterns', () => {
      // Generate multiple samples to verify patterns
      const samples = [];
      for (let i = 0; i < 100; i++) {
        samples.push(engine.generateWithParameters('#origin#', {}));
      }
      
      // Check that all samples match expected syllable patterns
      samples.forEach(sample => {
        const content = sample.content;
        
        // Should contain only vowels and consonants
        expect(content).toMatch(/^[aeioubcdfghjklmnpqrstvwxyz]+$/);
        
        // Should have at least one vowel
        expect(content).toMatch(/[aeiou]/);
        
        // Length should be reasonable (1-3 syllables, each 1-2 characters)
        expect(content.length).toBeGreaterThanOrEqual(1);
        expect(content.length).toBeLessThanOrEqual(6); // 3 syllables × 2 chars max
      });
    });

    test('should handle large combination count efficiently', () => {
      // This test verifies that our counting method can handle large numbers
      const startTime = Date.now();
      const totalCombinations = analyzer.countAllPaths();
      const endTime = Date.now();
      
      // Should complete quickly (under 100ms for this size)
      expect(endTime - startTime).toBeLessThan(100);
      expect(totalCombinations).toBeGreaterThan(1000000); // Should be over 1 million
    });
  });
});
