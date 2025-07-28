import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enable global test functions like `describe`, `it`, etc.
    environment: 'node', // Use Node.js environment for testing
    coverage: {
      provider: 'v8', // Use v8 for coverage reporting
      reporter: ['text', 'html', 'json-summary', 'json'],
      reportOnFailure: true, // Optional: Report coverage even if tests fail
      reportsDirectory: './tests/output/coverage', // Directory to output coverage reports
    },
  },
});