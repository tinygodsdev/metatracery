import type { 
  GrammarRule, 
  GenerationTemplate, 
  // TemplatePath, 
  PathChoice 
} from './types';
import { TemplateRenderer } from './TemplateRenderer';

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

type TemplatePathEntry = { symbol: string; value: string };
type TemplatePath = TemplatePathEntry[];

interface GenerationPath {
  content: string;           // Финальный результат: "girl loves cat"
  parameters: Record<string, string>; // Релевантные параметры: {word_order: "SVO", NP: "girl", VP: "loves", ...}
  path: string[];           // Путь генерации: ["origin", "word_order", "SVO", ...]
}


/**
 * Grammar analyzer that builds a tree and counts all possible paths
 */
export class GrammarAnalyzer {
  private grammar: GrammarRule;
  private rootNode: GrammarNode | null = null;
  public templateRenderer: TemplateRenderer;

  constructor(grammar: GrammarRule) {
    this.grammar = grammar;
    this.templateRenderer = new TemplateRenderer();
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
  private buildNode(symbol: string, _: string, parentPath: string = '', positionInParent: number = 0): GrammarNode {
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
   * @param constraints Optional parameter constraints to limit combinations
   */
  public countAllPaths(constraints?: Record<string, string>): number {
    const originAlternatives = this.grammar.origin;
    if (!originAlternatives || originAlternatives.length === 0) {
      return 0;
    }

    // Check if there's a constraint on origin
    if (constraints && constraints.origin) {
      // If constrained, only count combinations for the specific origin alternative
      const constrainedOrigin = constraints.origin;
      if (originAlternatives.includes(constrainedOrigin)) {
        return this.countRuleCombinations(constrainedOrigin, constraints);
      } else {
        // Constrained origin value not found in alternatives
        return 0;
      }
    }

    // No constraint on origin, count combinations for all origin alternatives
    let totalCombinations = 0;
    for (const originRule of originAlternatives) {
      totalCombinations += this.countRuleCombinations(originRule, constraints);
    }

    return totalCombinations;
  }

  /**
   * Counts all possible combinations for a rule
   * @param rule The rule to count combinations for
   * @param constraints Optional parameter constraints to limit combinations
   */
  private countRuleCombinations(rule: string, constraints?: Record<string, string>): number {
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
      
      // Check if this symbol has a constraint
      if (constraints && constraints[symbol]) {
        // If constrained, only count combinations for the specific value
        const constrainedValue = constraints[symbol];
        if (alternatives.includes(constrainedValue)) {
          const subCombinations = this.countRuleCombinations(constrainedValue, constraints);
          totalCombinations *= subCombinations;
        } else {
          // Constrained value not found in alternatives
          return 0;
        }
      } else {
        // No constraint, count all alternatives
      if (alternatives.length > 1) {
        // Parameter with multiple alternatives - sum combinations from all alternatives
        let alternativeCombinations = 0;
        for (const alternative of alternatives) {
            const subCombinations = this.countRuleCombinations(alternative, constraints);
          alternativeCombinations += subCombinations;
        }
        totalCombinations *= alternativeCombinations;
      } else if (alternatives.length === 1) {
        // Single alternative - recursively count its combinations
          const subCombinations = this.countRuleCombinations(alternatives[0], constraints);
        totalCombinations *= subCombinations;
        }
      }
    }

    return totalCombinations;
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
   * Discovers all templates
   * Uses tree traversal to discover all templates with optional constraints
   * @param constraints Optional parameter constraints to limit combinations
   */
  public discoverAllTemplates(constraints?: Record<string, string>): TemplatePath[] {
    const results: TemplatePath[] = [];

    if (!this.rootNode) {
      console.log('No tree to discover');
      return results;
    }
  
    // Use a single mutable array with push-pop backtracking
    const currentPath: TemplatePath = [];
    this.traverseNode(this.rootNode, 0, results, currentPath, constraints ?? {});
    console.log('Traversed paths:', results);
    console.log("Len", results.length);
    return results;
  }

  private traverseNode(
    node: GrammarNode,
    depth: number,
    results: TemplatePath[],
    currentPath: TemplatePath,
    constraints: Record<string, string>,
  ): void {
  // 1) Compute which alternatives are allowed for this node
  //    - If constraint exists for this symbol, restrict to it
  //    - If constraint value is not present in alternatives - prune branch
  let allowedAlts = node.alternatives;
  const constrainedValue = constraints[node.symbol];
  if (constrainedValue !== undefined) {
    if (!node.alternatives.includes(constrainedValue)) {
      // Constraint conflicts with grammar - prune
      return;
    }
    allowedAlts = [constrainedValue];
  }

  // 2) Branch over each allowed alternative
  for (const value of allowedAlts) {
    // choose this node's value
    currentPath.push({ symbol: node.symbol, value });

    if (!node.children || node.children.length === 0) {
      // Leaf - copy the path snapshot to results
      results.push([...currentPath]);
    } else {
      // 3) Recurse into children
      //    Note: this assumes a tree. If your structure may contain cycles,
      //    add a visited set per path to guard against infinite loops.
      for (const child of node.children) {
        this.traverseNode(child, depth + 1, results, currentPath, constraints);
      }
    }

    // 4) Backtrack
    currentPath.pop();
  }
  }


  public generateAllTemplates(constraints?: Record<string, string>): GenerationTemplate[] {
    const results: GenerationTemplate[] = [];

    return results;
  }

  public generateAllCombinations(constraints?: Record<string, string>): GenerationPath[] {
    const results: GenerationPath[] = [];

    return results;
  }
}
