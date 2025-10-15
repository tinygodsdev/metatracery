import { GrammarEngine, GenerationStrategy } from '../Engine';
import { GrammarRule } from '../types';

describe('Syllable Grammar', () => {
  let engine: GrammarEngine;
  let syllableGrammar: GrammarRule;

  beforeEach(() => {
    syllableGrammar = {
      "origin": ["#S#", "#S##S#", "#S##S##S#"],
      "S": ["#V##C#", "#V#", "#C##V#"],
      "V": ["a", "e", "i", "o", "u"],
      "C": ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
    };
    engine = new GrammarEngine(syllableGrammar);
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
      
      const totalCombinations = engine.countStrings('origin');

      // Expected: 9,984,815
      expect(totalCombinations).toBe(9984815);
    });

    test('should generate sample combinations for each origin pattern', () => {
      // Test single syllable - should match one of the syllable patterns
      const singleSyllable = engine.generate('origin', { origin: '#S#' });
      expect(singleSyllable.text).toMatch(/^([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])$/);
      
      // Test double syllable
      const doubleSyllable = engine.generate('origin', { origin: '#S##S#' });
      expect(doubleSyllable.text).toMatch(/^([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])$/);
      
      // Test triple syllable
      const tripleSyllable = engine.generate('origin', { origin: '#S##S##S#' });
      expect(tripleSyllable.text).toMatch(/^([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])([aeiou][bcdfghjklmnpqrstvwxyz]|[aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou])$/);
    });

    test('should verify syllable structure patterns', () => {
      // Generate multiple samples to verify patterns
      const samples = [];
      for (let i = 0; i < 100; i++) {
        samples.push(engine.generate('origin', {}));
      }
      
      // Check that all samples match expected syllable patterns
      samples.forEach(sample => {
        const content = sample.text;
        
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
      const totalCombinations = engine.countStrings('origin');
      const endTime = Date.now();
      
      // Should complete quickly (under 100ms for this size)
      expect(endTime - startTime).toBeLessThan(10);
      expect(totalCombinations).toBeGreaterThan(1000000); // Should be over 1 million
      expect(totalCombinations).toBe(9984815);
    });

    test('should generate random 1000 combinations efficiently', () => {
      const startTime = Date.now();
      const results = engine.generateMany(1000, 'origin');
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100);
      expect(results.length).toBe(1000);
    });

    test('should generate unique 1000 combinations efficiently', () => {
      const startTime = Date.now();
      const results = engine.generateMany(1000, 'origin', {}, true);
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100);
      expect(results.length).toBe(1000);
    });
  });

  describe('Generation Strategy Tests', () => {
    test('uniform strategy should give equal probability to each origin option', () => {
      // Test with a simple grammar where we can easily count occurrences
      const simpleGrammar = {
        "A": ["x", "y"],
        "B": ["z"],
        "origin": ["#A#", "#B#"]
      };
      const simpleEngine = new GrammarEngine(simpleGrammar);
      
      const results = simpleEngine.generateMany(1000, 'origin', {}, false, Infinity, 'uniform');
      
      // Count how many times each origin pattern was chosen
      const patternCounts = { A: 0, B: 0 };
      results.forEach(result => {
        if (result.text === 'x' || result.text === 'y') {
          patternCounts.A++;
        } else if (result.text === 'z') {
          patternCounts.B++;
        }
      });
      
      // With uniform strategy, each origin option should be chosen roughly equally
      // A should be chosen ~500 times, B should be chosen ~500 times
      expect(patternCounts.A).toBeGreaterThan(400);
      expect(patternCounts.A).toBeLessThan(600);
      expect(patternCounts.B).toBeGreaterThan(400);
      expect(patternCounts.B).toBeLessThan(600);
    });

    test('weighted strategy should favor options that generate more strings', () => {
      // Test with the same simple grammar
      const simpleGrammar = {
        "A": ["x", "y"],
        "B": ["z"],
        "origin": ["#A#", "#B#"]
      };
      const simpleEngine = new GrammarEngine(simpleGrammar);
      
      const results = simpleEngine.generateMany(1000, 'origin', {}, false, Infinity, 'weighted');
      
      // Count how many times each origin pattern was chosen
      const patternCounts = { A: 0, B: 0 };
      results.forEach(result => {
        if (result.text === 'x' || result.text === 'y') {
          patternCounts.A++;
        } else if (result.text === 'z') {
          patternCounts.B++;
        }
      });
      
      // With weighted strategy, A should be chosen ~2x more often than B
      // because A can generate 2 strings (x, y) while B generates 1 string (z)
      expect(patternCounts.A).toBeGreaterThan(600);
      expect(patternCounts.B).toBeLessThan(400);
      expect(patternCounts.A / patternCounts.B).toBeCloseTo(2, 0.1);
    });

    test('uniform strategy should give equal probability to syllable patterns', () => {
      const results = engine.generateMany(1000, 'origin', {}, false, Infinity, 'uniform');
      
      // Count syllable counts in generated words
      const syllableCounts = { 1: 0, 2: 0, 3: 0 };
      results.forEach(result => {
        const text = result.text;
        // Rough estimation: count vowels to determine syllable count
        const vowelCount = (text.match(/[aeiou]/g) || []).length;
        if (vowelCount >= 1 && vowelCount <= 3) {
          syllableCounts[vowelCount as keyof typeof syllableCounts]++;
        }
      });
      
      // With uniform strategy, each origin option should be chosen roughly equally
      // So we should see roughly equal distribution of 1, 2, and 3 syllable words
      expect(syllableCounts[1]).toBeGreaterThan(250);
      expect(syllableCounts[2]).toBeGreaterThan(250);
      expect(syllableCounts[3]).toBeGreaterThan(250);
    });

    test('weighted strategy should heavily favor longer syllable patterns', () => {
      const results = engine.generateMany(1000, 'origin', {}, false, Infinity, 'weighted');
      
      // Count syllable counts in generated words
      const syllableCounts = { 1: 0, 2: 0, 3: 0 };
      results.forEach(result => {
        const text = result.text;
        // Rough estimation: count vowels to determine syllable count
        const vowelCount = (text.match(/[aeiou]/g) || []).length;
        if (vowelCount >= 1 && vowelCount <= 3) {
          syllableCounts[vowelCount as keyof typeof syllableCounts]++;
        }
      });
      
      // With weighted strategy, longer patterns should be heavily favored
      // 3-syllable words should be most common, then 2-syllable, then 1-syllable
      expect(syllableCounts[3]).toBeGreaterThan(syllableCounts[2]);
      expect(syllableCounts[2]).toBeGreaterThan(syllableCounts[1]);
      expect(syllableCounts[1]).toBeLessThan(200); // Should be much less common
    });
  });

  describe('IPA Grammar Strategy Comparison', () => {
    let ipaEngine: GrammarEngine;
    
    beforeEach(() => {
      // Load IPA grammar from fixtures
      const ipaGrammar = {
        "origin": ["#S#", "#S##S#"],
        "S": ["#V##C#", "#V#", "#C##V#", "#C##V##C#"],
        "V": ["a", "e", "i", "o", "u", "ö", "ÿ"],
        "C": ["m", "n", "b", "p", "d", "t", "g", "k", "f", "v", "s", "ʃ", "ʒ", "h", "l", "j", "r", "ɬ", "tɬ", "tʃ"]
      };
      ipaEngine = new GrammarEngine(ipaGrammar);
    });

    test('uniform strategy should give equal probability to single vs double syllable words', () => {
      const results = ipaEngine.generateMany(1000, 'origin', {}, false, Infinity, 'uniform');
      
      // Count single vs double syllable words
      const syllableCounts = { 1: 0, 2: 0 };
      results.forEach(result => {
        const text = result.text;
        // Count vowels to determine syllable count
        const vowelCount = (text.match(/[aeiouöÿ]/g) || []).length;
        if (vowelCount === 1) syllableCounts[1]++;
        else if (vowelCount === 2) syllableCounts[2]++;
      });
      
      // With uniform strategy, single and double syllable should be roughly equal
      expect(syllableCounts[1]).toBeGreaterThan(400);
      expect(syllableCounts[1]).toBeLessThan(600);
      expect(syllableCounts[2]).toBeGreaterThan(400);
      expect(syllableCounts[2]).toBeLessThan(600);
    });

    test('weighted strategy should heavily favor double syllable words', () => {
      const results = ipaEngine.generateMany(1000, 'origin', {}, false, Infinity, 'weighted');
      
      // Count single vs double syllable words
      const syllableCounts = { 1: 0, 2: 0 };
      results.forEach(result => {
        const text = result.text;
        // Count vowels to determine syllable count
        const vowelCount = (text.match(/[aeiouöÿ]/g) || []).length;
        if (vowelCount === 1) syllableCounts[1]++;
        else if (vowelCount === 2) syllableCounts[2]++;
      });
      
      // With weighted strategy, double syllable should be much more common
      // because #S##S# can generate many more combinations than #S#
      expect(syllableCounts[2]).toBeGreaterThan(syllableCounts[1]);
      expect(syllableCounts[1]).toBeLessThan(300); // Should be much less common
      expect(syllableCounts[2]).toBeGreaterThan(700); // Should be much more common
    });

    test('uniform strategy should give equal probability to different syllable structures', () => {
      const results = ipaEngine.generateMany(1000, 'S', {}, false, Infinity, 'uniform');
      
      // Count different syllable structures
      const structureCounts = { 'VC': 0, 'V': 0, 'CV': 0, 'CVC': 0 };
      results.forEach(result => {
        const text = result.text;
        if (text.match(/^[aeiouöÿ][mnbpdgtgkfvsʃʒhljrɬtɬtʃ]$/)) structureCounts.VC++;
        else if (text.match(/^[aeiouöÿ]$/)) structureCounts.V++;
        else if (text.match(/^[mnbpdgtgkfvsʃʒhljrɬtɬtʃ][aeiouöÿ]$/)) structureCounts.CV++;
        else if (text.match(/^[mnbpdgtgkfvsʃʒhljrɬtɬtʃ][aeiouöÿ][mnbpdgtgkfvsʃʒhljrɬtɬtʃ]$/)) structureCounts.CVC++;
      });
      
      // With uniform strategy, each syllable structure should be roughly equal
      expect(structureCounts.VC).toBeGreaterThan(150);
      expect(structureCounts.V).toBeGreaterThan(150);
      expect(structureCounts.CV).toBeGreaterThan(150);
      expect(structureCounts.CVC).toBeGreaterThan(150);
      // This test is probabilistic, so it can fail occasionally
      expect(structureCounts.VC).toBeLessThan(500);
      expect(structureCounts.V).toBeLessThan(500);
      expect(structureCounts.CV).toBeLessThan(500);
      expect(structureCounts.CVC).toBeLessThan(500);
    });

    test('weighted strategy should heavily favor longer syllable structures', () => {
      const results = ipaEngine.generateMany(1000, 'S', {}, false, Infinity, 'weighted');
      
      // Count different syllable structures
      const structureCounts = { 'VC': 0, 'V': 0, 'CV': 0, 'CVC': 0 };
      results.forEach(result => {
        const text = result.text;
        if (text.match(/^[aeiouöÿ][mnbpdgtgkfvsʃʒhljrɬtɬtʃ]$/)) structureCounts.VC++;
        else if (text.match(/^[aeiouöÿ]$/)) structureCounts.V++;
        else if (text.match(/^[mnbpdgtgkfvsʃʒhljrɬtɬtʃ][aeiouöÿ]$/)) structureCounts.CV++;
        else if (text.match(/^[mnbpdgtgkfvsʃʒhljrɬtɬtʃ][aeiouöÿ][mnbpdgtgkfvsʃʒhljrɬtɬtʃ]$/)) structureCounts.CVC++;
      });
      
      // With weighted strategy, longer structures should be favored
      // CVC should be most common (7×29×29 = 5887 combinations)
      // VC and CV should be equal (7×29 = 203 combinations each)
      // V should be least common (7 combinations)
      expect(structureCounts.CVC).toBeGreaterThan(structureCounts.VC);
      expect(structureCounts.CVC).toBeGreaterThan(structureCounts.CV);
      expect(structureCounts.V).toBeLessThan(100); // Should be much less common
    });
  });
});
