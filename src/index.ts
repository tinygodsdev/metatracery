/**
 * Main export for scientific grammar engine
 */

export { GrammarEngine as ScientificGrammarEngine } from './GrammarEngine';
export { ParameterExtractor } from './ParameterExtractor';
export { GenericStructureExtractor } from './GenericStructureExtractor';
export * from './types';

// Convenience functions for quick start
export function createGrammar(grammar: any, config?: any) {
  const { GrammarEngine } = require('./GrammarEngine');
  return new GrammarEngine(grammar, config);
}

export function loadGrammarFromFile(filePath: string) {
  // TODO: Implement file loading
  throw new Error('Not implemented yet');
}
