# Scientific Grammar Engine - Makefile
# Convenient commands for development and testing

.PHONY: help install test test-watch test-coverage ui-dev ui-build clean lint format

# Default target
help:
	@echo "Scientific Grammar Engine - Available commands:"
	@echo ""
	@echo "  make install      - Install UI dependencies"
	@echo "  make test         - Run all tests (UI engine tests)"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make ui-dev       - Start UI development server"
	@echo "  make ui-build     - Build UI for production"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "  make dev          - Development mode (test + ui-dev)"
	@echo "  make ci           - CI mode (install + test + coverage)"
	@echo ""

# Install dependencies
install:
	@echo "Installing UI dependencies..."
	cd ui && npm install
	@echo "Dependencies installed!"

# Run all tests (UI engine tests)
test:
	@echo "Running UI engine tests..."
	cd ui && npm test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	cd ui && npm run test:watch

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	cd ui && npm run test:coverage


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
	cd ui && rm -rf dist/
	cd ui && rm -rf coverage/
	cd ui && rm -rf node_modules/.cache/
	@echo "Clean completed!"

# Development mode - test and start UI
dev: test ui-dev
	@echo "Development mode started!"

# CI mode - full pipeline
ci: install test-coverage
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
rebuild: clean install test
	@echo "Full rebuild completed!"
