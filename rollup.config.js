import { nodeResolve } from '@rollup/plugin-node-resolve';

import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs', exports: 'named' },
    { file: pkg.module, format: 'es' },
  ],
  plugins: [nodeResolve()],
};