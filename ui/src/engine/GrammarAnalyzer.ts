import type { GrammarRule } from './types';

/**
 * Represents a node in the grammar tree
 */
interface GrammarNode {
  symbol: string;
  alternatives: string[];
  isParameter: boolean; // true if has multiple alternatives
  isSequence: boolean; // true if all children are used together (not alternatives)
  children: GrammarNode[];
}

/**
 * Represents a path through the grammar tree
 */
interface GrammarPath {
  nodes: Array<{
    symbol: string;
    value: string;
    occurrence: number; // which occurrence of this symbol in the path
  }>;
}

/**
 * Grammar analyzer that builds a tree and counts all possible paths
 */
export class GrammarAnalyzer {
  private grammar: GrammarRule;
  private rootNode: GrammarNode | null = null;

  constructor(grammar: GrammarRule) {
    this.grammar = grammar;
    this.buildTree();
  }

  /**
   * Builds the grammar tree from the grammar rules
   */
  private buildTree(): void {
    // Start from the origin rule
    const originRule = this.grammar.origin?.[0];
    if (!originRule) {
      throw new Error('No origin rule found in grammar');
    }

    this.rootNode = this.buildNode('origin', originRule);
  }

  /**
   * Recursively builds a node and its children
   */
  private buildNode(symbol: string, rule: string): GrammarNode {
    const alternatives = this.grammar[symbol] || [];
    const isParameter = alternatives.length > 1;

    const node: GrammarNode = {
      symbol,
      alternatives,
      isParameter,
      isSequence: false, // Will be determined below
      children: []
    };

    // For each alternative, find symbol references and build children
    for (const alternative of alternatives) {
      const symbolRefs = this.extractSymbolReferences(alternative);
      
      // Determine if this is a sequence (multiple symbols in one alternative)
      if (symbolRefs.length > 1) {
        node.isSequence = true;
      }
      
      for (const symbolRef of symbolRefs) {
        const childNode = this.buildNode(symbolRef.symbol, alternative);
        node.children.push(childNode);
      }
    }

    return node;
  }

  /**
   * Extracts symbol references from a rule string
   */
  private extractSymbolReferences(rule: string): Array<{symbol: string, fullMatch: string}> {
    const references: Array<{symbol: string, fullMatch: string}> = [];
    const symbolPattern = /#([^#]+)#/g;
    let match;

    while ((match = symbolPattern.exec(rule)) !== null) {
      references.push({
        symbol: match[1],
        fullMatch: match[0]
      });
    }

    return references;
  }

  /**
   * Counts all possible paths from root to leaves
   */
  public countAllPaths(): number {
    const originRule = this.grammar.origin?.[0];
    if (!originRule) {
      return 0;
    }

    return this.countRuleCombinations(originRule);
  }

  /**
   * Counts all possible combinations for a rule
   */
  private countRuleCombinations(rule: string): number {
    const symbolRefs = this.extractSymbolReferences(rule);
    
    if (symbolRefs.length === 0) {
      // Terminal rule
      return 1;
    }

    let totalCombinations = 1;
    
    // For each symbol reference, multiply by its alternatives
    for (const symbolRef of symbolRefs) {
      const symbol = symbolRef.symbol;
      const alternatives = this.grammar[symbol] || [];
      
      if (alternatives.length > 1) {
        // Parameter with multiple alternatives - sum combinations from all alternatives
        let alternativeCombinations = 0;
        for (const alternative of alternatives) {
          const subCombinations = this.countRuleCombinations(alternative);
          alternativeCombinations += subCombinations;
        }
        totalCombinations *= alternativeCombinations;
      } else if (alternatives.length === 1) {
        // Single alternative - recursively count its combinations
        const subCombinations = this.countRuleCombinations(alternatives[0]);
        totalCombinations *= subCombinations;
      }
    }

    return totalCombinations;
  }

  /**
   * Finds all possible paths from a node to leaves
   */
  private findAllPaths(node: GrammarNode): GrammarPath[] {
    if (node.children.length === 0) {
      // Leaf node - return a single path
      return [{
        nodes: [{
          symbol: node.symbol,
          value: node.alternatives[0] || '',
          occurrence: 1
        }]
      }];
    }

    const allPaths: GrammarPath[] = [];

    // For each alternative of this node
    for (const alternative of node.alternatives) {
      // Find all symbol references in this alternative
      const symbolRefs = this.extractSymbolReferences(alternative);
      
      if (symbolRefs.length === 0) {
        // Terminal alternative - add as leaf
        allPaths.push({
          nodes: [{
            symbol: node.symbol,
            value: alternative,
            occurrence: 1
          }]
        });
        continue;
      }

      // For each symbol reference, get all possible paths
      const childPaths: GrammarPath[][] = [];
      for (const symbolRef of symbolRefs) {
        const childNode = node.children.find(child => child.symbol === symbolRef.symbol);
        if (childNode) {
          childPaths.push(this.findAllPaths(childNode));
        }
      }

      // Generate all combinations of child paths
      const combinations = this.generatePathCombinations(childPaths);
      
      // Add this node to each combination
      for (const combination of combinations) {
        const allNodes = [{
          symbol: node.symbol,
          value: alternative,
          occurrence: 1
        }];
        
        // Add all nodes from the combination
        allNodes.push(...combination.nodes);
        
        allPaths.push({
          nodes: allNodes
        });
      }
    }

    return allPaths;
  }

