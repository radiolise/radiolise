import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

/**
 * @type {import('rollup').InputPluginOption}
 */
const resolvePlugins = [json(), nodeResolve()]

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
    },
    plugins: [...resolvePlugins, esbuild({ target: 'esnext' })],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cdn.min.js',
      format: 'iife',
      name: 'RadioliseMetadata',
    },
    plugins: [...resolvePlugins, esbuild({ target: 'esnext', minify: true })],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  },
]
