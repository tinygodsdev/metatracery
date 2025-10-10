#!/usr/bin/env node

/**
 * Scientific Grammar Engine - Demo Example
 * 
 * This example demonstrates the capabilities of our universal grammar engine
 * for scientific research with controlled generation and metadata tracking.
 */

import { GrammarEngine } from '../src/GrammarEngine';
import { GrammarRule } from '../src/types';

// Example 1: Linguistic Grammar (Word Order Research)
console.log('🔬 SCIENTIFIC GRAMMAR ENGINE DEMO');
console.log('=====================================\n');

console.log('📚 Example 1: Linguistic Grammar (Word Order Research)');
console.log('------------------------------------------------------');

const linguisticGrammar: GrammarRule = {
  "SP": ["#NP#"],           // Subject phrase
  "OP": ["#NP#"],           // Object phrase  
  "NP": ["girl", "cat"],    // Noun phrases
  "VP": ["loves", "eats", "pets"], // Verb phrases
  "SVO": ["#SP# #VP# #OP#"], // Subject-Verb-Object order
  "VSO": ["#VP# #SP# #OP#"], // Verb-Subject-Object order
  "word_order": ["#SVO#", "#VSO#"], // Word order parameter
  "origin": ["#word_order#"] // Starting point
};

const linguisticEngine = new GrammarEngine(linguisticGrammar);

console.log('📋 Extracted Parameters:');
const linguisticParams = linguisticEngine.getParameters();
for (const [name, param] of Object.entries(linguisticParams)) {
  console.log(`  ${name}: [${param.values.join(', ')}] (parameter: ${param.isParameter})`);
}

console.log('\n📊 Grammar Statistics:');
const linguisticStats = linguisticEngine.getParameterStatistics();
console.log(`  Total possible combinations: ${linguisticStats.totalVariants}`);

console.log('\n🎯 Controlled Generation Examples:');
console.log('  SVO with "girl" and "loves":');
const svoResult = linguisticEngine.generateWithParameters('#origin#', {
  word_order: '#SVO#',
  NP: 'girl',
  VP: 'loves'
});
console.log(`    Result: "${svoResult.content}"`);
console.log(`    Parameters: ${JSON.stringify(svoResult.metadata.parameters)}`);
console.log(`    Generation path: ${svoResult.metadata.generationPath.join(' → ')}`);

console.log('\n  VSO with "cat" and "eats":');
const vsoResult = linguisticEngine.generateWithParameters('#origin#', {
  word_order: '#VSO#',
  NP: 'cat',
  VP: 'eats'
});
console.log(`    Result: "${vsoResult.content}"`);
console.log(`    Parameters: ${JSON.stringify(vsoResult.metadata.parameters)}`);

console.log('\n🔍 Structure Analysis:');
console.log(`    SVO structure: ${JSON.stringify(svoResult.metadata.structure, null, 2)}`);

// Example 2: Mathematical Grammar
console.log('\n\n🧮 Example 2: Mathematical Expression Grammar');
console.log('----------------------------------------------');

const mathGrammar: GrammarRule = {
  "number": ["1", "2", "3", "4", "5"],
  "operator": ["+", "-", "*", "/"],
  "expression": ["#number##operator##number#"],
  "complex_expression": ["(#expression#)#operator#(#expression#)"],
  "calculation_type": ["#expression#", "#complex_expression#"],
  "origin": ["#calculation_type#"]
};

const mathEngine = new GrammarEngine(mathGrammar);

console.log('📋 Extracted Parameters:');
const mathParams = mathEngine.getParameters();
for (const [name, param] of Object.entries(mathParams)) {
  console.log(`  ${name}: [${param.values.join(', ')}]`);
}

console.log('\n📊 Grammar Statistics:');
const mathStats = mathEngine.getParameterStatistics();
console.log(`  Total possible combinations: ${mathStats.totalVariants}`);

console.log('\n🎯 Mathematical Generation Examples:');
console.log('  Simple expression:');
const simpleMath = mathEngine.generateWithParameters('#origin#', {
  calculation_type: '#expression#',
  number: '3',
  operator: '+'
});
console.log(`    Result: "${simpleMath.content}"`);
console.log(`    Structure: ${JSON.stringify(simpleMath.metadata.structure, null, 2)}`);

