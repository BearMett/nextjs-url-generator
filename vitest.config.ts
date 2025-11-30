import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only include unit test files (*.spec.ts) from src directory
    include: ['src/**/*.spec.ts'],
    // Exclude VS Code integration tests and compiled output
    exclude: [
      'node_modules/**',
      'out/**',
      'src/test/**',  // VS Code integration tests (run with vscode-test)
    ],
    // Use Node environment
    environment: 'node',
  },
});
