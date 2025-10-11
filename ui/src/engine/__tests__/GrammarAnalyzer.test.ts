import { GrammarAnalyzer } from '../GrammarAnalyzer';
import type { GrammarRule } from '../types';

describe('GrammarAnalyzer', () => {
  const linguisticGrammar: GrammarRule = {
    "SP": ["#NP#"],
    "OP": ["#NP#"],
    "NP": ["girl", "cat"],
    "VP": ["loves", "eats", "pets"],
    "SVO": ["#SP# #VP# #OP#"],
    "VSO": ["#VP# #SP# #OP#"],
    "word_order": ["#SVO#", "#VSO#"],
    "origin": ["#word_order#"]
  };

  const basicGrammar: GrammarRule = {
    "S": ["A", "B", "C"],
    "origin": ["#S# #S# #S#"]
  };

  describe('Basic Grammar Analysis', () => {
    test('should analyze basic S grammar correctly', () => {
      const analyzer = new GrammarAnalyzer(basicGrammar);
      
      const structureInfo = analyzer.getStructureInfo();
      console.log('Basic grammar structure:', structureInfo);
      
      // Should have 3^3 = 27 paths
      expect(structureInfo.totalPaths).toBe(27);
      
      // S should appear 3 times
      expect(structureInfo.parameterCounts.S).toBe(3);
    });

    test('should print basic grammar tree', () => {
      const analyzer = new GrammarAnalyzer(basicGrammar);
      console.log('Basic grammar tree:');
      analyzer.printTree();
    });
  });

  describe('Linguistic Grammar Analysis', () => {
    test('should analyze linguistic grammar correctly', () => {
      const analyzer = new GrammarAnalyzer(linguisticGrammar);
      
      const structureInfo = analyzer.getStructureInfo();
      console.log('Linguistic grammar structure:', structureInfo);
      
      // Should have 2 × 2 × 3 × 2 = 24 paths
      // word_order: 2 alternatives
      // NP: 2 alternatives, used in SP and OP (2 times)
      // VP: 3 alternatives
      expect(structureInfo.totalPaths).toBe(24);
      
      // word_order should appear 1 time
      expect(structureInfo.parameterCounts.word_order).toBe(1);
      
      // NP should appear 4 times (2 in SVO + 2 in VSO)
      expect(structureInfo.parameterCounts.NP).toBe(4);
      
      // VP should appear 2 times (1 in SVO + 1 in VSO)
      expect(structureInfo.parameterCounts.VP).toBe(2);
    });

    test('should print linguistic grammar tree', () => {
      const analyzer = new GrammarAnalyzer(linguisticGrammar);
      console.log('Linguistic grammar tree:');
      analyzer.printTree();
    });

    test('should count all paths correctly', () => {
      const analyzer = new GrammarAnalyzer(linguisticGrammar);
      
      const pathCount = analyzer.countAllPaths();
      console.log('Total paths:', pathCount);
      
      expect(pathCount).toBe(24);
    });
  });

  describe('Tree Structure Analysis', () => {
    test('should build correct tree structure', () => {
      const analyzer = new GrammarAnalyzer(linguisticGrammar);
      
      // This test will help us understand the tree structure
      analyzer.printTree();
      
      const structureInfo = analyzer.getStructureInfo();
      expect(structureInfo.treeDepth).toBeGreaterThan(0);
    });
  });
});
