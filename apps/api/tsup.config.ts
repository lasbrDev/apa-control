import type { Options } from 'tsup'

export const tsup: Options = {
  format: ['esm'],
  minify: true,
  watch: false,
  target: 'node20',
  outDir: 'dist',
  entry: ['src/server.ts', 'src/layout/**'],
  loader: { '.ejs': 'copy' },
}
