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
import { GrammarAnalyzer } from './GrammarAnalyzer';

/**
 * Scientific grammar generation engine
 * Generic engine that works with any domain
 */
export class GrammarEngine {
  private grammar: GrammarRule;
  private parameters: ExtractedParameters;
  public parameterExtractor: ParameterExtractor;
  private structureExtractor: StructureExtractor;
  private grammarAnalyzer: GrammarAnalyzer;
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
    this.grammarAnalyzer = new GrammarAnalyzer(grammar);
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
  generateAllCombinations(rule: string): GenerationResult[] {
    // Get all generation paths from GrammarAnalyzer
    const generationPaths = this.grammarAnalyzer.generateAllCombinations();
    console.log('Total generation paths from analyzer:', generationPaths.length, rule);
    
    // Convert GenerationPath to GenerationResult
    const results = generationPaths.map(path => ({
      content: path.content,
      metadata: {
        parameters: {},
        appliedRules: [], // TODO: We could track this if needed
        generationPath: path.path,
        relevantParameters: path.parameters
      }
    }));
    
    return results;
  }

  /**
   * Gets the total number of possible combinations using GrammarAnalyzer
   */
  public getTotalCombinations(): number {
    return this.grammarAnalyzer.countAllPaths();
  }

  /**
   * Gets the number of combinations with parameter constraints
   */
  public getCombinationsWithConstraints(constraints: Record<string, string>): number {
    return this.grammarAnalyzer.countPathsWithConstraints(constraints);
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
      // Try to find parameter by new nodeId format first
      if (symbolIndex !== undefined) {
        // Look for keys that match the pattern: *_{symbol}_{symbolIndex}_*
        // This handles complex nodeId like: origin_word_order_0_SVO_0_SP_0_NP_0_0
        for (const key in parameterValues) {
          // Split by underscores and look for symbol at the right position
          const parts = key.split('_');
          for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i] === symbol && parts[i + 1] === symbolIndex.toString()) {
              return parameterValues[key];
            }
          }
        }
      }
      
      // Try to find parameter by old index format (e.g., S_0, S_1, S_2)
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
    
    // Use the correct method for counting combinations
    stats.totalVariants = this.getTotalCombinations();
    
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
