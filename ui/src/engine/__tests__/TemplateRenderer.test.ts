import { TemplateRenderer, RenderResult } from '../TemplateRenderer';
import { GenerationTemplate } from '../types';

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;

  beforeEach(() => {
    renderer = new TemplateRenderer();
  });

  describe('Ordered parameter replacement', () => {
    test('should replace parameters in the exact order they were added', () => {
      const template: GenerationTemplate = {
        template: '#origin#',
        parameters: [
          { symbol: 'origin', value: '#S##R#' },
          { symbol: 'S', value: '#A#' },
          { symbol: 'R', value: '#B#' },
          { symbol: 'A', value: 'hello' },
          { symbol: 'B', value: 'world' }
        ],
        path: ['origin', 'S', 'R', 'A', 'B']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('helloworld');
      expect(result.appliedParameters).toEqual({
        origin: '#S##R#',
        S: '#A#',
        R: '#B#',
        A: 'hello',
        B: 'world'
      });
    });

    test('should handle simple template with direct values', () => {
      const template: GenerationTemplate = {
        template: '#SP# #VP# #OP#',
        parameters: [
          { symbol: 'SP', value: 'girl' },
          { symbol: 'VP', value: 'loves' },
          { symbol: 'OP', value: 'cat' }
        ],
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

    test('should handle mixed literal and parameter values', () => {
      const template: GenerationTemplate = {
        template: '#S# girl',
        parameters: [
          { symbol: 'S', value: '#A#' },
          { symbol: 'A', value: 'hello' }
        ],
        path: ['origin', 'S', 'A']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('hello girl');
      expect(result.appliedParameters).toEqual({
        S: '#A#',
        A: 'hello'
      });
    });

    test('should handle deep nesting', () => {
      const template: GenerationTemplate = {
        template: '#A#',
        parameters: [
          { symbol: 'A', value: '#B#' },
          { symbol: 'B', value: '#C#' },
          { symbol: 'C', value: '#D#' },
          { symbol: 'D', value: 'final' }
        ],
        path: ['origin', 'A', 'B', 'C', 'D']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('final');
      expect(result.appliedParameters).toEqual({
        A: '#B#',
        B: '#C#',
        C: '#D#',
        D: 'final'
      });
    });

    test('should handle multiple origin alternatives', () => {
      const template: GenerationTemplate = {
        template: '#S##R#',
        parameters: [
          { symbol: 'S', value: '#A#' },
          { symbol: 'R', value: '#B#' },
          { symbol: 'A', value: 'hello' },
          { symbol: 'B', value: 'world' }
        ],
        path: ['origin', 'S', 'R', 'A', 'B']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('helloworld');
      expect(result.appliedParameters).toEqual({
        S: '#A#',
        R: '#B#',
        A: 'hello',
        B: 'world'
      });
    });
  });

  describe('Missing symbols handling', () => {
    test('should replace missing symbols with ((missing:symbol))', () => {
      const template: GenerationTemplate = {
        template: 'Hello, #name#! You are #age# years old.',
        parameters: [
          { symbol: 'name', value: 'World' }
        ],
        path: ['origin', 'name']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('Hello, World! You are ((missing:age)) years old.');
      expect(result.appliedParameters).toEqual({
        name: 'World'
      });
    });

    test('should handle template with only missing symbols', () => {
      const template: GenerationTemplate = {
        template: '#missing1# #missing2#',
        parameters: [],
        path: []
      };

      const result = renderer.render(template);
      expect(result.content).toBe('((missing:missing1)) ((missing:missing2))');
      expect(result.appliedParameters).toEqual({});
    });
  });

  describe('Edge cases', () => {
    test('should handle empty template', () => {
      const template: GenerationTemplate = {
        template: '',
        parameters: [{ symbol: 'a', value: 'b' }],
        path: []
      };

      const result = renderer.render(template);
      expect(result.content).toBe('');
      expect(result.appliedParameters).toEqual({});
    });

    test('should handle template with only spaces', () => {
      const template: GenerationTemplate = {
        template: '   ',
        parameters: [{ symbol: 'a', value: 'b' }],
        path: []
      };

      const result = renderer.render(template);
      expect(result.content).toBe('   ');
      expect(result.appliedParameters).toEqual({});
    });

    test('should handle parameters that are not used in template', () => {
      const template: GenerationTemplate = {
        template: 'Hello World',
        parameters: [{ symbol: 'unused', value: 'parameter' }],
        path: []
      };

      const result = renderer.render(template);
      expect(result.content).toBe('Hello World');
      expect(result.appliedParameters).toEqual({});
    });

    test('should handle multiple occurrences of the same parameter', () => {
      const template: GenerationTemplate = {
        template: '#NP# loves #NP#',
        parameters: [
          { symbol: 'NP', value: 'cat' }
        ],
        path: ['origin', 'NP']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('cat loves cat');
      expect(result.appliedParameters).toEqual({
        NP: 'cat'
      });
    });
  });
});
