/**
 * Main export for scientific grammar engine
 */

export { GrammarEngine as ScientificGrammarEngine } from './GrammarEngine';
export { ParameterExtractor } from './ParameterExtractor';
export { GenericStructureExtractor } from './GenericStructureExtractor';
export type * from './types';

// Convenience functions for quick start
import { GrammarEngine } from './GrammarEngine';

export function createGrammar(grammar: any, config?: any) {
  return new GrammarEngine(grammar, config);
}

export function loadGrammarFromFile(_filePath: string) {
  // TODO: Implement file loading
  throw new Error('Not implemented yet');
}
