import type { 
  GrammarRule, 
  GenerationResult, 
  AppliedRule, 
  EngineConfig,
  StructureExtractor,
  GenerationStatistics
} from './types';
import { ParameterExtractor } from './ParameterExtractor';
import type { ExtractedParameters } from './ParameterExtractor';
import { GenericStructureExtractor } from './GenericStructureExtractor';

/**
 * Scientific grammar generation engine
 * Generic engine that works with any domain
 */
export class GrammarEngine {
  private grammar: GrammarRule;
  private parameters: ExtractedParameters;
  public parameterExtractor: ParameterExtractor;
  private structureExtractor: StructureExtractor;
  private config: EngineConfig;
  
  constructor(grammar: GrammarRule, config: Partial<EngineConfig> = {}) {
    this.grammar = grammar;
    this.config = {
      maxDepth: 10,
      enableTracking: true,
      enableStatistics: true,
      ...config
    };
    
    this.parameterExtractor = new ParameterExtractor();
    this.parameters = this.parameterExtractor.extractParameters(grammar);
    this.structureExtractor = new GenericStructureExtractor();
  }
  
  /**
   * Generates text with specific parameters
   */
  generateWithParameters(
    rule: string, 
    parameterValues: Record<string, string>
  ): GenerationResult {
    const startTime = Date.now();
    
    // Set parameters
    this.setParameters(parameterValues);
    
    // Generate with tracking
    const result = this.generateWithTracking(rule, parameterValues);
    
    // Clear parameters after generation to avoid state pollution
    this.clearParameters();
    
    if (this.config.enableStatistics) {
      result.metadata.generationTime = Date.now() - startTime;
    }
    
    return result;
  }
  
  /**
   * Generates all possible combinations
   */
  generateAllCombinations(
    rule: string
  ): GenerationResult[] {
    // Get all combinations by analyzing the rule structure
    const combinations = this.getAllRuleCombinations(rule);
    
    // Generate for each combination
    const results = combinations.map(combination => 
      this.generateWithParameters(rule, combination)
    );
    
    // Ensure parameters are cleared after all generations
    this.clearParameters();
    
    return results;
  }
  
  /**
   * Gets all possible combinations for a rule by analyzing its structure
   */
  private getAllRuleCombinations(rule: string): Record<string, string>[] {
    // Use the original approach but with fixed indexing
    const symbolCounts = this.analyzeRuleRecursively(rule);
    console.log('Rule:', rule, 'Symbol counts:', symbolCounts);
    
    // Generate combinations for each symbol usage
    const combinations: Record<string, string>[] = [];
    this.generateRuleCombinations(symbolCounts, {}, combinations);
    console.log('Generated combinations:', combinations.length, combinations.slice(0, 3));
    
    return combinations;
  }
  
  /**
   * Finds all unique generation paths through the grammar tree
   */
  private findAllGenerationPaths(rule: string): Array<Array<[string, string]>> {
    const paths: Array<Array<[string, string]>> = [];
    this.traverseGenerationTree(rule, [], paths);
    return paths;
  }

  /**
   * Recursively traverses the generation tree to find all paths
   */
  private traverseGenerationTree(
    rule: string, 
    currentPath: Array<[string, string]>, 
    allPaths: Array<Array<[string, string]>>
  ): void {
    // Find symbol references in rule
    const symbolReferences = this.extractAllSymbolReferences(rule);
    
    if (symbolReferences.length === 0) {
      // This is a terminal rule - we've reached a leaf
      allPaths.push([...currentPath]);
      return;
    }
    
    // We need to handle all combinations of symbols in this rule
    // This is a recursive approach that handles multiple symbols
    this.traverseSymbolCombinations(symbolReferences, 0, currentPath, allPaths);
  }