console.log('\n  Complex expression:');
const complexMath = mathEngine.generateWithParameters('#origin#', {
  calculation_type: '#complex_expression#',
  number: '2',
  operator: '*'
});
console.log(`    Result: "${complexMath.content}"`);
console.log(`    Structure: ${JSON.stringify(complexMath.metadata.structure, null, 2)}`);

// Example 3: Systematic Exploration
console.log('\n\n🔬 Example 3: Systematic Parameter Exploration');
console.log('-----------------------------------------------');

console.log('📊 All SVO combinations (first 5):');
const svoCombinations = linguisticEngine.generateAllCombinations('#origin#')
  .filter(result => result.metadata.parameters.word_order === '#SVO#')
  .slice(0, 5);

svoCombinations.forEach((result, index) => {
  console.log(`  ${index + 1}. "${result.content}" (NP: ${result.metadata.parameters.NP}, VP: ${result.metadata.parameters.VP})`);
});

console.log('\n📊 Parameter Matrix: word_order × VP');
const matrix = linguisticEngine.generateParameterMatrix('#origin#', {
  word_order: ['#SVO#', '#VSO#'],
  VP: ['loves', 'eats']
});

console.log('Matrix results:');
matrix.forEach((row, rowIndex) => {
  const wordOrder = row[0].metadata.parameters.word_order;
  console.log(`  ${wordOrder}:`);
  row.forEach((result, colIndex) => {
    console.log(`    ${colIndex + 1}. "${result.content}"`);
  });
});

// Example 4: Metadata Analysis
console.log('\n\n📈 Example 4: Metadata Analysis');
console.log('--------------------------------');

const analysisResult = linguisticEngine.generateWithParameters('#origin#', {
  word_order: '#SVO#',
  NP: 'girl',
  VP: 'loves'
});

console.log('🔍 Complete Metadata Analysis:');
console.log(`  Content: "${analysisResult.content}"`);
console.log(`  Generation time: ${analysisResult.metadata.generationTime}ms`);
console.log(`  Applied rules count: ${analysisResult.metadata.appliedRules.length}`);
console.log(`  Generation path: ${analysisResult.metadata.generationPath.join(' → ')}`);

console.log('\n📋 Applied Rules Detail:');
analysisResult.metadata.appliedRules.forEach((rule, index) => {
  console.log(`  ${index + 1}. ${rule.symbol}: "${rule.selectedRule}" → "${rule.result}" (depth: ${rule.depth})`);
});

console.log('\n🏗️ Structure Metadata:');
const structure = analysisResult.metadata.structure;
if (structure) {
  console.log(`  Length: ${structure.length} characters`);
  console.log(`  Word count: ${structure.wordCount}`);
  console.log(`  References: [${structure.references?.join(', ') || 'none'}]`);
  console.log(`  Sequence: [${structure.sequence?.join(', ') || 'none'}]`);
  console.log(`  Extracted at: ${structure.extractedAt}`);
} else {
  console.log('  No structure metadata available');
}

// Example 5: Error Handling
console.log('\n\n⚠️ Example 5: Error Handling');
console.log('----------------------------');

const errorResult = linguisticEngine.generateWithParameters('#missingSymbol#', {});
console.log(`  Missing symbol result: "${errorResult.content}"`);
console.log(`  Error handling: ${errorResult.content.includes('((missing:') ? '✅ Handled gracefully' : '❌ Not handled'}`);

console.log('\n\n🎉 Demo completed successfully!');
console.log('=====================================');
console.log('This demonstrates the scientific grammar engine capabilities:');
console.log('✅ Universal domain support (linguistics, mathematics, etc.)');
console.log('✅ Automatic parameter extraction from grammar structure');
console.log('✅ Controlled generation with specific parameters');
console.log('✅ Systematic exploration of all combinations');
console.log('✅ Complete metadata tracking and analysis');
console.log('✅ Error handling and graceful degradation');
console.log('✅ High test coverage and reliability');
console.log('\nPerfect for scientific research requiring controlled, systematic generation! 🔬');
