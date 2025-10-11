/**
 * Core types for scientific grammar engine
 * Generic types that work with any domain
 */

// Basic grammar types
export interface GrammarRule {
  [symbol: string]: string[];
}

// Generation result with full metadata
export interface GenerationResult {
  content: string;
  metadata: {
    parameters: Record<string, any>;
    relevantParameters: Record<string, any>; // Only parameters that were actually used
    appliedRules: AppliedRule[];
    generationPath: string[];
    structure?: Record<string, any>; // Generic structure, not hardcoded
    generationTime?: number;
  };
}

// Applied rule with full information
export interface AppliedRule {
  symbol: string;
  selectedRule: string;
  result: string;
  depth: number;
  alternatives: string[]; // All possible alternatives for this symbol
  timestamp: number;
}

// Parameters extracted from grammar
export interface ExtractedParameter {
  symbol: string;
  values: string[];
  currentValue?: string;
  isParameter: boolean; // Whether this symbol is a parameter
}

export interface ExtractedParameters {
  [parameterName: string]: ExtractedParameter;
}

// Generation constraints
export interface GenerationConstraints {
  fixedWords?: {
    [symbol: string]: string;
  };
  requiredParameters?: Record<string, string>;
  excludedParameters?: Record<string, string[]>;
  maxDepth?: number;
}

// Parameter matrix for systematic generation
export interface ParameterMatrix {
  [parameterName: string]: string[];
}

// Node in expansion tree
export interface GrammarNode {
  symbol: string;
  rule: string;
  result: string;
  depth: number;
  children: GrammarNode[];
  parent?: GrammarNode;
  alternatives: string[];
  isExpanded: boolean;
}

// Engine configuration
export interface EngineConfig {
  maxDepth: number;
  enableTracking: boolean;
  enableStatistics: boolean;
  randomSeed?: number;
}

// Generation statistics
export interface GenerationStatistics {
  totalVariants: number;
  parameterCounts: Record<string, Record<string, number>>;
  averageDepth: number;
  maxDepth: number;
  generationTime: number;
}

// Generic structure extractor interface
export interface StructureExtractor {
  extractStructure(appliedRules: AppliedRule[]): Record<string, any>;
}

// Context-aware parameter system
export interface ContextualParameter {
  symbol: string;
  context: string; // e.g., "SP", "OP" for subject/object phrases
  value: string;
}

// Multi-context parameter values
export interface MultiContextParameters {
  [symbol: string]: {
    [context: string]: string;
  };
}
