import { TemplateRenderer, RenderResult } from '../TemplateRenderer';
import { GenerationTemplate } from '../types';

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;

  beforeEach(() => {
    renderer = new TemplateRenderer();
  });

  describe('Basic rendering', () => {
    test('should render simple template with parameters', () => {
      const template: GenerationTemplate = {
        template: '#SP# #VP# #OP#',
        parameters: {
          SP: 'girl',
          VP: 'loves',
          OP: 'cat'
        },
        path: ['origin', 'SP', 'VP', 'OP']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('girl loves cat');
      expect(result.appliedParameters).toEqual({
        SP: 'girl',
        VP: 'loves',
        OP: 'cat'
      });
    });

    test('should render template with nested parameters', () => {
      const template: GenerationTemplate = {
        template: '#SP# #VP# #OP#',
        parameters: {
          SP: '#NP#',
          VP: 'loves',
          OP: '#NP#',
          NP: 'girl'
        },
        path: ['origin', 'SP', 'NP', 'VP', 'OP', 'NP']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('girl loves girl');
      expect(result.appliedParameters).toEqual({
        SP: '#NP#',
        VP: 'loves',
        OP: '#NP#',
        NP: 'girl'
      });
    });

    test('should handle template with no parameters', () => {
      const template: GenerationTemplate = {
        template: 'Hello world',
        parameters: {},
        path: ['origin']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('Hello world');
      expect(result.appliedParameters).toEqual({});
    });
  });

  describe('Missing symbols handling', () => {
    test('should replace missing symbols with ((missing:symbol))', () => {
      const template: GenerationTemplate = {
        template: '#SP# #VP# #missingSymbol#',
        parameters: {
          SP: 'girl',
          VP: 'loves'
        },
        path: ['origin', 'SP', 'VP']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('girl loves ((missing:missingSymbol))');
      expect(result.appliedParameters).toEqual({
        SP: 'girl',
        VP: 'loves'
      });
    });

    test('should handle template with only missing symbols', () => {
      const template: GenerationTemplate = {
        template: '#missing1# #missing2#',
        parameters: {},
        path: ['origin']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('((missing:missing1)) ((missing:missing2))');
      expect(result.appliedParameters).toEqual({});
    });
  });

  describe('Multiple occurrences', () => {
    test('should replace all occurrences of the same parameter', () => {
      const template: GenerationTemplate = {
        template: '#NP# loves #NP#',
        parameters: {
          NP: 'girl'
        },
        path: ['origin', 'NP', 'NP']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('girl loves girl');
      expect(result.appliedParameters).toEqual({
        NP: 'girl'
      });
    });

    test('should handle mixed parameters and missing symbols', () => {
      const template: GenerationTemplate = {
        template: '#NP# #VP# #missing# #NP#',
        parameters: {
          NP: 'girl',
          VP: 'loves'
        },
        path: ['origin', 'NP', 'VP', 'NP']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('girl loves ((missing:missing)) girl');
      expect(result.appliedParameters).toEqual({
        NP: 'girl',
        VP: 'loves'
      });
    });
  });

  describe('Complex scenarios', () => {
    test('should handle linguistic grammar template', () => {
      const template: GenerationTemplate = {
        template: '#SP# #VP# #OP#',
        parameters: {
          SP: '#NP#',
          VP: 'loves',
          OP: '#NP#',
          NP: 'girl'
        },
        path: ['origin', 'word_order', 'SVO', 'SP', 'NP', 'VP', 'OP', 'NP']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('girl loves girl');
      expect(result.appliedParameters).toEqual({
        SP: '#NP#',
        VP: 'loves',
        OP: '#NP#',
        NP: 'girl'
      });
    });

    test('should handle syllable grammar template', () => {
      const template: GenerationTemplate = {
        template: '#V##C#',
        parameters: {
          V: 'a',
          C: 'b'
        },
        path: ['origin', 'S', 'V', 'C']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('ab');
      expect(result.appliedParameters).toEqual({
        V: 'a',
        C: 'b'
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle empty template', () => {
      const template: GenerationTemplate = {
        template: '',
        parameters: {},
        path: []
      };

      const result = renderer.render(template);

      expect(result.content).toBe('');
      expect(result.appliedParameters).toEqual({});
    });

    test('should handle template with only spaces', () => {
      const template: GenerationTemplate = {
        template: '   ',
        parameters: {},
        path: []
      };

      const result = renderer.render(template);

      expect(result.content).toBe('   ');
      expect(result.appliedParameters).toEqual({});
    });

    test('should handle parameters that are not used in template', () => {
      const template: GenerationTemplate = {
        template: 'Hello world',
        parameters: {
          unused: 'value'
        },
        path: ['origin']
      };

      const result = renderer.render(template);

      expect(result.content).toBe('Hello world');
      expect(result.appliedParameters).toEqual({});
    });
  });
});
