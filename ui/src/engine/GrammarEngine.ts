import type { 
  GenerationResult, 
  EngineConfig,
  GenerationStatistics
} from './types';
import { ParameterExtractor } from './ParameterExtractor';
import type { ExtractedParameters } from './ParameterExtractor';
import { GrammarEngine, type Grammar, type Generated } from './Engine';
import { rawToGenerationResult } from './helpers';

/**
 * Scientific grammar generation engine
 * Generic engine that works with any domain
 */
export class GrammarProcessor {
  private grammar: Grammar;
  private parameters: ExtractedParameters;
  public parameterExtractor: ParameterExtractor;
  public engine: GrammarEngine;
  private config: EngineConfig;
  
  constructor(grammar: Grammar, config: Partial<EngineConfig> = {}) {
    this.grammar = grammar;
    this.config = {
      maxDepth: 10,
      enableTracking: true,
      enableStatistics: true,
      ...config
    };
    
    this.parameterExtractor = new ParameterExtractor();
    this.parameters = this.parameterExtractor.extractParameters(grammar);
    this.engine = new GrammarEngine(grammar);
  }
  
  /**
   * Generates text with specific parameters
   */
  generateWithParameters(
    rule: string, 
    parameterValues: Record<string, string>
  ): GenerationResult {
    const startTime = Date.now();
    
    const generated = this.engine.generate(rule, parameterValues);

    const result = rawToGenerationResult([generated]);
    
    if (this.config.enableStatistics) {
      result[0].metadata.generationTime = Date.now() - startTime;
    }
    
    return result[0];
  }
  
  /**
   * Generates all possible combinations
   */
  generateAllCombinations(rule: string, constraints?: Record<string, string>): GenerationResult[] {
    // Get all generation paths from GrammarAnalyzer with constraints
    const generated = this.engine.expandAll(rule, constraints);
    
    // Convert GenerationPath to GenerationResult
    const results = rawToGenerationResult(generated);
    
    return results;
  }

  /**
   * Gets the total number of possible combinations using GrammarAnalyzer
   * @param constraints Optional parameter constraints to limit combinations
   */
  public getTotalCombinations(root: string, constraints?: Record<string, string>): number {
    return this.engine.countStrings(root, constraints);
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
    stats.totalVariants = this.getTotalCombinations('origin');
    
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
   * Gets contextual parameters (for symbols used in multiple contexts)
   */
  getContextualParameters(): Record<string, string[]> {
    return this.parameterExtractor.extractContextualParameters(this.grammar);
  }
}
