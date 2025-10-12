import { TemplatePath, PathChoice, GenerationTemplate } from '../types';

describe('TemplatePath to GenerationTemplate Conversion', () => {
  
  /**
   * Converts TemplatePath to GenerationTemplate
   * This function will be moved to GrammarAnalyzer later
   */
  function convertTemplatePathToTemplate(templatePath: TemplatePath): GenerationTemplate {
    const parameters: Array<{symbol: string, value: string}> = [];
    const path: string[] = [];
    
    // Extract parameters and path from PathChoice structure
    function extractFromPathChoices(choices: PathChoice[]) {
      for (const choice of choices) {
        path.push(choice.symbol);
        
        // Add all choices to parameters EXCEPT origin (origin is the template itself)
        if (choice.symbol !== 'origin') {
          parameters.push({
            symbol: choice.symbol,
            value: choice.chosenAlternative
          });
        }
        
        // If this choice has child choices, process them recursively
        if (choice.childChoices && choice.childChoices.length > 0) {
          extractFromPathChoices(choice.childChoices);
        }
      }
    }
    
    extractFromPathChoices(templatePath.path);
    
    // Extract final template from the origin choice
    const finalTemplate = extractFinalTemplate(templatePath.path);
    
    return {
      template: finalTemplate,
      parameters,
      path
    };
  }

  /**
   * Extracts the final template from the origin choice
   * The final template is the chosen alternative of the origin rule
   */
  function extractFinalTemplate(choices: PathChoice[]): string {
    // The first choice should always be origin
    if (choices.length > 0 && choices[0].symbol === 'origin') {
      return choices[0].chosenAlternative;
    }
    return '';
  }

  describe('Simple grammar conversion', () => {
    test('should convert simple TemplatePath to GenerationTemplate', () => {
      const templatePath: TemplatePath = {
        path: [
          {
            symbol: "origin",
            chosenAlternative: "#S# #S# #S#",
            childChoices: [
              { symbol: "S", chosenAlternative: "A" },
              { symbol: "S", chosenAlternative: "B" },
              { symbol: "S", chosenAlternative: "C" }
            ]
          }
        ]
      };

      const result = convertTemplatePathToTemplate(templatePath);

      expect(result.template).toBe("#S# #S# #S#");
      expect(result.parameters).toEqual([
        { symbol: "S", value: "A" },
        { symbol: "S", value: "B" },
        { symbol: "S", value: "C" }
      ]);
      expect(result.path).toEqual(["origin", "S", "S", "S"]);
    });

    test('should convert TemplatePath with different parameter order', () => {
      const templatePath: TemplatePath = {
        path: [
          {
            symbol: "origin",
            chosenAlternative: "#A# #B# #A#",
            childChoices: [
              { symbol: "A", chosenAlternative: "first" },
              { symbol: "B", chosenAlternative: "middle" },
              { symbol: "A", chosenAlternative: "second" }
            ]
          }
        ]
      };

      const result = convertTemplatePathToTemplate(templatePath);

      expect(result.template).toBe("#A# #B# #A#");
      expect(result.parameters).toEqual([
        { symbol: "A", value: "first" },
        { symbol: "B", value: "middle" },
        { symbol: "A", value: "second" }
      ]);
      expect(result.path).toEqual(["origin", "A", "B", "A"]);
    });
  });

  describe('Complex grammar conversion', () => {
    test('should convert nested TemplatePath to GenerationTemplate', () => {
      const templatePath: TemplatePath = {
        path: [
          {
            symbol: "origin",
            chosenAlternative: "#word_order#",
            childChoices: [
              {
                symbol: "word_order",
                chosenAlternative: "#SVO#",
                childChoices: [
                  {
                    symbol: "SVO",
                    chosenAlternative: "#SP# #VP# #OP#",
                    childChoices: [
                      {
                        symbol: "SP",
                        chosenAlternative: "#NP#",
                        childChoices: [
                          { symbol: "NP", chosenAlternative: "girl" }
                        ]
                      },
                      { symbol: "VP", chosenAlternative: "loves" },
                      {
                        symbol: "OP",
                        chosenAlternative: "#NP#",
                        childChoices: [
                          { symbol: "NP", chosenAlternative: "cat" }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = convertTemplatePathToTemplate(templatePath);

      expect(result.template).toBe("#word_order#");
      expect(result.parameters).toEqual([
        { symbol: "word_order", value: "#SVO#" },
        { symbol: "SVO", value: "#SP# #VP# #OP#" },
        { symbol: "SP", value: "#NP#" },
        { symbol: "NP", value: "girl" },
        { symbol: "VP", value: "loves" },
        { symbol: "OP", value: "#NP#" },
        { symbol: "NP", value: "cat" }
      ]);
      expect(result.path).toEqual([
        "origin", "word_order", "SVO", "SP", "NP", "VP", "OP", "NP"
      ]);
    });
  });

  describe('Edge cases', () => {
    test('should handle TemplatePath with no parameters', () => {
      const templatePath: TemplatePath = {
        path: [
          {
            symbol: "origin",
            chosenAlternative: "hello world"
          }
        ]
      };

      const result = convertTemplatePathToTemplate(templatePath);

      expect(result.template).toBe("hello world");
      expect(result.parameters).toEqual([]);
      expect(result.path).toEqual(["origin"]);
    });

    test('should handle TemplatePath with single parameter', () => {
      const templatePath: TemplatePath = {
        path: [
          {
            symbol: "origin",
            chosenAlternative: "#S#",
            childChoices: [
              { symbol: "S", chosenAlternative: "single" }
            ]
          }
        ]
      };

      const result = convertTemplatePathToTemplate(templatePath);

      expect(result.template).toBe("#S#");
      expect(result.parameters).toEqual([
        { symbol: "S", value: "single" }
      ]);
      expect(result.path).toEqual(["origin", "S"]);
    });
  });
});
