/**
 * Main export for scientific grammar engine
 */

export { GrammarProcessor as ScientificGrammarEngine } from './GrammarEngine';
export { ParameterExtractor } from './ParameterExtractor';
export { GenericStructureExtractor } from './GenericStructureExtractor';
export type * from './types';

// Convenience functions for quick start
import { GrammarProcessor } from './GrammarEngine';

export function createGrammar(grammar: any, config?: any) {
  return new GrammarProcessor(grammar, config);
}

export function loadGrammarFromFile(_filePath: string) {
  // TODO: Implement file loading
  throw new Error('Not implemented yet');
}
