import type { GrammarRule } from './types';

/**
 * Represents a node in the grammar tree
 */
interface GrammarNode {
  symbol: string;
  alternatives: string[];
  isParameter: boolean; // true if has multiple alternatives
  isSequence: boolean; // true if all children are used together (not alternatives)
  nodeId: string; // unique identifier for this node instance
  children: GrammarNode[];
}

interface GenerationPath {
  content: string;           // Финальный результат: "girl loves cat"
  parameters: Record<string, string>; // Релевантные параметры: {word_order: "SVO", NP: "girl", VP: "loves", ...}
  path: string[];           // Путь генерации: ["origin", "word_order", "SVO", ...]
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
      // Handle empty grammar gracefully
      this.rootNode = null;
      return;
    }

    this.rootNode = this.buildNode('origin', originRule);
  }

  /**
   * Recursively builds a node and its children
   */
  private buildNode(symbol: string, rule: string, parentPath: string = '', positionInParent: number = 0): GrammarNode {
    const alternatives = this.grammar[symbol] || [];
    const isParameter = alternatives.length > 1;

    // Generate unique node ID based on path and position
    const nodeId = parentPath ? `${parentPath}_${symbol}_${positionInParent}` : symbol;

    const node: GrammarNode = {
      symbol,
      alternatives,
      isParameter,
      isSequence: false, // Will be determined below
      nodeId,
      children: []
    };

    // For each alternative, find symbol references and build children
    for (const alternative of alternatives) {
      const symbolRefs = this.extractSymbolReferences(alternative);
      
      // Determine if this is a sequence (multiple symbols in one alternative)
      if (symbolRefs.length > 1) {
        node.isSequence = true;
      }
      
      // Create a separate child node for each symbol occurrence
      for (let i = 0; i < symbolRefs.length; i++) {
        const symbolRef = symbolRefs[i];
        const childNode = this.buildNode(symbolRef.symbol, alternative, nodeId, i);
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
      nodeId: node.nodeId,
      children: node.children.map(child => this.nodeToObject(child))
    };
  }

  /**
   * Generates all possible combinations with full content and parameters
   */
  public generateAllCombinations(): GenerationPath[] {
    if (!this.rootNode) {
      return [];
    }

    // Start with empty content and generate all paths with content
    return this.generateAllPathsWithContent(this.rootNode, '', [], {});
  }

  /**
   * Recursively generates all possible paths through the tree
   */
  private generateAllPaths(node: GrammarNode, currentCombination: Record<string, string>): Record<string, string>[] {
    // If this is a parameter node (has multiple alternatives), create branches for each alternative
    if (node.isParameter) {
      const allCombinations: Record<string, string>[] = [];
      
      for (let i = 0; i < node.alternatives.length; i++) {
        const alternative = node.alternatives[i];
        
        // Create a new combination with this alternative choice
        // Use nodeId to ensure uniqueness across all node instances
        const newCombination = {
          ...currentCombination,
          [`${node.nodeId}_${i}`]: alternative
        };
        
        // Find the child node that corresponds to this alternative
        const childNode = this.findChildNodeForAlternative(node, alternative);
        
        if (childNode) {
          // Continue the path with the child node
          const childCombinations = this.generateAllPaths(childNode, newCombination);
          allCombinations.push(...childCombinations);
        } else {
          // No child node - this is a terminal path
          allCombinations.push(newCombination);
        }
      }
      
      return allCombinations;
    }

    // If this is not a parameter node, we need to process all children
    if (node.children.length === 0) {
      // Terminal node - return the current combination
      return [currentCombination];
    }

    // For sequence nodes, we need to process all children in sequence
    if (node.isSequence) {
      return this.generateSequencePaths(node.children, currentCombination);
    }

    // For non-sequence nodes, we need to process all children
    // This case should be rare in our current tree structure
    const allCombinations: Record<string, string>[] = [];
    for (const child of node.children) {
      const childCombinations = this.generateAllPaths(child, currentCombination);
      allCombinations.push(...childCombinations);
    }
    
    return allCombinations;
  }

  /**
   * Generates paths for a sequence of child nodes
   */
  private generateSequencePaths(children: GrammarNode[], currentCombination: Record<string, string>): Record<string, string>[] {
    if (children.length === 0) {
      return [currentCombination];
    }

    if (children.length === 1) {
      return this.generateAllPaths(children[0], currentCombination);
    }

    // For sequences, we need to generate all combinations of all children
    // This is a cartesian product of all possible combinations
    const allCombinations: Record<string, string>[] = [];
    
    // Generate combinations for the first child
    const firstCombinations = this.generateAllPaths(children[0], currentCombination);
    
    // For each combination of the first child, generate combinations for the rest
    for (const firstComb of firstCombinations) {
      const restCombinations = this.generateSequencePaths(children.slice(1), firstComb);
      allCombinations.push(...restCombinations);
    }

    return allCombinations;
  }

  /**
   * Finds the child node that corresponds to a specific alternative
   */
  private findChildNodeForAlternative(node: GrammarNode, alternative: string): GrammarNode | null {
    // Extract symbol references from the alternative
    const symbolRefs = this.extractSymbolReferences(alternative);
    
    if (symbolRefs.length === 0) {
      return null;
    }

    // For now, return the first matching child
    // This is a simplified approach - in a more complex case we might need
    // to handle multiple symbols in one alternative
    const firstSymbol = symbolRefs[0].symbol;
    return node.children.find(child => child.symbol === firstSymbol) || null;
  }

  /**
   * Recursively generates all possible paths with content and parameters
   */
  private generateAllPathsWithContent(
    node: GrammarNode, 
    currentContent: string, 
    currentPath: string[], 
    currentParameters: Record<string, string>
  ): GenerationPath[] {
    // If this is a parameter node (has multiple alternatives), create branches for each alternative
    if (node.isParameter) {
      const allPaths: GenerationPath[] = [];
      
      for (let i = 0; i < node.alternatives.length; i++) {
        const alternative = node.alternatives[i];
        
        // Create new parameters with this alternative choice
        const newParameters = {
          ...currentParameters,
          [node.symbol]: alternative
        };
        
        // Add to path
        const newPath = [...currentPath, node.symbol];
        
        // Find the child node that corresponds to this alternative
        const childNode = this.findChildNodeForAlternative(node, alternative);
        
        if (childNode) {
          // Continue the path with the child node
          const childPaths = this.generateAllPathsWithContent(childNode, currentContent, newPath, newParameters);
          allPaths.push(...childPaths);
        } else {
          // No child node - this is a terminal path
          // The alternative is the final content
          allPaths.push({
            content: alternative,
            parameters: newParameters,
            path: newPath
          });
        }
      }
      
      return allPaths;
    }

    // If this is a sequence node, process all children in sequence
    if (node.isSequence) {
      return this.generateSequencePathsWithContent(node.children, currentContent, currentPath, currentParameters);
    }

    // If no children, this is a terminal node
    if (node.children.length === 0) {
      return [{
        content: currentContent,
        parameters: currentParameters,
        path: currentPath
      }];
    }

    // Process all children (for non-sequence nodes)
    const allPaths: GenerationPath[] = [];
    for (const child of node.children) {
      const childPaths = this.generateAllPathsWithContent(child, currentContent, currentPath, currentParameters);
      allPaths.push(...childPaths);
    }
    return allPaths;
  }

  /**
   * Generates paths for sequence nodes (all children used together)
   */
  private generateSequencePathsWithContent(
    children: GrammarNode[], 
    currentContent: string, 
    currentPath: string[], 
    currentParameters: Record<string, string>
  ): GenerationPath[] {
    if (children.length === 0) {
      return [{
        content: currentContent,
        parameters: currentParameters,
        path: currentPath
      }];
    }

    if (children.length === 1) {
      return this.generateAllPathsWithContent(children[0], currentContent, currentPath, currentParameters);
    }

    // For sequences, we need to generate all combinations of all children
    // This is a cartesian product approach
    const allPaths: GenerationPath[] = [];
    
    // Generate all possible combinations for each child
    const childCombinations: GenerationPath[][] = [];
    for (const child of children) {
      const childPaths = this.generateAllPathsWithContent(child, '', currentPath, currentParameters);
      childCombinations.push(childPaths);
    }
    
    // Generate cartesian product of all child combinations
    const cartesianProduct = this.generateCartesianProduct(childCombinations);
    
    // Combine the results
    for (const combination of cartesianProduct) {
      const combinedContent = combination.map(path => path.content).join(' ').trim();
      const combinedParameters = { ...currentParameters };
      const combinedPath = [...currentPath];
      
      // Merge parameters and paths from all paths in the combination
      for (const path of combination) {
        Object.assign(combinedParameters, path.parameters);
        combinedPath.push(...path.path);
      }
      
      allPaths.push({
        content: combinedContent,
        parameters: combinedParameters,
        path: combinedPath
      });
    }
    
    return allPaths;
  }

  /**
   * Generates cartesian product of arrays
   */
  private generateCartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(item => [item]);
    
    const result: T[][] = [];
    const firstArray = arrays[0];
    const restProduct = this.generateCartesianProduct(arrays.slice(1));
    
    for (const item of firstArray) {
      for (const rest of restProduct) {
        result.push([item, ...rest]);
      }
    }
    
    return result;
  }
}