  /**
   * Recursively handles all combinations of symbols in a rule
   */
  private traverseSymbolCombinations(
    symbolReferences: Array<{symbol: string, placeholder: string}>,
    index: number,
    currentPath: Array<[string, string]>,
    allPaths: Array<Array<[string, string]>>
  ): void {
    if (index >= symbolReferences.length) {
      // We've processed all symbols, now we need to continue with the expanded rule
      // But we need to reconstruct the rule with the chosen values
      // For now, let's just add the current path as a complete path
      allPaths.push([...currentPath]);
      return;
    }
    
    const symbolRef = symbolReferences[index];
    const symbol = symbolRef.symbol;
    const symbolRules = this.grammar[symbol];
    
    if (!symbolRules || symbolRules.length === 0) {
      // Skip missing symbols
      this.traverseSymbolCombinations(symbolReferences, index + 1, currentPath, allPaths);
      return;
    }
    
    // If symbol has multiple alternatives, it's a parameter
    if (symbolRules.length > 1) {
      // Try each alternative
      for (const alternative of symbolRules) {
        // Add this choice to current path
        currentPath.push([symbol, alternative]);
        
        // Continue with next symbol
        this.traverseSymbolCombinations(symbolReferences, index + 1, currentPath, allPaths);
        
        // Remove this choice from current path
        currentPath.pop();
      }
    } else {
      // Single alternative - just continue
      this.traverseSymbolCombinations(symbolReferences, index + 1, currentPath, allPaths);
    }
  }

  /**
   * Recursively analyzes a rule to find all parameter symbols and their counts
   */
  private analyzeRuleRecursively(rule: string): Map<string, number> {
    const symbolCounts = new Map<string, number>();
    
    // Find all symbol references in the current rule
    const symbolReferences = this.extractAllSymbolReferences(rule);
    
    for (const ref of symbolReferences) {
      const symbol = ref.symbol;
      
      // If this symbol has multiple alternatives, it's a parameter
      const symbolRules = this.grammar[symbol];
      if (symbolRules && symbolRules.length > 1) {
        symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
      }
      
      // For all symbols, analyze them recursively to find nested parameters
      // Use maximum to avoid double-counting across alternatives
      for (const alternative of symbolRules || []) {
        const subCounts = this.analyzeRuleRecursively(alternative);
        for (const [subSymbol, count] of subCounts) {
          // Use maximum count instead of sum
          const currentCount = symbolCounts.get(subSymbol) || 0;
          symbolCounts.set(subSymbol, Math.max(currentCount, count));
        }
      }
    }
    
    return symbolCounts;
  }
  
  /**
   * Recursively generates combinations for rule symbols
   */
  private generateRuleCombinations(
    symbolCounts: Map<string, number>,
    currentCombination: Record<string, string>,
    combinations: Record<string, string>[]
  ): void {
    if (symbolCounts.size === 0) {
      combinations.push({ ...currentCombination });
      return;
    }
    
    // Get the first symbol
    const firstEntry = symbolCounts.entries().next().value;
    if (!firstEntry) return;
    const [symbol, count] = firstEntry;
    const remainingCounts = new Map(symbolCounts);
    remainingCounts.delete(symbol);
    
    // Get possible values for this symbol
    const symbolRules = this.grammar[symbol];
    if (!symbolRules || symbolRules.length === 0) {
      // Symbol has no rules, skip it
      this.generateRuleCombinations(remainingCounts, currentCombination, combinations);
      return;
    }
    
    // Generate all possible combinations for this symbol
    // We need to generate all possible combinations of values for each occurrence
    const symbolCombinations = this.generateSymbolCombinations(symbol, count, symbolRules);
    
    // For each combination of this symbol
    for (const symbolCombination of symbolCombinations) {
      // Add this symbol combination to current combination
      Object.assign(currentCombination, symbolCombination);
      
      // Recursively generate combinations for remaining symbols
      this.generateRuleCombinations(remainingCounts, currentCombination, combinations);
      
      // Clean up current combination
      for (const key of Object.keys(symbolCombination)) {
        delete currentCombination[key];
      }
    }
  }
  
  /**
   * Generates all possible combinations for a symbol with multiple occurrences
   */
  private generateSymbolCombinations(symbol: string, count: number, values: string[]): Record<string, string>[] {
    const combinations: Record<string, string>[] = [];
    
    // Generate all possible combinations of values for each occurrence
    const generateCombinations = (index: number, currentCombination: Record<string, string>) => {
      if (index >= count) {
        combinations.push({ ...currentCombination });
        return;
      }
      
      for (const value of values) {
        const key = `${symbol}_${index}`;
        currentCombination[key] = value;
        generateCombinations(index + 1, currentCombination);
        delete currentCombination[key];
      }
    };
    
    generateCombinations(0, {});
    return combinations;
  }
  
