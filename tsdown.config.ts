import { defineConfig } from 'tsdown';

const runtimeDeps = [
  'mdast-util-from-markdown',
  'mdast-util-gfm',
  'micromark-extension-gfm',
];

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'node',
    dts: true,
    clean: true,
    deps: {
      neverBundle: runtimeDeps,
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm', 'iife'],
    platform: 'browser',
    outDir: 'dist/browser',
    globalName: 'GithubMarkdownAdf',
    dts: false,
    clean: false,
    minify: true,
    deps: {
      alwaysBundle: [/.*/],
      onlyBundle: false,
    },
  },
]);
