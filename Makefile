# Scientific Grammar Engine - Makefile
# Convenient commands for development and testing

.PHONY: help install build test test-watch test-coverage demo quick-test ui-dev ui-build clean lint format

# Default target
help:
	@echo "Scientific Grammar Engine - Available commands:"
	@echo ""
	@echo "  make install      - Install dependencies"
	@echo "  make build        - Build TypeScript to JavaScript"
	@echo "  make test         - Run all tests"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make demo         - Run demonstration example"
	@echo "  make quick-test   - Run quick test example"
	@echo "  make ui-dev       - Start UI development server"
	@echo "  make ui-build     - Build UI for production"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "  make dev          - Development mode (build + test)"
	@echo "  make ci           - CI mode (install + build + test + coverage)"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build TypeScript to JavaScript
build:
	@echo "Building TypeScript..."
	npx tsc
	@echo "Build completed!"

# Run all tests
test:
	@echo "Running tests..."
	npm test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	npm run test:coverage

# Run demonstration example
demo: build
	@echo "Running demonstration example..."
	node dist/examples/demo.js

# Run quick test example
quick-test: build
	@echo "Running quick test example..."
	node dist/examples/quick-test.js

# UI Development
ui-dev:
	@echo "Starting UI development server..."
	cd ui && npm run dev

# UI Build
ui-build:
	@echo "Building UI for production..."
	cd ui && npm run build

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/.cache/
	@echo "Clean completed!"

# Development mode - build and test
dev: build test
	@echo "Development build completed!"

# CI mode - full pipeline
ci: install build test-coverage
	@echo "CI pipeline completed!"

# Lint code (placeholder - can be configured later)
lint:
	@echo "Linting code..."
	@echo "Linting not configured yet. Consider adding ESLint."

# Format code (placeholder - can be configured later)
format:
	@echo "Formatting code..."
	@echo "Formatting not configured yet. Consider adding Prettier."


# Full clean and rebuild
rebuild: clean install build test
	@echo "Full rebuild completed!"
