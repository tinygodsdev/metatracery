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
    const result = this.generateWithTracking(rule);
    
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
    let parameters = this.parameters;
    
    // Get all combinations
    const combinations = this.parameterExtractor.getAllParameterCombinations(parameters);
    
    // Generate for each combination
    return combinations.map(combination => 
      this.generateWithParameters(rule, combination)
    );
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
    
    return matrix;
  }
  
  /**
   * Generates with metadata tracking
   */
  private generateWithTracking(rule: string): GenerationResult {
    const appliedRules: AppliedRule[] = [];
    const generationPath: string[] = [];
    const usedSymbols = new Set<string>();
    
    // Fully expand the rule
    const result = this.expandRule(rule, appliedRules, generationPath, usedSymbols, 0);
    
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
    depth: number
  ): string {
    if (depth > this.config.maxDepth) {
      return rule;
    }
    
    // Find symbol references in rule
    const symbolReferences = this.extractAllSymbolReferences(rule);
    
    if (symbolReferences.length === 0) {
      // This is a terminal rule
      return rule;
    }
    
    let result = rule;
    
    // Replace each symbol reference
    for (const symbolRef of symbolReferences) {
      const symbol = symbolRef.symbol;
      const placeholder = symbolRef.placeholder;
      
      // Track used symbol
      usedSymbols.add(symbol);
      
      // Select rule for symbol
      const selectedRule = this.selectRule(symbol);
      
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
      const expandedRule = this.expandRule(selectedRule, appliedRules, generationPath, usedSymbols, depth + 1);
      
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
  private selectRule(symbol: string): string {
    const rules = this.grammar[symbol];
    if (!rules || rules.length === 0) {
      return `((missing:${symbol}))`;
    }
    
    // If parameter is set, use it
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
    for (const [paramName, value] of Object.entries(parameterValues)) {
      if (this.parameters[paramName]) {
        this.parameters[paramName].currentValue = value;
      }
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
