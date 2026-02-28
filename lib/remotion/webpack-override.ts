import path from 'path'
import type { WebpackOverrideFn } from '@remotion/bundler'

export const webpackOverride: WebpackOverrideFn = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      '@': path.resolve(process.cwd()),
    },
  },
})
