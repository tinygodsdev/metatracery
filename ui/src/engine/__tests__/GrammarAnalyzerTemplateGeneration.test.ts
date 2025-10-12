import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GenerationTemplate } from '../types';

describe('GrammarAnalyzer Template Generation', () => {
  describe('Basic template generation', () => {
    test('should generate correct templates for simple grammar', () => {
      const grammar = {
        origin: ['#S# #S# #S#'],
        S: ['A', 'B', 'C']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templates = analyzer.generateAllTemplates();

      console.log('Generated templates:', JSON.stringify(templates, null, 2));

      expect(templates.length).toBe(27); // 3^3 = 27 combinations

      // Check first template structure
      const firstTemplate = templates[0];
      expect(firstTemplate.template).toBe('#S# #S# #S#');
      expect(Array.isArray(firstTemplate.parameters)).toBe(true);
      expect(firstTemplate.parameters.length).toBe(3); // Should have 3 S parameters
      expect(firstTemplate.path).toContain('origin');
    });

    test('should generate correct templates for linguistic grammar', () => {
      const grammar = {
        origin: ['#word_order#'],
        word_order: ['#SVO#', '#VSO#'],
        SVO: ['#SP# #VP# #OP#'],
        VSO: ['#VP# #SP# #OP#'],
        SP: ['#NP#'],
        VP: ['loves', 'eats', 'pets'],
        OP: ['#NP#'],
        NP: ['girl', 'cat']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templates = analyzer.generateAllTemplates();

      console.log('Linguistic templates count:', templates.length);
      console.log('First few templates:', JSON.stringify(templates.slice(0, 3), null, 2));

      expect(templates.length).toBe(24); // 2 word_orders × 2 NPs × 2 NPs × 3 VPs = 24

      // Check template structure
      const firstTemplate = templates[0];
      expect(firstTemplate.template).toBe('#word_order#');
      expect(Array.isArray(firstTemplate.parameters)).toBe(true);
      expect(firstTemplate.path).toContain('origin');
    });

    test('should generate templates with correct parameter order', () => {
      const grammar = {
        origin: ['#A# #B# #A#'],
        A: ['first', 'second'],
        B: ['middle']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templates = analyzer.generateAllTemplates();

      console.log('Ordered templates:', JSON.stringify(templates, null, 2));

      expect(templates.length).toBe(4); // 2 A values × 1 B value × 2 A values = 4 combinations

      // Check that parameters are in correct order
      const firstTemplate = templates[0];
      expect(firstTemplate.template).toBe('#A# #B# #A#');
      expect(firstTemplate.parameters.length).toBe(3); // A, B, A
      expect(firstTemplate.parameters[0].symbol).toBe('A');
      expect(firstTemplate.parameters[1].symbol).toBe('B');
      expect(firstTemplate.parameters[2].symbol).toBe('A');
    });
  });

  describe('Template structure validation', () => {
    test('should have correct template structure', () => {
      const grammar = {
        origin: ['#S#'],
        S: ['#A#'],
        A: ['hello']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templates = analyzer.generateAllTemplates();

      expect(templates.length).toBe(1);
      
      const template = templates[0];
      
      // Check template structure
      expect(template).toHaveProperty('template');
      expect(template).toHaveProperty('parameters');
      expect(template).toHaveProperty('path');
      
      // Check parameters structure
      expect(Array.isArray(template.parameters)).toBe(true);
      template.parameters.forEach(param => {
        expect(param).toHaveProperty('symbol');
        expect(param).toHaveProperty('value');
        expect(typeof param.symbol).toBe('string');
        expect(typeof param.value).toBe('string');
      });
      
      // Check path structure
      expect(Array.isArray(template.path)).toBe(true);
      template.path.forEach(step => {
        expect(typeof step).toBe('string');
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle empty grammar', () => {
      const grammar = {
        origin: []
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templates = analyzer.generateAllTemplates();

      expect(templates.length).toBe(0);
    });

    test('should handle grammar with no parameters', () => {
      const grammar = {
        origin: ['hello world']
      };

      const analyzer = new GrammarAnalyzer(grammar);
      const templates = analyzer.generateAllTemplates();

      expect(templates.length).toBe(1);
      expect(templates[0].template).toBe('hello world');
      expect(templates[0].parameters.length).toBe(0);
    });
  });
});
