import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GrammarRule } from '../types';

describe('GrammarAnalyzer with Constraints', () => {
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
    analyzer = new GrammarAnalyzer(testGrammar);
  });

  describe('generateAllCombinations with constraints', () => {
    test('should generate all combinations without constraints', () => {
      const combinations = analyzer.generateAllCombinations();
      expect(combinations.length).toBe(24);
      
      // Check that we have all possible combinations
      const contents = combinations.map(c => c.content);
      const uniqueContents = [...new Set(contents)];
      expect(uniqueContents.length).toBe(24);
    });

    test('should generate combinations with NP constraint', () => {
      const constraints = { NP: "girl" };
      const combinations = analyzer.generateAllCombinations(constraints);
      
      // Should generate exactly 6 combinations (both SP and OP must use "girl")
      expect(combinations.length).toBe(6);
      
      // All results should contain only "girl" (no "cat")
      const contents = combinations.map(c => c.content);
      const hasCat = contents.some(content => content.includes('cat'));
      expect(hasCat).toBe(false);
      
      // All results should contain "girl"
      const allHaveGirl = contents.every(content => content.includes('girl'));
      expect(allHaveGirl).toBe(true);
      
      // Check specific expected results
      expect(contents).toContain('girl loves girl');
      expect(contents).toContain('girl eats girl');
      expect(contents).toContain('girl pets girl');
      expect(contents).toContain('loves girl girl');
      expect(contents).toContain('eats girl girl');
      expect(contents).toContain('pets girl girl');
    });

    test('should generate combinations with multiple constraints', () => {
      const constraints = { NP: "girl", VP: "loves" };
      const combinations = analyzer.generateAllCombinations(constraints);
      
      // Should generate exactly 2 combinations
      expect(combinations.length).toBe(2);
      
      const contents = combinations.map(c => c.content);
      expect(contents).toContain('girl loves girl');
      expect(contents).toContain('loves girl girl');
    });

    test('should return empty array for invalid constraint', () => {
      const constraints = { NP: "invalid" };
      const combinations = analyzer.generateAllCombinations(constraints);
      
      expect(combinations.length).toBe(0);
    });

    test('should work with origin constraints', () => {
      // Test constraining origin to specific alternatives
      // Since origin contains ["#word_order#"], we need to constrain word_order instead
      const constraints = { word_order: "#SVO#" };
      const combinations = analyzer.generateAllCombinations(constraints);
      
      // Should generate only SVO combinations (12 total)
      expect(combinations.length).toBe(12);
      
      // All results should be SVO format (SP VP OP)
      const contents = combinations.map(c => c.content);
      contents.forEach(content => {
        const words = content.split(' ');
        expect(words.length).toBe(3); // SP VP OP format
      });
    });
  });

  describe('consistency with countAllPaths', () => {
    test('should have consistent counts between counting and generation', () => {
      // Test without constraints
      const countWithoutConstraints = analyzer.countAllPaths();
      const combinationsWithoutConstraints = analyzer.generateAllCombinations();
      expect(combinationsWithoutConstraints.length).toBe(countWithoutConstraints);
      
      // Test with NP constraint
      const constraints = { NP: "girl" };
      const countWithConstraints = analyzer.countAllPaths(constraints);
      const combinationsWithConstraints = analyzer.generateAllCombinations(constraints);
      expect(combinationsWithConstraints.length).toBe(countWithConstraints);
      
      // Test with multiple constraints
      const multipleConstraints = { NP: "girl", VP: "loves" };
      const countWithMultipleConstraints = analyzer.countAllPaths(multipleConstraints);
      const combinationsWithMultipleConstraints = analyzer.generateAllCombinations(multipleConstraints);
      expect(combinationsWithMultipleConstraints.length).toBe(countWithMultipleConstraints);
    });
  });
});
