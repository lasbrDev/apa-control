import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Options } from 'tsup'

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))
const allDeps = Object.keys(pkg.dependencies || {})

export const tsup: Options = {
  format: ['esm'],
  minify: false,
  watch: false,
  target: 'node20',
  outDir: 'dist',
  entry: ['src/server.ts', 'src/layout/**'],
  loader: { '.ejs': 'copy' },
  bundle: true,
  platform: 'node',
  splitting: false,
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
  external: [...allDeps, /^node:/],
}
