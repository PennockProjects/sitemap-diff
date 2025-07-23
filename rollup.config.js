import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';

export default {
  external: ['fs', 'node-fetch', '@aws-sdk/client-s3', 'fast-xml-parser'], // External dependencies that should not be bundled
  input: 'src/index.ts',         // Entry point of the library
  output: [
    {
      file: 'lib/index.cjs',     // Output file for CommonJS format
      format: 'cjs',
      sourcemap: true,           // Generate source maps
    },
    {
      file: 'lib/index.esm.js',  // Output file for ES module format
      format: 'es',
      sourcemap: true,           // Generate source maps
    }
  ],
  plugins: [
    del({ targets: 'lib/*' }),                      // Clean the output directory before building
    typescript({ useTsconfigDeclarationDir: true }) // Use TypeScript plugin for transpilation,
  ],
}