  /**
   * Generates all combinations of paths from different children
   */
  private generatePathCombinations(childPaths: GrammarPath[][]): GrammarPath[] {
    if (childPaths.length === 0) {
      return [];
    }

    if (childPaths.length === 1) {
      return childPaths[0];
    }

    const combinations: GrammarPath[] = [];
    const firstChildPaths = childPaths[0];
    const remainingChildPaths = childPaths.slice(1);

    for (const firstPath of firstChildPaths) {
      const remainingCombinations = this.generatePathCombinations(remainingChildPaths);
      
      if (remainingCombinations.length === 0) {
        combinations.push(firstPath);
      } else {
        for (const remainingCombination of remainingCombinations) {
          combinations.push({
            nodes: [...firstPath.nodes, ...remainingCombination.nodes]
          });
        }
      }
    }

    return combinations;
  }

  /**
   * Gets detailed information about the grammar structure
   */
  public getStructureInfo(): {
    totalPaths: number;
    parameterCounts: Record<string, number>;
    treeDepth: number;
  } {
    const originRule = this.grammar.origin?.[0];
    if (!originRule) {
      return {
        totalPaths: 0,
        parameterCounts: {},
        treeDepth: 0
      };
    }

    const totalPaths = this.countRuleCombinations(originRule);
    
    // Count parameter occurrences by analyzing the grammar structure
    const parameterCounts: Record<string, number> = {};
    this.analyzeParameterCounts(originRule, parameterCounts);

    return {
      totalPaths,
      parameterCounts,
      treeDepth: this.getTreeDepth(this.rootNode)
    };
  }

  /**
   * Analyzes parameter counts in a rule
   */
  private analyzeParameterCounts(rule: string, counts: Record<string, number>): void {
    const symbolRefs = this.extractSymbolReferences(rule);
    
    for (const symbolRef of symbolRefs) {
      const symbol = symbolRef.symbol;
      const alternatives = this.grammar[symbol] || [];
      
      if (alternatives.length > 1) {
        // Parameter with multiple alternatives - analyze all alternatives
        counts[symbol] = (counts[symbol] || 0) + 1;
        for (const alternative of alternatives) {
          this.analyzeParameterCounts(alternative, counts);
        }
      } else if (alternatives.length === 1) {
        // Single alternative - recursively analyze
        this.analyzeParameterCounts(alternatives[0], counts);
      }
    }
  }

  /**
   * Gets the depth of the tree
   */
  private getTreeDepth(node: GrammarNode | null): number {
    if (!node) {
      return 0;
    }

    if (node.children.length === 0) {
      return 1;
    }

    let maxChildDepth = 0;
    for (const child of node.children) {
      maxChildDepth = Math.max(maxChildDepth, this.getTreeDepth(child));
    }

    return 1 + maxChildDepth;
  }

  /**
   * Prints the tree structure for debugging
   */
  public printTree(): void {
    if (!this.rootNode) {
      console.log('No tree to print');
      return;
    }

    this.printNode(this.rootNode, 0);
  }

  /**
   * Recursively prints a node and its children
   */
  private printNode(node: GrammarNode, depth: number): void {
    const indent = '  '.repeat(depth);
    const paramIndicator = node.isParameter ? ' (PARAM)' : '';
    const sequenceIndicator = node.isSequence ? ' (SEQUENCE)' : '';
    console.log(`${indent}${node.symbol}${paramIndicator}${sequenceIndicator}: [${node.alternatives.join(', ')}]`);
    
    for (const child of node.children) {
      this.printNode(child, depth + 1);
    }
  }

  /**
   * Creates a visual representation of the tree structure
   */
  public visualizeTree(): string {
    if (!this.rootNode) {
      return 'No tree to visualize';
    }

    return this.visualizeNode(this.rootNode, 0, '');
  }

  /**
   * Recursively creates visual representation of a node
   */
  private visualizeNode(node: GrammarNode, depth: number, prefix: string): string {
    const indent = '  '.repeat(depth);
    const paramIndicator = node.isParameter ? ' (PARAM)' : '';
    const sequenceIndicator = node.isSequence ? ' (SEQUENCE)' : '';
    const nodeLine = `${prefix}${node.symbol}${paramIndicator}${sequenceIndicator}: [${node.alternatives.join(', ')}]`;
    
    if (node.children.length === 0) {
      return nodeLine;
    }

    let result = nodeLine + '\n';
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const isLast = i === node.children.length - 1;
      const childPrefix = prefix + (isLast ? '└── ' : '├── ');
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      
      result += this.visualizeNode(child, depth + 1, childPrefix);
      if (i < node.children.length - 1) {
        result += '\n';
      }
    }
    
    return result;
  }

  /**
   * Gets the tree structure as a JSON object for debugging
   */
  public getTreeStructure(): any {
    if (!this.rootNode) {
      return null;
    }

    return this.nodeToObject(this.rootNode);
  }

  /**
   * Converts a node to a plain object
   */
  private nodeToObject(node: GrammarNode): any {
    return {
      symbol: node.symbol,
      alternatives: node.alternatives,
      isParameter: node.isParameter,
      isSequence: node.isSequence,
      children: node.children.map(child => this.nodeToObject(child))
    };
  }
}
