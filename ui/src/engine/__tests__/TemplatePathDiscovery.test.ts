import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GrammarRule, TemplatePath } from '../types';

describe('TemplatePath Discovery in GrammarAnalyzer', () => {
  
  describe('Simple grammar discovery', () => {
    test('should discover TemplatePaths for simple grammar', () => {
      const grammar: GrammarRule = {
        origin: ['#S# #S# #S#'],
        S: ['A', 'B', 'C']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      // Should generate 27 TemplatePaths (3×3×3)
      expect(templatePaths.length).toBe(27);

      // Check first TemplatePath structure
      const firstPath = templatePaths[0];
      expect(firstPath.path).toHaveLength(1);
      expect(firstPath.path[0].symbol).toBe('origin');
      expect(firstPath.path[0].chosenAlternative).toBe('#S# #S# #S#');
      expect(firstPath.path[0].childChoices).toHaveLength(3);
      expect(firstPath.path[0].childChoices![0].symbol).toBe('S');
      expect(firstPath.path[0].childChoices![1].symbol).toBe('S');
      expect(firstPath.path[0].childChoices![2].symbol).toBe('S');

      // Check that all combinations are present
      const allCombinations = templatePaths.map(path => 
        path.path[0].childChoices!.map(choice => choice.chosenAlternative)
      );
      
      // Should have all 27 combinations of A, B, C
      const expectedCombinations = [];
      for (const first of ['A', 'B', 'C']) {
        for (const second of ['A', 'B', 'C']) {
          for (const third of ['A', 'B', 'C']) {
            expectedCombinations.push([first, second, third]);
          }
        }
      }
      
      expect(allCombinations).toEqual(expect.arrayContaining(expectedCombinations));
    });

    test('should discover TemplatePaths for grammar with different parameter order', () => {
      const grammar: GrammarRule = {
        origin: ['#A# #B# #A#'],
        A: ['first', 'second'],
        B: ['middle']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      // Should generate 4 TemplatePaths (2×1×2)
      expect(templatePaths.length).toBe(4);

      // Check TemplatePath structure
      const firstPath = templatePaths[0];
      expect(firstPath.template).toBe('#A# #B# #A#');
      expect(firstPath.path[0].childChoices).toHaveLength(3);
      expect(firstPath.path[0].childChoices![0].symbol).toBe('A');
      expect(firstPath.path[0].childChoices![1].symbol).toBe('B');
      expect(firstPath.path[0].childChoices![2].symbol).toBe('A');
    });
  });

  describe('Complex grammar discovery', () => {
    test('should discover TemplatePaths for linguistic grammar', () => {
      const grammar: GrammarRule = {
        origin: ['#word_order#'],
        word_order: ['#SVO#', '#VSO#'],
        SVO: ['#SP# #VP# #OP#'],
        VSO: ['#VP# #SP# #OP#'],
        SP: ['#NP#'],
        OP: ['#NP#'],
        NP: ['girl', 'cat'],
        VP: ['loves', 'eats', 'pets']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      // Should generate 24 TemplatePaths (2 word_orders × 2 NPs × 2 NPs × 3 VPs)
      expect(templatePaths.length).toBe(24);

      // Check first TemplatePath structure
      const firstPath = templatePaths[0];
      expect(firstPath.path).toHaveLength(1);
      expect(firstPath.path[0].symbol).toBe('origin');
      expect(firstPath.path[0].chosenAlternative).toBe('#word_order#');
      expect(firstPath.path[0].childChoices).toHaveLength(1);
      expect(firstPath.path[0].childChoices![0].symbol).toBe('word_order');
    });
  });

  describe('Constraints handling', () => {
    test('should discover TemplatePaths with constraints', () => {
      const grammar: GrammarRule = {
        origin: ['#S# #S# #S#'],
        S: ['A', 'B', 'C']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates({ S: 'A' });

      // Should generate 1 TemplatePath (A×A×A)
      expect(templatePaths.length).toBe(1);

      const path = templatePaths[0];
      expect(path.path[0].childChoices![0].chosenAlternative).toBe('A');
      expect(path.path[0].childChoices![1].chosenAlternative).toBe('A');
      expect(path.path[0].childChoices![2].chosenAlternative).toBe('A');
    });

    test('should return empty array for invalid constraints', () => {
      const grammar: GrammarRule = {
        origin: ['#S# #S# #S#'],
        S: ['A', 'B', 'C']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates({ S: 'X' });

      expect(templatePaths.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle grammar with no parameters', () => {
      const grammar: GrammarRule = {
        origin: ['hello world']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      expect(templatePaths.length).toBe(1);
      expect(templatePaths[0].template).toBe('hello world');
      expect(templatePaths[0].path[0].symbol).toBe('origin');
      expect(templatePaths[0].path[0].chosenAlternative).toBe('hello world');
      expect(templatePaths[0].path[0].childChoices).toBeUndefined();
    });

    test('should handle empty grammar', () => {
      const grammar: GrammarRule = {};

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      expect(templatePaths.length).toBe(0);
    });
  });
});
