import type { GrammarRule, ExtractedParameters, ExtractedParameter } from './types';

export type { ExtractedParameters, ExtractedParameter };

/**
 * Class for automatic parameter extraction from grammar
 * Works with any domain - extracts parameters only from grammar structure
 */
export class ParameterExtractor {
  /**
   * Extracts parameters from grammar
   */
  extractParameters(grammar: GrammarRule): ExtractedParameters {
    const parameters: ExtractedParameters = {};
    
    for (const [symbol, rules] of Object.entries(grammar)) {
      const parameter = this.analyzeSymbol(symbol, rules, grammar);
      if (parameter.isParameter) {
        parameters[symbol] = parameter;
      }
    }
    
    return parameters;
  }
  
  /**
   * Analyzes symbol and determines if it's a parameter
   */
  private analyzeSymbol(
    symbol: string, 
    rules: string[], 
    grammar: GrammarRule
  ): ExtractedParameter {
    // Symbol is a parameter if:
    // 1. Has multiple alternatives
    // 2. Contains references to other parameter symbols
    
    const isParameter = this.isParameterSymbol(symbol, rules, grammar);
    
    // Normalize parameter values by stripping # symbols from simple references
    const normalizedValues = rules.map(rule => this.normalizeValue(rule));
    
    return {
      symbol,
      values: normalizedValues,
      currentValue: undefined,
      isParameter
    };
  }
  
  /**
   * Normalizes parameter values by stripping # symbols from simple references
   * Only normalizes simple patterns like #NAME# -> NAME
   * Keeps complex patterns (with spaces or multiple refs) as-is
   */
  private normalizeValue(value: string): string {
    // Check if it's a simple reference pattern like #NAME#
    const simpleRefMatch = /^#([A-Za-z_][A-Za-z0-9_]*)#$/.exec(value);
    if (simpleRefMatch) {
      return simpleRefMatch[1]; // Return just the name without #
    }
    
    // For complex patterns or literals, return as-is
    return value;
  }

  /**
   * Determines if symbol is a parameter
   */
  private isParameterSymbol(
    _symbol: string, 
    rules: string[], 
    grammar: GrammarRule
  ): boolean {
    // 1. Multiple alternatives
    if (rules.length > 1) {
      return true;
    }
    
    // 2. Contains references to other parameter symbols
    const rule = rules[0];
    if (this.containsParameterReferences(rule, grammar)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Checks if rule contains references to parameter symbols
   */
  private containsParameterReferences(rule: string, grammar: GrammarRule): boolean {
    const references = this.extractSymbolReferences(rule);
    
    for (const ref of references) {
      if (grammar[ref] && grammar[ref].length > 1) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Extracts symbol references from rule
   */
  private extractSymbolReferences(rule: string): string[] {
    const references: string[] = [];
    const regex = /#([^#]+)#/g;
    let match;
    
    while ((match = regex.exec(rule)) !== null) {
      references.push(match[1]);
    }
    
    return references;
  }
  
  /**
   * Gets all possible parameter combinations
   */
  getAllParameterCombinations(parameters: ExtractedParameters): Record<string, string>[] {
    const parameterNames = Object.keys(parameters);
    const combinations: Record<string, string>[] = [];
    
    this.generateCombinations(parameters, parameterNames, 0, {}, combinations);
    
    return combinations;
  }
  
  /**
   * Recursively generates parameter combinations
   */
  private generateCombinations(
    parameters: ExtractedParameters,
    parameterNames: string[],
    index: number,
    currentCombination: Record<string, string>,
    combinations: Record<string, string>[]
  ): void {
    if (index >= parameterNames.length) {
      combinations.push({ ...currentCombination });
      return;
    }
    
    const paramName = parameterNames[index];
    const parameter = parameters[paramName];
    
    for (const value of parameter.values) {
      currentCombination[paramName] = value;
      this.generateCombinations(parameters, parameterNames, index + 1, currentCombination, combinations);
    }
  }
  
  /**
   * Filters parameters by constraints
   */
  filterParameters(
    parameters: ExtractedParameters,
    constraints: {
      required?: Record<string, string>;
      excluded?: Record<string, string[]>;
    }
  ): ExtractedParameters {
    const filtered: ExtractedParameters = { ...parameters };
    
    // Apply required parameters
    if (constraints.required) {
      for (const [paramName, value] of Object.entries(constraints.required)) {
        if (filtered[paramName]) {
          filtered[paramName] = {
            ...filtered[paramName],
            values: [value],
            currentValue: value
          };
        }
      }
    }
    
    // Exclude unwanted values
    if (constraints.excluded) {
      for (const [paramName, excludedValues] of Object.entries(constraints.excluded)) {
        if (filtered[paramName]) {
          filtered[paramName] = {
            ...filtered[paramName],
            values: filtered[paramName].values.filter(value => !excludedValues.includes(value))
          };
        }
      }
    }
    
    return filtered;
  }
  
  /**
   * Extracts contextual parameters (for symbols used in multiple contexts)
   */
  extractContextualParameters(grammar: GrammarRule): Record<string, string[]> {
    const contexts: Record<string, string[]> = {};
    
    for (const [symbol, rules] of Object.entries(grammar)) {
      for (const rule of rules) {
        const references = this.extractSymbolReferences(rule);
        for (const ref of references) {
          if (!contexts[ref]) {
            contexts[ref] = [];
          }
          if (!contexts[ref].includes(symbol)) {
            contexts[ref].push(symbol);
          }
        }
      }
    }
    
    return contexts;
  }
}
