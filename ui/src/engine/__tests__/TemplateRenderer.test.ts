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

    test('should handle multiple occurrences of the same parameter with single value', () => {
      const template: GenerationTemplate = {
        template: '#NP# loves #NP#',
        parameters: [
          { symbol: 'NP', value: 'cat' },
          { symbol: 'NP', value: 'cat' }  // Same value for second occurrence
        ],
        path: ['origin', 'NP', 'NP']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('cat loves cat');
      expect(result.appliedParameters).toEqual({
        NP: 'cat'
      });
    });

    test('should handle multiple occurrences with insufficient parameters', () => {
      const template: GenerationTemplate = {
        template: '#NP# loves #NP#',
        parameters: [
          { symbol: 'NP', value: 'cat' }  // Only one parameter for two occurrences
        ],
        path: ['origin', 'NP']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('cat loves ((missing:NP))');
      expect(result.appliedParameters).toEqual({
        NP: 'cat'
      });
    });

    test('should handle multiple occurrences with different values in order', () => {
      const template: GenerationTemplate = {
        template: '#S# #S# #S#',
        parameters: [
          { symbol: 'S', value: 'A' },  // first occurrence
          { symbol: 'S', value: 'B' },  // second occurrence
          { symbol: 'S', value: 'C' }   // third occurrence
        ],
        path: ['origin', 'S', 'S', 'S']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('A B C');
      expect(result.appliedParameters).toEqual({
        S: 'C'  // Only the last value is recorded (this might need adjustment)
      });
    });

    test('should handle complex template with repeated symbols', () => {
      const template: GenerationTemplate = {
        template: '#A# #B# #A# #C# #B#',
        parameters: [
          { symbol: 'A', value: 'first' },   // first A
          { symbol: 'B', value: 'second' },  // first B
          { symbol: 'A', value: 'third' },   // second A
          { symbol: 'C', value: 'fourth' },  // C
          { symbol: 'B', value: 'fifth' }    // second B
        ],
        path: ['origin', 'A', 'B', 'A', 'C', 'B']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('first second third fourth fifth');
      expect(result.appliedParameters).toEqual({
        A: 'third',  // Last value for A
        B: 'fifth',  // Last value for B
        C: 'fourth'  // Value for C
      });
    });
  });

  describe('Performance tests', () => {
    test('should handle complex template with many parameters efficiently', () => {
      const template: GenerationTemplate = {
        template: '#A# #B# #C# #D# #E# #F# #G# #H# #I# #J#',
        parameters: [
          { symbol: 'A', value: '#A1#' },
          { symbol: 'B', value: '#B1#' },
          { symbol: 'C', value: '#C1#' },
          { symbol: 'D', value: '#D1#' },
          { symbol: 'E', value: '#E1#' },
          { symbol: 'F', value: '#F1#' },
          { symbol: 'G', value: '#G1#' },
          { symbol: 'H', value: '#H1#' },
          { symbol: 'I', value: '#I1#' },
          { symbol: 'J', value: '#J1#' },
          { symbol: 'A1', value: 'hello' },
          { symbol: 'B1', value: 'beautiful' },
          { symbol: 'C1', value: 'world' },
          { symbol: 'D1', value: 'with' },
          { symbol: 'E1', value: 'amazing' },
          { symbol: 'F1', value: 'people' },
          { symbol: 'G1', value: 'and' },
          { symbol: 'H1', value: 'wonderful' },
          { symbol: 'I1', value: 'places' },
          { symbol: 'J1', value: 'everywhere' }
        ],
        path: ['origin', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1']
      };

      const result = renderer.render(template);
      expect(result.content).toBe('hello beautiful world with amazing people and wonderful places everywhere');
      expect(Object.keys(result.appliedParameters)).toHaveLength(20);
    });

    test('should handle 1000 render calls efficiently', () => {
      const template: GenerationTemplate = {
        template: '#A# #B# #C# #D# #E#',
        parameters: [
          { symbol: 'A', value: '#A1#' },
          { symbol: 'B', value: '#B1#' },
          { symbol: 'C', value: '#C1#' },
          { symbol: 'D', value: '#D1#' },
          { symbol: 'E', value: '#E1#' },
          { symbol: 'A1', value: 'hello' },
          { symbol: 'B1', value: 'world' },
          { symbol: 'C1', value: 'with' },
          { symbol: 'D1', value: 'nested' },
          { symbol: 'E1', value: 'parameters' }
        ],
        path: ['origin', 'A', 'B', 'C', 'D', 'E', 'A1', 'B1', 'C1', 'D1', 'E1']
      };

      const startTime = Date.now();
      
      // Perform 1000 render calls
      for (let i = 0; i < 1000; i++) {
        const result = renderer.render(template);
        expect(result.content).toBe('hello world with nested parameters');
        expect(Object.keys(result.appliedParameters)).toHaveLength(10);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`1000 render calls took ${totalTime}ms (${totalTime / 1000}ms per call)`);
      
      // Should complete in reasonable time (less than 1 second for 1000 calls)
      expect(totalTime).toBeLessThan(1000);
    });

    test('should handle very deep nesting efficiently', () => {
      const template: GenerationTemplate = {
        template: '#A#',
        parameters: [
          { symbol: 'A', value: '#B#' },
          { symbol: 'B', value: '#C#' },
          { symbol: 'C', value: '#D#' },
          { symbol: 'D', value: '#E#' },
          { symbol: 'E', value: '#F#' },
          { symbol: 'F', value: '#G#' },
          { symbol: 'G', value: '#H#' },
          { symbol: 'H', value: '#I#' },
          { symbol: 'I', value: '#J#' },
          { symbol: 'J', value: '#K#' },
          { symbol: 'K', value: '#L#' },
          { symbol: 'L', value: '#M#' },
          { symbol: 'M', value: '#N#' },
          { symbol: 'N', value: '#O#' },
          { symbol: 'O', value: 'final' }
        ],
        path: ['origin', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
      };

      const startTime = Date.now();
      
      // Perform 100 render calls with deep nesting
      for (let i = 0; i < 100; i++) {
        const result = renderer.render(template);
        expect(result.content).toBe('final');
        expect(Object.keys(result.appliedParameters)).toHaveLength(15);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`100 deep nesting render calls took ${totalTime}ms (${totalTime / 100}ms per call)`);
      
      // Should complete in reasonable time (less than 500ms for 100 calls)
      expect(totalTime).toBeLessThan(500);
    });

    test('should handle large template with many symbols efficiently', () => {
      // Create a large template with 26 different symbols (A-Z)
      const symbols = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z
      const template: GenerationTemplate = {
        template: symbols.map(s => `#${s}#`).join(' '),
        parameters: symbols.map(s => ({ symbol: s, value: `value-${s}` })),
        path: ['origin', ...symbols]
      };

      const startTime = Date.now();
      
      // Perform 50 render calls with large template
      for (let i = 0; i < 50; i++) {
        const result = renderer.render(template);
        const expectedContent = symbols.map(s => `value-${s}`).join(' ');
        expect(result.content).toBe(expectedContent);
        expect(Object.keys(result.appliedParameters)).toHaveLength(26);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`50 large template render calls took ${totalTime}ms (${totalTime / 50}ms per call)`);
      
      // Should complete in reasonable time (less than 200ms for 50 calls)
      expect(totalTime).toBeLessThan(200);
    });
  });
});
