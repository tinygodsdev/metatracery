import { GrammarAnalyzer } from '../GrammarAnalyzer';
import { GenerationResult, GenerationTemplate } from '../types';
// import { GrammarTree } from '../GrammarTree';
import { GrammarEngine, Grammar } from '../Engine';
import { rawToGenerationResult } from '../helpers';
import { GrammarProcessor } from '../GrammarEngine';

describe('DEBUG: GrammarAnalyzer Template Generation', () => {
  describe('Basic template generation', () => {
    test('should generate correct templates for simple grammar', () => {
      const grammar: Grammar = {
        origin: ["string", "#S#", '#S# #S#'],
        S: ['A', 'B']
      };

      // expected results:
      // string
      // A A
      // A B
      // B A
      // B B
      // B
      // A
      // in total 7 templates

      // const tree = new GrammarTree(grammar);
      const G = new GrammarEngine(grammar);
      const engine = new GrammarProcessor(grammar);
      // //   const templates = analyzer.generateAllTemplates();
      // const res = analyzer.discoverAllTemplates();

      console.log("count =", G.countStrings("origin", { S: "A" }))
      console.log("count =", G.countStrings("origin"))
      console.log("res =", G.expandAll("origin", { S: "A" }));
      console.log("res =", G.expandAll("origin", { S: "B" }));
      console.log("res =", G.expandAll("origin", { origin: "string" }));
      console.log("res =", G.expandAll("origin", { origin: "#S#" }));
      console.log("res =", G.expandAll("origin"));

      console.log('Generated templates:', JSON.stringify(G.expandAll("origin"), null, 2));

      const generated = G.generate("origin", { origin: "#S# #S#" });

      const results = rawToGenerationResult([generated]);

      console.log("result =", JSON.stringify(results, null, 2));

      console.log("result1 =", G.generate("origin"));
      console.log("result2 =", G.generate("origin"));
      console.log("result3 =", G.generate("origin"));
      console.log("result4 =", G.generate("origin"));
      console.log("result5 =", G.generate("origin"));
      console.log("result6 =", G.generate("origin"));
      console.log("result7 =", G.generate("origin"));

    });
  });
  
  describe('GenGrammar', () => {
    test('should generate correct templates for linguistic grammar', () => {
      const grammar: Grammar = {
        SP: ["#NP#"],
        OP: ["#NP#"],
        NP: ["girl", "cat", "dog", "bird"],
        VP: ["loves", "eats", "pets", "chases"],
        SVO: ["#SP# #VP# #OP#"],
        VSO: ["#VP# #SP# #OP#"],
        SOV: ["#SP# #OP# #VP#"],
        word_order: ["#SVO#", "#VSO#", "#SOV#"],
        origin: ["#word_order#"]
      };

      const engine = new GrammarProcessor(grammar);

      const vsoResult = engine.generateWithParameters('origin', {
        NP: 'dog',
        VP: 'chases',
        word_order: 'VSO'
      });

      // console.log("vsoResult =", JSON.stringify(vsoResult, null, 2));

      // // Count without constraints
      // console.log("count =", G.count("origin")); // 3 orders * 4*4*4 = 192

      // // Count with constraint word_order = SVO
      // console.log("count SVO =", G.count("origin", { word_order: "SVO" })); // 64

      // // One random sample with constraint
      // console.log("sample =", G.sample("origin", { word_order: "SVO" }));

      // // N random unique samples
      // console.log("5 uniq samples =", G.sampleN(5, "origin", { word_order: ["SVO"] }, true));

      // // Full expansion with constraint and cap
      // console.log("all SVO size =", G.expandAll("origin", { word_order: "SVO" }).length);
    });
  });
  //     test('should generate templates with correct parameter order', () => {
  //       const grammar = {
  //         origin: ['#A# #B# #A#'],
  //         A: ['first', 'second'],
  //         B: ['middle']
  //       };

  //       const analyzer = new GrammarAnalyzer(grammar);
  //       const templates = analyzer.generateAllTemplates();

  //       console.log('Ordered templates:', JSON.stringify(templates, null, 2));

  //       expect(templates.length).toBe(4); // 2 A values × 1 B value × 2 A values = 4 combinations

  //       // Check that parameters are in correct order
  //       const firstTemplate = templates[0];
  //       expect(firstTemplate.template).toBe('#A# #B# #A#');
  //       expect(firstTemplate.parameters.length).toBe(3); // A, B, A
  //       expect(firstTemplate.parameters[0].symbol).toBe('A');
  //       expect(firstTemplate.parameters[1].symbol).toBe('B');
  //       expect(firstTemplate.parameters[2].symbol).toBe('A');
  //     });
  //   });

  //   describe('Template structure validation', () => {
  //     test('should have correct template structure', () => {
  //       const grammar = {
  //         origin: ['#S#'],
  //         S: ['#A#'],
  //         A: ['hello']
  //       };

  //       const analyzer = new GrammarAnalyzer(grammar);
  //       const templates = analyzer.generateAllTemplates();

  //       expect(templates.length).toBe(1);

  //       const template = templates[0];

  //       // Check template structure
  //       expect(template).toHaveProperty('template');
  //       expect(template).toHaveProperty('parameters');
  //       expect(template).toHaveProperty('path');

  //       // Check parameters structure
  //       expect(Array.isArray(template.parameters)).toBe(true);
  //       template.parameters.forEach(param => {
  //         expect(param).toHaveProperty('symbol');
  //         expect(param).toHaveProperty('value');
  //         expect(typeof param.symbol).toBe('string');
  //         expect(typeof param.value).toBe('string');
  //       });

  //       // Check path structure
  //       expect(Array.isArray(template.path)).toBe(true);
  //       template.path.forEach(step => {
  //         expect(typeof step).toBe('string');
  //       });
  //     });


  //   describe('Edge cases', () => {
  //     test('should handle empty grammar', () => {
  //       const grammar = {
  //         origin: []
  //       };

  //       const analyzer = new GrammarAnalyzer(grammar);
  //       const templates = analyzer.generateAllTemplates();

  //       expect(templates.length).toBe(0);
  //     });

  //     test('should handle grammar with no parameters', () => {
  //       const grammar = {
  //         origin: ['hello world']
  //       };

  //       const analyzer = new GrammarAnalyzer(grammar);
  //       const templates = analyzer.generateAllTemplates();

  //       expect(templates.length).toBe(1);
  //       expect(templates[0].template).toBe('hello world');
  //       expect(templates[0].parameters.length).toBe(0);
  //     });
  //   });
});