  /**
   * Generates parameter matrix
   */
  generateParameterMatrix(
    rule: string,
    parameterSpace: Record<string, string[]>
  ): GenerationResult[][] {
    const matrix: GenerationResult[][] = [];
    const parameterNames = Object.keys(parameterSpace);
    
    if (parameterNames.length === 0) {
      return matrix;
    }
    
    // For simplicity, support only 2D matrices for now
    if (parameterNames.length >= 2) {
      const param1 = parameterNames[0];
      const param2 = parameterNames[1];
      
      for (const value1 of parameterSpace[param1]) {
        const row: GenerationResult[] = [];
        for (const value2 of parameterSpace[param2]) {
          const result = this.generateWithParameters(rule, {
            [param1]: value1,
            [param2]: value2
          });
          row.push(result);
        }
        matrix.push(row);
      }
    }
    
    // Ensure parameters are cleared after matrix generation
    this.clearParameters();
    
    return matrix;
  }
  
  /**
   * Generates with metadata tracking
   */
  private generateWithTracking(rule: string, parameterValues?: Record<string, string>): GenerationResult {
    const appliedRules: AppliedRule[] = [];
    const generationPath: string[] = [];
    const usedSymbols = new Set<string>();
    
    // Fully expand the rule
    const result = this.expandRule(rule, appliedRules, generationPath, usedSymbols, 0, parameterValues);
    
    // Extract relevant parameters based on used symbols
    const relevantParameters: Record<string, any> = {};
    const currentParams = this.getCurrentParameters();
    
    usedSymbols.forEach(symbol => {
      // Include all used symbols in relevant parameters
      // If the symbol has a value in currentParams, use it
      // Otherwise, use the actual rule that was selected for this symbol
      if (currentParams[symbol] !== undefined) {
        relevantParameters[symbol] = currentParams[symbol];
      } else {
        // For symbols that were used but don't have explicit parameter values,
        // we need to find what rule was actually selected for them
        relevantParameters[symbol] = this.getSelectedRuleForSymbol(symbol, appliedRules);
      }
    });
    
    return {
      content: result,
      metadata: {
        parameters: currentParams,
        relevantParameters,
        appliedRules,
        generationPath,
        structure: this.structureExtractor.extractStructure(appliedRules)
      }
    };
  }
  
  /**
   * Fully expands a rule
   */
  private expandRule(
    rule: string, 
    appliedRules: AppliedRule[], 
    generationPath: string[],
    usedSymbols: Set<string>,
    depth: number,
    parameterValues?: Record<string, string>,
    symbolOccurrenceCounts?: Map<string, number>
  ): string {
    if (depth > this.config.maxDepth) {
      return rule;
    }
    
    // Initialize symbol occurrence counts if not provided
    if (!symbolOccurrenceCounts) {
      symbolOccurrenceCounts = new Map<string, number>();
    }
    
    // Find symbol references in rule
    const symbolReferences = this.extractAllSymbolReferences(rule);
    
    if (symbolReferences.length === 0) {
      // This is a terminal rule
      return rule;
    }
    
    let result = rule;
    
    // Replace each symbol reference
    for (let i = 0; i < symbolReferences.length; i++) {
      const symbolRef = symbolReferences[i];
      const symbol = symbolRef.symbol;
      const placeholder = symbolRef.placeholder;
      
      // Track used symbol
      usedSymbols.add(symbol);
      
      // Get global occurrence index for this symbol
      const occurrenceIndex = symbolOccurrenceCounts.get(symbol) || 0;
      symbolOccurrenceCounts.set(symbol, occurrenceIndex + 1);
      
      // Select rule for symbol with global occurrence index
      const selectedRule = this.selectRule(symbol, parameterValues, occurrenceIndex);
      
      // Also track symbols that are referenced in the selected rule
      const ruleSymbols = this.extractAllSymbolReferences(selectedRule);
      ruleSymbols.forEach(ruleSymbol => {
        usedSymbols.add(ruleSymbol.symbol);
      });
      
      // Record applied rule
      if (this.config.enableTracking) {
        appliedRules.push({
          symbol,
          selectedRule,
          result: '',
          depth,
          alternatives: this.grammar[symbol] || [],
          timestamp: Date.now()
        });
      }
      
      generationPath.push(symbol);
      
      // Recursively expand selected rule
      const expandedRule = this.expandRule(selectedRule, appliedRules, generationPath, usedSymbols, depth + 1, parameterValues, symbolOccurrenceCounts);
      
      // Replace reference with expanded rule
      result = result.replace(placeholder, expandedRule);
      
      // Update result in appliedRules
      if (this.config.enableTracking && appliedRules.length > 0) {
        appliedRules[appliedRules.length - 1].result = expandedRule;
      }
    }
    
    return result;
  }
  
