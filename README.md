# Scientific Grammar Engine

A universal, domain-agnostic grammar generation engine for scientific research. This engine allows you to create controlled, systematic generation of content with full metadata tracking and parameter control.

**Created by [Dani Polani](https://tinygods.dev) from [TinyGods.Dev](https://tinygods.dev)**  
**Inspired by [Tracery.js](https://github.com/galaxykate/tracery)** 
**Repository: [github.com/tinygodsdev/metatracery](https://github.com/tinygodsdev/metatracery)**

## Project Structure

```
/home/titkovd/My/metatracery/
├── ui/                    # Main application (React + Engine)
│   ├── src/engine/        # Grammar engine (TypeScript)
│   ├── src/components/    # React UI components
│   └── ...
├── Makefile              # Development commands
├── .gitignore            # Git ignore rules
└── tracery.js            # Original library (archive)
```

## Features

- **Universal Design**: Works with any domain (linguistics, mathematics, biology, chemistry, etc.)
- **Automatic Parameter Extraction**: Automatically identifies parameters from grammar structure
- **Full Control**: Generate specific combinations or all possible variants
- **Metadata Tracking**: Complete trace of applied rules and generation path
- **TypeScript**: Fully typed for scientific research
- **Comprehensive Testing**: 95%+ test coverage with Jest
- **Web Interface**: React-based UI for interactive grammar editing and testing

## Quick Start

### Installation

```bash
# Install dependencies
make install
```

### Usage

The project provides a web interface for interactive grammar editing and testing. Start the development server:

```bash
make dev
```

Then open your browser to `http://localhost:5173` to use the interactive grammar editor.
```

## Development

### Available Commands

```bash
make help          # Show all available commands
make install       # Install UI dependencies
make test          # Run all tests (UI engine tests)
make test-watch    # Run tests in watch mode
make test-coverage # Run tests with coverage report
make ui-dev        # Start UI development server
make ui-build      # Build UI for production
make dev           # Development mode (test + ui-dev)
make ci            # CI mode (install + test + coverage)
make clean         # Clean build artifacts
```

### Web Interface

The project includes a React-based web interface for interactive grammar editing and testing:

```bash
# Start development server
make ui-dev

# Build for production
make ui-build
```

The web interface provides:
- Interactive grammar editor with JSON syntax highlighting
- Parameter controls with automatic filtering
- Real-time generation results
- Metadata visualization
- Export functionality


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

MIT license 

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
