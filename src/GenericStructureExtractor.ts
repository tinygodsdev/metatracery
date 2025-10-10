import { AppliedRule, StructureExtractor } from './types';

/**
 * Generic structure extractor that works with any domain
 * Extracts structure ONLY from grammar rules, no hardcoded patterns
 */
export class GenericStructureExtractor implements StructureExtractor {
  /**
   * Extracts generic structure from applied rules
   */
  extractStructure(appliedRules: AppliedRule[]): Record<string, any> {
    const structure: Record<string, any> = {};
    
    // Extract structure based on rule patterns only
    for (const rule of appliedRules) {
      this.extractFromRule(rule, structure);
    }
    
    // Post-process structure
    this.postProcessStructure(structure);
    
    return structure;
  }
  
  /**
   * Extracts structure information from a single rule
   */
  private extractFromRule(rule: AppliedRule, structure: Record<string, any>): void {
    const { symbol, selectedRule, result } = rule;
    
    // Extract based on rule content patterns only
    this.extractFromRuleContent(selectedRule, result, structure);
    
    // Extract basic properties from result
    this.extractBasicProperties(result, structure);
  }
  
  /**
   * Extracts structure based on rule content patterns
   */
  private extractFromRuleContent(selectedRule: string, result: string, structure: Record<string, any>): void {
    // Look for patterns in the rule itself
    if (selectedRule.includes('#')) {
      const references = selectedRule.match(/#([^#]+)#/g);
      if (references) {
        structure.references = references.map(ref => ref.replace(/#/g, ''));
      }
    }
    
    // Extract sequence information
    if (selectedRule.includes(' ')) {
      const parts = selectedRule.split(' ');
      structure.sequence = parts.map(part => part.replace(/#/g, ''));
    }
    
    // Extract any patterns that can be inferred from the rule content
    this.extractInferredPatterns(selectedRule, structure);
  }
  
  /**
   * Extracts basic properties from result
   */
  private extractBasicProperties(result: string, structure: Record<string, any>): void {
    // Extract basic properties from result
    structure.length = result.length;
    structure.wordCount = result.split(' ').length;
    
    // Extract patterns based on content (generic)
    if (result.match(/^[A-Z]/)) {
      structure.startsWithCapital = true;
    }
    
    if (result.match(/[.!?]$/)) {
      structure.endsWithPunctuation = true;
    }
  }
  
  /**
   * Extracts patterns that can be inferred from rule content
   * Only based on the actual rule content, no assumptions
   */
  private extractInferredPatterns(selectedRule: string, structure: Record<string, any>): void {
    // Extract any patterns that are actually present in the rule
    // This is completely generic and based only on what's in the rule
    
    // Look for any uppercase letter sequences (could be any domain-specific patterns)
    const uppercasePatterns = selectedRule.match(/[A-Z]{2,}/g);
    if (uppercasePatterns) {
      structure.patterns = uppercasePatterns;
    }
    
    // Look for any quoted strings or specific values
    const quotedStrings = selectedRule.match(/"([^"]+)"/g);
    if (quotedStrings) {
      structure.quotedValues = quotedStrings.map(q => q.replace(/"/g, ''));
    }
    
    // Look for any numeric patterns
    const numericPatterns = selectedRule.match(/\d+/g);
    if (numericPatterns) {
      structure.numericValues = numericPatterns.map(n => parseInt(n));
    }
    
    // Look for any special characters or operators
    const specialChars = selectedRule.match(/[+\-*/=<>!&|]+/g);
    if (specialChars) {
      structure.operators = specialChars;
    }
    
    // Look for any parentheses patterns
    if (selectedRule.includes('(') && selectedRule.includes(')')) {
      structure.hasParentheses = true;
    }
    
    // Look for any bracket patterns
    if (selectedRule.includes('[') && selectedRule.includes(']')) {
      structure.hasBrackets = true;
    }
  }
  
  /**
   * Post-processes the extracted structure
   */
  private postProcessStructure(structure: Record<string, any>): void {
    // Remove undefined values
    for (const key in structure) {
      if (structure[key] === undefined) {
        delete structure[key];
      }
    }
    
    // Add metadata
    structure.extractedAt = new Date().toISOString();
    structure.extractor = 'GenericStructureExtractor';
  }
}