  /**
   * Extracts all symbol references from rule
   */
  private extractAllSymbolReferences(rule: string): Array<{symbol: string, placeholder: string}> {
    const references: Array<{symbol: string, placeholder: string}> = [];
    const regex = /#([^#]+)#/g;
    let match;
    
    while ((match = regex.exec(rule)) !== null) {
      references.push({
        symbol: match[1],
        placeholder: match[0]
      });
    }
    
    return references;
  }
  
  /**
   * Selects rule for symbol
   */
  private selectRule(symbol: string, parameterValues?: Record<string, string>, symbolIndex?: number): string {
    const rules = this.grammar[symbol];
    if (!rules || rules.length === 0) {
      return `((missing:${symbol}))`;
    }
    
    // If parameter is set in parameterValues, use it
    if (parameterValues) {
      // Try to find parameter by index first (e.g., S_0, S_1, S_2)
      if (symbolIndex !== undefined) {
        const indexedKey = `${symbol}_${symbolIndex}`;
        if (parameterValues[indexedKey]) {
          return parameterValues[indexedKey];
        }
      }
      
      // Fallback to direct symbol name
      if (parameterValues[symbol]) {
        return parameterValues[symbol];
      }
    }
    
    // If parameter is set in this.parameters, use it
    if (this.parameters[symbol]?.currentValue) {
      return this.parameters[symbol].currentValue!;
    }
    
    // Otherwise select randomly (for now)
   const randomIndex = Math.floor(Math.random() * rules.length);
    return rules[randomIndex];
  }
  
  /**
   * Sets parameters
   */
  private setParameters(parameterValues: Record<string, string>): void {
    // First clear all current values
    this.clearParameters();
    
    // Then set new values
    for (const [paramName, value] of Object.entries(parameterValues)) {
      if (this.parameters[paramName]) {
        this.parameters[paramName].currentValue = value;
      }
    }
  }
  
  /**
   * Clears all parameter current values
   */
  private clearParameters(): void {
    for (const param of Object.values(this.parameters)) {
      param.currentValue = undefined;
    }
  }
  
  /**
   * Gets current parameters
   */
  private getCurrentParameters(): Record<string, any> {
    const current: Record<string, any> = {};
    
    for (const [paramName, param] of Object.entries(this.parameters)) {
      if (param.currentValue) {
        current[paramName] = param.currentValue;
      }
    }
    
    return current;
  }
  
  /**
   * Gets parameter statistics
   */
  getParameterStatistics(): GenerationStatistics {
    const stats: GenerationStatistics = {
      totalVariants: 0,
      parameterCounts: {},
      averageDepth: 0,
      maxDepth: 0,
      generationTime: 0
    };
    
    // Calculate total number of variants
    let totalCombinations = 1;
    for (const param of Object.values(this.parameters)) {
      totalCombinations *= param.values.length;
    }
    stats.totalVariants = totalCombinations;
    
    // Count variants by parameters
    for (const [paramName, param] of Object.entries(this.parameters)) {
      stats.parameterCounts[paramName] = {};
      for (const value of param.values) {
        stats.parameterCounts[paramName][value] = 1;
      }
    }
    
    return stats;
  }
  
  /**
   * Gets parameter information
   */
  getParameters(): ExtractedParameters {
    return { ...this.parameters };
  }
  
  /**
   * Sets custom structure extractor
   */
  setStructureExtractor(extractor: StructureExtractor): void {
    this.structureExtractor = extractor;
  }
  
  /**
   * Gets contextual parameters (for symbols used in multiple contexts)
   */
  getContextualParameters(): Record<string, string[]> {
    return this.parameterExtractor.extractContextualParameters(this.grammar);
  }
  
  /**
   * Gets the selected rule for a symbol from applied rules
   */
  private getSelectedRuleForSymbol(symbol: string, appliedRules: AppliedRule[]): string {
    // Find the last applied rule for this symbol
    for (let i = appliedRules.length - 1; i >= 0; i--) {
      if (appliedRules[i].symbol === symbol) {
        return appliedRules[i].selectedRule;
      }
    }
    // If not found in applied rules, return the first available rule
    return this.grammar[symbol]?.[0] || `((missing:${symbol}))`;
  }
}
