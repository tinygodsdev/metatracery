#!/usr/bin/env node

/**
 * Quick Test Example - Simple demonstration of the grammar engine
 */

import { GrammarEngine } from '../src/GrammarEngine';

// Simple grammar for quick testing
const grammar = {
  "animal": ["cat", "dog", "bird"],
  "action": ["runs", "jumps", "flies"],
  "sentence": ["The #animal# #action#"],
  "origin": ["#sentence#"]
};

console.log('🚀 Quick Grammar Engine Test');
console.log('============================\n');

const engine = new GrammarEngine(grammar);

// Show extracted parameters
console.log('📋 Parameters:');
const params = engine.getParameters();
for (const [name, param] of Object.entries(params)) {
  console.log(`  ${name}: [${param.values.join(', ')}]`);
}

// Generate a few examples
console.log('\n🎯 Generated Examples:');
for (let i = 0; i < 3; i++) {
  const result = engine.generateWithParameters('#origin#', {});
  console.log(`  ${i + 1}. "${result.content}"`);
}

// Generate with specific parameters
console.log('\n🎯 Controlled Generation:');
const controlled = engine.generateWithParameters('#origin#', {
  animal: 'cat',
  action: 'runs'
});
console.log(`  Controlled: "${controlled.content}"`);
console.log(`  Parameters: ${JSON.stringify(controlled.metadata.parameters)}`);

console.log('\n✅ Quick test completed!');
