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

interface GenerationTemplate {
  template: string;          // Оригинальный шаблон: "#SP# #VP# #OP#"
  parameters: Record<string, string>; // Значения параметров: {SP: "girl", VP: "loves", OP: "cat"}
  path: string[];           // Путь генерации: ["origin", "word_order", "SVO", ...]
}

/**
 * Represents a path through the grammar tree
 */
// interface GrammarPath {
//   nodes: Array<{
//     symbol: string;
//     value: string;
//     occurrence: number; // which occurrence of this symbol in the path
//   }>;
// }

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
   * Applies a template with parameters to generate the final content
   */
  private applyTemplate(template: string, parameters: Record<string, string>): string {
    let result = template;
    
    // Replace all parameter references with their values
    for (const [param, value] of Object.entries(parameters)) {
      const regex = new RegExp(`#${param}#`, 'g');
      result = result.replace(regex, value);
    }
    
    // Handle missing symbols - replace any remaining #symbol# with ((missing:symbol))
    const missingSymbolRegex = /#([^#]+)#/g;
    result = result.replace(missingSymbolRegex, '((missing:$1))');
    
    return result;
  }

  /**
   * Generates all possible template combinations (without applying templates)
   * @param constraints Optional parameter constraints to limit combinations
   */
  public generateAllTemplates(constraints?: Record<string, string>): GenerationTemplate[] {
    const originAlternatives = this.grammar.origin;
    if (!originAlternatives || originAlternatives.length === 0) {
      return [];
    }

    // Check if there's a constraint on origin
    if (constraints && constraints.origin) {
      const constrainedOrigin = constraints.origin;
      if (originAlternatives.includes(constrainedOrigin)) {
        const tempRootNode = this.buildNode('origin', constrainedOrigin);
        return this.generateAllTemplatesWithContent(tempRootNode, '', ['origin'], {}, constraints);
      } else {
        return [];
      }
    }

    // No constraint on origin, generate templates for all origin alternatives
    const allTemplates: GenerationTemplate[] = [];
    for (const originRule of originAlternatives) {
      const tempRootNode = this.buildNode('origin', originRule);
      const templates = this.generateAllTemplatesWithContent(tempRootNode, '', ['origin'], {}, constraints);
      allTemplates.push(...templates);
    }
    return allTemplates;
  }

  /**
   * Generates all possible combinations with full content and parameters
   * @param constraints Optional parameter constraints to limit combinations
   */
  public generateAllCombinations(constraints?: Record<string, string>): GenerationPath[] {
    // Generate templates first
    const templates = this.generateAllTemplates(constraints);
    
    // Apply templates to generate final content
    return templates.map(template => ({
      content: this.applyTemplate(template.template, template.parameters),
      parameters: template.parameters,
      path: template.path
    }));
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
   * Recursively generates all possible templates with parameters
   */
  private generateAllTemplatesWithContent(
    node: GrammarNode, 
    currentTemplate: string, 
    currentPath: string[], 
    currentParameters: Record<string, string>,
    constraints?: Record<string, string>
  ): GenerationTemplate[] {
    // If this is a parameter node (has multiple alternatives), create branches for each alternative
    if (node.isParameter) {
      const allTemplates: GenerationTemplate[] = [];
      
      // Check if this symbol has a constraint
      if (constraints && constraints[node.symbol]) {
        // If constrained, only consider the specific value
        const constrainedValue = constraints[node.symbol];
        if (node.alternatives.includes(constrainedValue)) {
          // Create new parameters with this alternative choice
          const newParameters = {
            ...currentParameters,
            [node.symbol]: constrainedValue
          };
          
          // Add to path
          const newPath = [...currentPath, node.symbol];
          
          // Find the child node that corresponds to this alternative
          const childNode = this.findChildNodeForAlternative(node, constrainedValue);
          
          if (childNode) {
            // Add the symbol to path and parameters before continuing
            const extendedPath = [...newPath, childNode.symbol];
            const extendedParameters = {
              ...newParameters,
              [childNode.symbol]: constrainedValue
            };
            // Continue the path with the child node
            const childTemplates = this.generateAllTemplatesWithContent(childNode, currentTemplate, extendedPath, extendedParameters, constraints);
            allTemplates.push(...childTemplates);
          } else {
            // No child node - this is a terminal path
            // The alternative is the final template
            allTemplates.push({
              template: constrainedValue,
              parameters: newParameters,
              path: newPath
            });
          }
        }
        // If constrained value not found in alternatives, return empty array
        return allTemplates;
      } else {
        // No constraint, consider all alternatives
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
            // Add the symbol to path and parameters before continuing
            const extendedPath = [...newPath, childNode.symbol];
            const extendedParameters = {
              ...newParameters,
              [childNode.symbol]: alternative
            };
            // Continue the path with the child node
            const childTemplates = this.generateAllTemplatesWithContent(childNode, currentTemplate, extendedPath, extendedParameters, constraints);
            allTemplates.push(...childTemplates);
          } else {
            // No child node - this is a terminal path
            // The alternative is the final template
            allTemplates.push({
              template: alternative,
              parameters: newParameters,
              path: newPath
            });
          }
        }
      }
      
      return allTemplates;
    }

    // If this is a sequence node, process all children in sequence
    if (node.isSequence) {
      return this.generateSequenceTemplatesWithContent(node.children, currentTemplate, currentPath, currentParameters, constraints);
    }

    // If no children, this is a terminal node
    if (node.children.length === 0) {
      return [{
        template: currentTemplate,
        parameters: currentParameters,
        path: currentPath
      }];
    }

    // Process all children
    const allTemplates: GenerationTemplate[] = [];
    for (const child of node.children) {
      const childTemplates = this.generateAllTemplatesWithContent(child, currentTemplate, currentPath, currentParameters, constraints);
      allTemplates.push(...childTemplates);
    }
    return allTemplates;
  }

  /**
   * Recursively generates all possible paths with content and parameters
   */
  private generateAllPathsWithContent(
    node: GrammarNode, 
    currentContent: string, 
    currentPath: string[], 
    currentParameters: Record<string, string>,
    constraints?: Record<string, string>
  ): GenerationPath[] {
    // If this is a parameter node (has multiple alternatives), create branches for each alternative
    if (node.isParameter) {
      const allPaths: GenerationPath[] = [];
      
      // Check if this symbol has a constraint
      if (constraints && constraints[node.symbol]) {
        // If constrained, only consider the specific value
        const constrainedValue = constraints[node.symbol];
        if (node.alternatives.includes(constrainedValue)) {
          // Create new parameters with this alternative choice
          const newParameters = {
            ...currentParameters,
            [node.symbol]: constrainedValue
          };
          
          // Add to path
          const newPath = [...currentPath, node.symbol];
          
          // Find the child node that corresponds to this alternative
          const childNode = this.findChildNodeForAlternative(node, constrainedValue);
          
          if (childNode) {
            // Continue the path with the child node
            const childPaths = this.generateAllPathsWithContent(childNode, currentContent, newPath, newParameters, constraints);
            allPaths.push(...childPaths);
          } else {
            // No child node - this is a terminal path
            // The alternative is the final content
            allPaths.push({
              content: constrainedValue,
              parameters: newParameters,
              path: newPath
            });
          }
        }
        // If constrained value not found in alternatives, return empty array
        return allPaths;
      } else {
        // No constraint, consider all alternatives
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
            const childPaths = this.generateAllPathsWithContent(childNode, currentContent, newPath, newParameters, constraints);
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
      }
      
      return allPaths;
    }

    // If this is a sequence node, process all children in sequence
    if (node.isSequence) {
      return this.generateSequencePathsWithContent(node.children, currentContent, currentPath, currentParameters, constraints);
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
      const childPaths = this.generateAllPathsWithContent(child, currentContent, currentPath, currentParameters, constraints);
      allPaths.push(...childPaths);
    }
    return allPaths;
  }

  /**
   * Generates templates for sequence nodes (all children used together)
   */
  private generateSequenceTemplatesWithContent(
    children: GrammarNode[], 
    currentTemplate: string, 
    currentPath: string[], 
    currentParameters: Record<string, string>,
    constraints?: Record<string, string>
  ): GenerationTemplate[] {
    if (children.length === 0) {
      return [{
        template: currentTemplate,
        parameters: currentParameters,
        path: currentPath
      }];
    }

    if (children.length === 1) {
      return this.generateAllTemplatesWithContent(children[0], currentTemplate, currentPath, currentParameters, constraints);
    }

    // For sequences, we need to generate all combinations of all children
    // This is a cartesian product approach
    const allTemplates: GenerationTemplate[] = [];
    
    // Generate all possible combinations for each child
    const childCombinations: GenerationTemplate[][] = [];
    for (const child of children) {
      const childTemplates = this.generateAllTemplatesWithContent(child, '', currentPath, currentParameters, constraints);
      childCombinations.push(childTemplates);
    }
    
    // Generate cartesian product of all child combinations
    const cartesianProduct = this.generateCartesianProduct(childCombinations);
    
    // Combine the results
    for (const combination of cartesianProduct) {
      // For sequences, we need to combine templates and parameters
      const combinedTemplate = combination.map(template => template.template).join(' ');
      const combinedParameters = { ...currentParameters };
      const combinedPath = [...currentPath];
      
      // Merge parameters and paths from all templates in the combination
      for (const template of combination) {
        Object.assign(combinedParameters, template.parameters);
        combinedPath.push(...template.path);
      }
      
      allTemplates.push({
        template: combinedTemplate,
        parameters: combinedParameters,
        path: combinedPath
      });
    }
    
    return allTemplates;
  }

  /**
   * Generates paths for sequence nodes (all children used together)
   */
  private generateSequencePathsWithContent(
    children: GrammarNode[], 
    currentContent: string, 
    currentPath: string[], 
    currentParameters: Record<string, string>,
    constraints?: Record<string, string>
  ): GenerationPath[] {
    if (children.length === 0) {
      return [{
        content: currentContent,
        parameters: currentParameters,
        path: currentPath
      }];
    }

    if (children.length === 1) {
      return this.generateAllPathsWithContent(children[0], currentContent, currentPath, currentParameters, constraints);
    }

    // For sequences, we need to generate all combinations of all children
    // This is a cartesian product approach
    const allPaths: GenerationPath[] = [];
    
    // Generate all possible combinations for each child
    const childCombinations: GenerationPath[][] = [];
    for (const child of children) {
      const childPaths = this.generateAllPathsWithContent(child, '', currentPath, currentParameters, constraints);
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

  /**
   * Counts combinations with parameter constraints
   */
  public countPathsWithConstraints(constraints: Record<string, string>): number {
    const originRule = this.grammar.origin?.[0];
    if (!originRule) {
      return 0;
    }

    return this.countRuleCombinationsWithConstraints(originRule, constraints);
  }

  /**
   * Counts combinations for a rule with parameter constraints
   */
  private countRuleCombinationsWithConstraints(rule: string, constraints: Record<string, string>): number {
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
      if (constraints[symbol]) {
        // If constrained, only count combinations for the specific value
        const constrainedValue = constraints[symbol];
        if (alternatives.includes(constrainedValue)) {
          const subCombinations = this.countRuleCombinationsWithConstraints(constrainedValue, constraints);
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
            const subCombinations = this.countRuleCombinationsWithConstraints(alternative, constraints);
            alternativeCombinations += subCombinations;
          }
          totalCombinations *= alternativeCombinations;
        } else if (alternatives.length === 1) {
          // Single alternative - recursively count its combinations
          const subCombinations = this.countRuleCombinationsWithConstraints(alternatives[0], constraints);
          totalCombinations *= subCombinations;
        }
      }
    }

    return totalCombinations;
  }
}
