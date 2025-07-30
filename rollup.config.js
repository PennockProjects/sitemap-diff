import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',         // Entry point of the library
  output: [
    {
      file: 'lib/index.cjs',     // Output file for CommonJS format
      format: 'cjs',
      sourcemap: true,           // Generate source maps
      inlineDynamicImports: true, // Inline dynamic imports, instead of chunking
    },
    {
      file: 'lib/index.esm.js',  // Output file for ES module format
      format: 'es',
      sourcemap: true,           // Generate source maps
      inlineDynamicImports: true, // Inline dynamic imports, instead of chunking
    }
  ],
  plugins: [
    del({ targets: 'lib/*' }),                      // Clean the output directory before building
    json(),                                         // Include JSON files in the bundle
    commonjs(),                                     // Convert CommonJS modules to ES6
    nodeResolve({ browser: false, preferBuiltins: true }), // Resolve node modules
                                                           // browser:false for use in nodejs
                                                           // preferBuiltins: true = use native node functions where possible
    typescript({ useTsconfigDeclarationDir: true }) // Use TypeScript plugin for transpilation,
  ]
}