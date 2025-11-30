import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node', // backend-friendly
    include: ['src/**/*.spec.ts'], // adjust if you store tests elsewhere
    passWithNoTests: false,
    // threads: false, // sometimes helpful for Nest test isolation
    coverage: {
      provider: 'v8', // v8 is a supported provider for Vitest coverage
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        'dist/**',
        'src/main.ts',
        'src/**/*.module.ts',
        'src/utils/**',
        'src/test/**',
        'src/**/schemas/**',
        'src/**/dto/**',
        'src/**/constants/**',
        'src/**/interfaces/**',
        'src/**/types/**',
        'src/**/decorators/**',
        'src/**/guards/**',
        'src/**/pipes/**',
        'src/**/filters/**',
        'src/**/strategies/**',
        'src/**/config/**',
        'src/common/**',
        'src/app.controller.ts',
        'src/app.service.ts',
        'src/seed/**',
      ],
    },
    deps: {
      // You may configure deps options here if needed, but 'inline' is not supported
    },
    // setup files to run before tests (useful to import reflect-metadata, env, etc.)
    setupFiles: path.resolve(__dirname, 'test/setup.ts'),
  },
});
