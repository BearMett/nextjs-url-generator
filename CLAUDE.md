# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension called "Next.js URL Generator" that provides CodeLens functionality for both Next.js API routes and App Router pages. The extension analyzes TypeScript/JavaScript files in Next.js projects and displays clickable URI paths above:
- HTTP method functions (GET, POST, PUT, DELETE, PATCH) in API route files
- Default export React components in App Router page files  
allowing developers to copy endpoint paths/page URLs and full URLs to clipboard.

## Development Commands

### Build and Compilation
- `yarn run compile` - Compile TypeScript and run lint/type checks
- `yarn run package` - Production build with minification
- `yarn run watch` - Watch mode for development (runs both esbuild and TypeScript watch)
- `yarn run watch:esbuild` - Watch mode for esbuild only
- `yarn run watch:tsc` - Watch mode for TypeScript type checking only

### Code Quality
- `yarn run lint` - Run ESLint on source files
- `yarn run check-types` - Run TypeScript type checking without compilation

### Testing
- `yarn run test` - Run VS Code integration tests using @vscode/test-cli
- `yarn run test:unit` - Run unit tests using Vitest
- `yarn run pretest` - Prepare for testing (compile, lint, type check)
- `yarn run compile-tests` - Compile test files to `out/` directory

### Publishing
- `yarn run vscode:prepublish` - Pre-publish hook (runs package command)

## Architecture Overview

### Core Extension Structure
The extension follows VS Code's standard extension pattern with these key components:

1. **Extension Entry Point** (`src/extension.ts`): Registers CodeLens providers and commands
2. **API CodeLens Provider** (`src/api-endpoint-provider.ts`): Displays API endpoint information for route files
3. **Page CodeLens Provider** (`src/page-codelens-provider.ts`): Displays page URL information for App Router page files
4. **AST Parsers**: 
   - `src/export-parser/export-parser.ts`: Parses HTTP method exports in API routes
   - `src/page-parser/page-parser.ts`: Parses default exports in page components
5. **Path Resolver** (`src/path-resolver.ts`): Converts file paths to Next.js routes (API routes + App Router pages)
6. **Configuration** (`src/options.ts`): Manages VS Code settings
7. **Internationalization** (`src/i18n/`): Supports English and Korean languages

### Key Design Patterns

#### CodeLens Implementation
- **API Routes**: Provides two CodeLens items per HTTP method (endpoint display and URL copy)
- **Page Routes**: Provides two CodeLens items per page (page path display and URL copy)
- Updates automatically when configuration changes
- Uses VS Code's event system for reactivity
- Separate providers for different file types to maintain clean separation of concerns

#### AST Parsing Strategy
- **API Parsing**: Uses `@babel/parser` and `@babel/traverse` to find HTTP method exports (GET, POST, etc.)
- **Page Parsing**: Detects default export React components in page files
- **File Detection**: Distinguishes between `route.ts` (API) and `page.tsx` (pages) files
- Stores parsing results to avoid duplicates and improve performance

#### Path Resolution
- Interface-based design (`IPathResolver`) allows for different resolution strategies
- `NextjsPathResolver` handles:
  - API routes: both App Router (`app/`) and Pages Router (`pages/`) patterns  
  - Page routes: App Router only (`app/` directory structure)
- Converts file paths to URL paths (e.g., `app/dashboard/users/page.tsx` → `/dashboard/users`)
- `MockPathResolver` available for testing

#### Configuration Management
- Centralized configuration through `getExtensionOptions()`
- Supports `hostUrl` setting for customizing base URL
- Language selection for internationalization

### Build System
- **ESBuild**: Fast bundling with TypeScript support
- **Target**: Node.js CommonJS for VS Code compatibility
- **External Dependencies**: VS Code API excluded from bundle
- **Source Maps**: Enabled in development, disabled in production
- **Watch Mode**: Integrated with VS Code's problem matcher

### Testing Strategy
- **Unit Tests**: Vitest for testing individual functions (e.g., AST parsing)
- **Integration Tests**: VS Code Test CLI for extension functionality
- **Test Resources**: Dynamic test file generation for realistic parsing scenarios
- **Mock Objects**: `MockPathResolver` for isolated testing

### Internationalization
- Message-based system with JSON files for each language
- Runtime language switching based on VS Code configuration
- Currently supports English (`en`) and Korean (`ko`)

## Development Notes

### File Type Detection
The extension works with two types of Next.js files:

#### API Route Files (`route.ts/tsx/js/jsx`)
- Looks for exported HTTP methods: GET, POST, PUT, DELETE, PATCH
- Supports both App Router (`app/`) and Pages Router (`pages/`) patterns
- Converts paths like `app/api/users/route.ts` → `/api/users`

#### Page Files (`page.ts/tsx/js/jsx`) - App Router Only
- Looks for default export React components
- Only works with App Router (`app/` directory structure)
- Converts paths like `app/dashboard/users/page.tsx` → `/dashboard/users`
- Handles dynamic routes: `app/users/[id]/page.tsx` → `/users/[id]`
- Root page: `app/page.tsx` → `/`

### Configuration Keys
- `nextUrlGen.hostUrl`: Base URL for generated endpoints (default: "http://localhost:3000")
- `nextUrlGen.language`: UI language selection (default: "en", options: "en", "ko")

Note: There's a naming inconsistency where the configuration namespace is `nextUrlGen` but the package name is `nextjs-url-generator`.