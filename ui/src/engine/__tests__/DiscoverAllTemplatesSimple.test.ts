import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GrammarRule } from '../types';

describe('DiscoverAllTemplates - Simple Tests', () => {
  
  describe('Basic grammar without constraints', () => {
    test('should discover templates for simple grammar', () => {
      const grammar: GrammarRule = {
        origin: ['hello', 'world']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      console.log('=== SIMPLE GRAMMAR TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(2); // Two separate templates for two origin alternatives
      
      // Check first template
      expect(templatePaths[0].path).toHaveLength(1);
      expect(templatePaths[0].path[0].symbol).toBe('origin');
      expect(templatePaths[0].path[0].chosenAlternative).toBe('hello');
      expect(templatePaths[0].path[0].childChoices).toEqual([]);
      
      // Check second template
      expect(templatePaths[1].path).toHaveLength(1);
      expect(templatePaths[1].path[0].symbol).toBe('origin');
      expect(templatePaths[1].path[0].chosenAlternative).toBe('world');
      expect(templatePaths[1].path[0].childChoices).toEqual([]);
    });

    test('should discover templates for grammar with single parameter', () => {
      const grammar: GrammarRule = {
        origin: ['#greeting#'],
        greeting: ['hello', 'hi', 'hey']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      console.log('=== SINGLE PARAMETER GRAMMAR TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(1); // Only one origin alternative
      
      // Check the single template structure
      const template = templatePaths[0];
      expect(template.path).toHaveLength(1);
      expect(template.path[0].symbol).toBe('origin');
      expect(template.path[0].chosenAlternative).toBe('#greeting#');
      expect(template.path[0].childChoices).toHaveLength(3); // All greeting alternatives
      
      // Check that all greeting alternatives are present
      const childChoices = template.path[0].childChoices!;
      const greetingValues = childChoices.map(choice => choice.chosenAlternative);
      expect(greetingValues).toContain('hello');
      expect(greetingValues).toContain('hi');
      expect(greetingValues).toContain('hey');
      
      // All child choices should be terminal
      childChoices.forEach(choice => {
        expect(choice.symbol).toBe('greeting');
        expect(choice.childChoices).toEqual([]);
      });
    });

    test('should discover templates for grammar with multiple parameters', () => {
      const grammar: GrammarRule = {
        origin: ['#A# #B#'],
        A: ['hello', 'hi'],
        B: ['world', 'there']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();

      console.log('=== MULTIPLE PARAMETERS GRAMMAR TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(1); // Only one origin alternative
      
      // Check the single template structure
      const template = templatePaths[0];
      expect(template.path).toHaveLength(1);
      expect(template.path[0].symbol).toBe('origin');
      expect(template.path[0].chosenAlternative).toBe('#A# #B#');
      expect(template.path[0].childChoices).toHaveLength(4); // 2 A + 2 B
      
      // Check that all A and B alternatives are present
      const childChoices = template.path[0].childChoices!;
      const aChoices = childChoices.filter(choice => choice.symbol === 'A');
      const bChoices = childChoices.filter(choice => choice.symbol === 'B');
      
      expect(aChoices).toHaveLength(2);
      expect(bChoices).toHaveLength(2);
      
      // Check A values
      const aValues = aChoices.map(choice => choice.chosenAlternative);
      expect(aValues).toContain('hello');
      expect(aValues).toContain('hi');
      
      // Check B values
      const bValues = bChoices.map(choice => choice.chosenAlternative);
      expect(bValues).toContain('world');
      expect(bValues).toContain('there');
      
      // All child choices should be terminal
      childChoices.forEach(choice => {
        expect(choice.childChoices).toEqual([]);
      });
    });
  });

  describe('Grammar with constraints', () => {
    test('should apply single constraint', () => {
      const grammar: GrammarRule = {
        origin: ['#greeting#'],
        greeting: ['hello', 'hi', 'hey']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates({ greeting: 'hello' });

      console.log('=== SINGLE CONSTRAINT TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(1);
      
      // Check that constraint was applied correctly
      const template = templatePaths[0];
      expect(template.path).toHaveLength(1);
      expect(template.path[0].symbol).toBe('origin');
      expect(template.path[0].chosenAlternative).toBe('#greeting#');
      expect(template.path[0].childChoices).toHaveLength(1);
      expect(template.path[0].childChoices![0].symbol).toBe('greeting');
      expect(template.path[0].childChoices![0].chosenAlternative).toBe('hello');
      expect(template.path[0].childChoices![0].childChoices).toEqual([]);
    });

    test('should apply multiple constraints', () => {
      const grammar: GrammarRule = {
        origin: ['#A# #B#'],
        A: ['hello', 'hi'],
        B: ['world', 'there']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates({ A: 'hello', B: 'world' });

      console.log('=== MULTIPLE CONSTRAINTS TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(1);
      
      // Check that both constraints were applied correctly
      const template = templatePaths[0];
      expect(template.path).toHaveLength(1);
      expect(template.path[0].symbol).toBe('origin');
      expect(template.path[0].chosenAlternative).toBe('#A# #B#');
      expect(template.path[0].childChoices).toHaveLength(2); // Only constrained values
      
      // Check A constraint
      const aChoice = template.path[0].childChoices!.find(choice => choice.symbol === 'A');
      expect(aChoice).toBeDefined();
      expect(aChoice!.chosenAlternative).toBe('hello');
      expect(aChoice!.childChoices).toEqual([]);
      
      // Check B constraint
      const bChoice = template.path[0].childChoices!.find(choice => choice.symbol === 'B');
      expect(bChoice).toBeDefined();
      expect(bChoice!.chosenAlternative).toBe('world');
      expect(bChoice!.childChoices).toEqual([]);
    });

    test('should throw error for invalid constraint', () => {
      const grammar: GrammarRule = {
        origin: ['#greeting#'],
        greeting: ['hello', 'hi', 'hey']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      
      console.log('=== INVALID CONSTRAINT TEST ===');
      
      expect(() => {
        analyzer.discoverAllTemplates({ greeting: 'invalid' });
      }).toThrow('Invalid constraint: greeting = "invalid". Available alternatives: hello, hi, hey');
    });
  });

  describe('Edge cases', () => {
    test('should handle grammar with no origin', () => {
      const grammar: GrammarRule = {
        greeting: ['hello', 'hi']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();
      
      console.log('=== NO ORIGIN TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(0);
    });

    test('should handle grammar with single parameter', () => {
      const grammar: GrammarRule = {
        origin: ['#greeting#'],
        greeting: ['hello', 'hi', 'hey']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templatePaths = analyzer.discoverAllTemplates();
      
      console.log('=== SINGLE PARAMETER EDGE CASE TEST ===');
      console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
      
      expect(templatePaths).toBeDefined();
      expect(Array.isArray(templatePaths)).toBe(true);
      expect(templatePaths.length).toBe(1); // Only one origin alternative
      
      // Verify template has correct structure
      const template = templatePaths[0];
      expect(template.path).toHaveLength(1);
      expect(template.path[0].symbol).toBe('origin');
      expect(template.path[0].chosenAlternative).toBe('#greeting#');
      expect(template.path[0].childChoices).toHaveLength(3); // All greeting alternatives
      
      // Check that all greeting alternatives are present
      const childChoices = template.path[0].childChoices!;
      const greetingValues = childChoices.map(choice => choice.chosenAlternative);
      expect(greetingValues).toContain('hello');
      expect(greetingValues).toContain('hi');
      expect(greetingValues).toContain('hey');
      
      // All child choices should be terminal
      childChoices.forEach(choice => {
        expect(choice.symbol).toBe('greeting');
        expect(choice.childChoices).toEqual([]);
      });
    });

    // TODO: Add circular reference test after fixing buildNode to handle circular references
    // test('should handle circular reference', () => {
    //   const grammar: GrammarRule = {
    //     origin: ['#A#'],
    //     A: ['#B#'],
    //     B: ['#A#']
    //   };
    //
    //   const analyzer = new GrammarAnalyzer(grammar);
    //   
    //   console.log('=== CIRCULAR REFERENCE TEST ===');
    //   
    //   // Should not throw, but should handle gracefully
    //   expect(() => {
    //     const templatePaths = analyzer.discoverAllTemplates();
    //     console.log('TemplatePaths:', JSON.stringify(templatePaths, null, 2));
    //   }).not.toThrow();
    // });
  });
});
