# Grammar Engine UI

A modern React interface for the Scientific Grammar Engine, built with Mantine UI components.

## Features

- **JSON Grammar Editor** - Edit grammars with syntax highlighting and validation
- **Dynamic Parameter Controls** - Automatically generated filters based on grammar structure
- **Results Table** - View generated results with metadata
- **Export Functionality** - Export results as JSON
- **Dark Theme** - Optimized for long research sessions
- **Responsive Design** - Works on desktop and tablet

## Quick Start

```bash
# Install dependencies
make install

# Start development server
make dev
```

The application will be available at `http://localhost:5173`

## Available Commands

```bash
make help      # Show all available commands
make install   # Install dependencies
make dev       # Start development server
make build     # Build for production
make preview   # Preview production build
make clean     # Clean build artifacts
```

## Usage

1. **Load Example Grammar** - Click "Load Example" to see a sample linguistic grammar
2. **Edit Grammar** - Modify the JSON to create your own grammar rules
3. **Set Parameters** - Use the parameter controls to specify values for generation
4. **Generate Results** - Click "Generate" for specific parameters or "Generate All" for all combinations
5. **View Results** - See generated text with metadata in the results table
6. **Export Data** - Download results as JSON for further analysis

## Grammar Format

```json
{
  "symbol": ["rule1", "rule2", "rule3"],
  "another_symbol": ["#symbol# with text"],
  "origin": ["#symbol#"]
}
```

- Use `#symbol#` to reference other symbols
- Use `origin` as the starting point for generation
- Multiple rules create parameter choices

## Technology Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Full type safety
- **Mantine UI** - Professional component library
- **Vite** - Fast build tool and dev server
- **Tabler Icons** - Beautiful icon set

## Development

The UI integrates with the grammar engine located in `src/engine/`. The engine provides:

- Automatic parameter extraction
- Controlled generation
- Metadata tracking
- Structure analysis

## Scientific Applications

Perfect for:
- Linguistic research (word order, syntax)
- Mathematical expression generation
- Biological sequence modeling
- Any domain requiring systematic generation with metadata
