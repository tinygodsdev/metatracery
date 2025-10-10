# Scientific Grammar Engine

A universal, domain-agnostic grammar generation engine for scientific research. This engine allows you to create controlled, systematic generation of content with full metadata tracking and parameter control.

## Features

- **Universal Design**: Works with any domain (linguistics, mathematics, biology, chemistry, etc.)
- **Automatic Parameter Extraction**: Automatically identifies parameters from grammar structure
- **Full Control**: Generate specific combinations or all possible variants
- **Metadata Tracking**: Complete trace of applied rules and generation path
- **TypeScript**: Fully typed for scientific research
- **Comprehensive Testing**: 95%+ test coverage with Jest

## Quick Start

### Installation

```bash
# Install dependencies
make install
# or
npm install
```

### Basic Usage

```typescript
import { GrammarEngine, createGrammar } from './src';

// Define your grammar
const grammar = {
  "subject": ["cat", "dog"],
  "verb": ["runs", "jumps"],
  "sentence": ["#subject# #verb#"],
  "origin": ["#sentence#"]
};

// Create engine
const engine = createGrammar(grammar);

// Generate with specific parameters
const result = engine.generateWithParameters('#origin#', {
  subject: 'cat',
  verb: 'runs'
});

console.log(result.content); // "cat runs"
console.log(result.metadata.parameters); // { subject: 'cat', verb: 'runs' }
```

## Development

### Available Commands

```bash
make help          # Show all available commands
make build         # Build TypeScript to JavaScript
make test          # Run all tests
make test-watch    # Run tests in watch mode
make test-coverage # Run tests with coverage report
make demo          # Run comprehensive demonstration
make quick-test    # Run quick test example
make dev           # Development mode (build + test)
make ci            # CI mode (full pipeline)
make clean         # Clean build artifacts
```

### Running Examples

```bash
# Run comprehensive demonstration
make demo

# Run quick test
make quick-test
```

### Project Structure

```
src/
├── __tests__/           # Unit tests (Jest)
│   ├── GrammarEngine.test.ts
│   ├── ParameterExtractor.test.ts
│   └── GenericStructureExtractor.test.ts
├── GrammarEngine.ts     # Main grammar generation engine
├── ParameterExtractor.ts # Automatic parameter extraction
├── GenericStructureExtractor.ts # Universal structure extraction
├── types.ts            # TypeScript type definitions
└── index.ts            # Main exports
```

## API Reference

### GrammarEngine

The main engine for grammar generation.

```typescript
const engine = new GrammarEngine(grammar, config);

// Generate with specific parameters
const result = engine.generateWithParameters(rule, parameters);

// Generate all possible combinations
const allResults = engine.generateAllCombinations(rule);

// Generate parameter matrix
const matrix = engine.generateParameterMatrix(rule, parameterSpace);

// Get parameter statistics
const stats = engine.getParameterStatistics();
```

### Parameter Extraction

Parameters are automatically extracted from grammar structure:

- **Multiple alternatives**: `"animal": ["cat", "dog", "bird"]` → parameter
- **References to parameters**: `"sentence": ["#animal# is cute"]` → parameter (if animal is parameter)

### Structure Extraction

The system automatically extracts structure metadata from applied rules:

- **References**: Symbol references in rules
- **Sequences**: Order of symbols in rules
- **Patterns**: Uppercase patterns, operators, numbers, etc.
- **Properties**: Length, word count, punctuation, etc.

## Examples

### Linguistic Grammar

```typescript
const linguisticGrammar = {
  "SP": ["#NP#"],
  "OP": ["#NP#"],
  "NP": ["girl", "cat"],
  "VP": ["loves", "eats", "pets"],
  "SVO": ["#SP# #VP# #OP#"],
  "VSO": ["#VP# #SP# #OP#"],
  "word_order": ["#SVO#", "#VSO#"],
  "origin": ["#word_order#"]
};

const engine = new GrammarEngine(linguisticGrammar);

// Generate SVO sentence
const svoResult = engine.generateWithParameters('#origin#', {
  word_order: '#SVO#',
  NP: 'girl',
  VP: 'loves'
});
// Result: "girl loves girl"

// Generate all combinations
const allResults = engine.generateAllCombinations('#origin#');
// 12 total combinations (2 word_order × 2 NP × 3 VP × 2 NP)
```

### Mathematical Grammar

```typescript
const mathGrammar = {
  "number": ["1", "2", "3", "4", "5"],
  "operator": ["+", "-", "*", "/"],
  "expression": ["#number##operator##number#"],
  "complex_expression": ["(#expression#)#operator#(#expression#)"],
  "calculation_type": ["#expression#", "#complex_expression#"],
  "origin": ["#calculation_type#"]
};

const engine = new GrammarEngine(mathGrammar);

// Generate simple expression
const result = engine.generateWithParameters('#origin#', {
  calculation_type: '#expression#',
  number: '3',
  operator: '+'
});
// Result: "3+3"
```

## Testing

The project includes comprehensive unit tests with Jest:

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run tests in watch mode
make test-watch
```

Test coverage:
- **GrammarEngine**: 95.5%
- **ParameterExtractor**: 100%
- **GenericStructureExtractor**: 97.91%

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `make ci` to ensure everything passes
6. Submit a pull request

## License

ISC License - see package.json for details.

## Scientific Applications

This engine is designed for scientific research where you need:

- **Controlled generation**: Generate specific combinations for comparison
- **Systematic exploration**: Explore all possible parameter combinations
- **Metadata tracking**: Track which rules were applied and how
- **Domain independence**: Work with any type of grammar (linguistic, mathematical, biological, etc.)
- **Reproducibility**: Deterministic generation with full traceability

Perfect for:
- Linguistic research (word order, syntax, morphology)
- Mathematical exploration (expressions, formulas, patterns)
- Biological modeling (DNA sequences, protein structures)
- Chemical notation (molecular formulas, reactions)
- Any domain requiring systematic generation with metadata
