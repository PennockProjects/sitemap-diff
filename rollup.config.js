import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import versionInjector from 'rollup-plugin-version-injector';

export default [
  // Library Configuration
  {
    input: 'src/index.ts', // Entry point for the library
    output: [
      {
        file: 'lib/index.cjs', // CommonJS output
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true, // Inline dynamic imports, instead of chunking
      },
      {
        file: 'lib/index.esm.js', // ES module output
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true, // Inline dynamic imports, instead of chunking
      },
    ],
    plugins: [
      del({ targets: 'lib/*' }), // Clean the output directory
      json(),
      commonjs(),
      nodeResolve({ browser: false, preferBuiltins: true }),
      typescript({ useTsconfigDeclarationDir: true }),
    ],
  },

  // CLI Configuration
  {
    input: 'src/cli.ts', // Entry point for the CLI
    output: {
      file: 'lib/cli.js', // Output file for the CLI
      format: 'es', // CommonJS format for CLI
      sourcemap: true,
      banner: '#!/usr/bin/env node', // Add shebang for CLI
      inlineDynamicImports: true, // Inline dynamic imports, instead of chunking
    },
    plugins: [
      commonjs(),
      json(),
      nodeResolve({ browser: false, preferBuiltins: true }),
      typescript({ useTsconfigDeclarationDir: true }),
      versionInjector({
        format: 'esm', // Format for version injection
        injectInComments: false, // Inject version in comments
      }),
    ],
    external: ['fs', 'path'], // Mark Node.js built-ins as external
  },
];