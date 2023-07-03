import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const nodeResolvePlugin = nodeResolve()
const esbuildPlugin = esbuild({ target: 'esnext' })

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: 'src/shared.ts',
    output: {
      file: 'dist/shared.js',
      format: 'es',
    },
    plugins: [json(), nodeResolvePlugin, esbuildPlugin],
    external: [/node_modules/],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
    },
    plugins: [nodeResolvePlugin, esbuildPlugin],
    external: ['./shared.js', /node_modules/],
  },
  {
    input: 'src/server.ts',
    output: {
      file: 'dist/server.js',
      format: 'es',
    },
    plugins: [esbuildPlugin],
    external: ['./index.js', './shared.js'],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]
