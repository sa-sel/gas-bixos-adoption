import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const extensions = ['.ts', '.js'];

const preventTreeShakingPlugin = {
  name: 'no-threeshaking',
  resolveId: (id, importer) => (importer ? null : { id, moduleSideEffects: 'no-treeshake' }),
};

const config = {
  input: './src/scripts/index.ts',
  output: { dir: '.build/scripts', format: 'esm' },
  plugins: [
    preventTreeShakingPlugin,
    nodeResolve({ extensions }),
    babel({
      extensions,
      babelHelpers: 'runtime',
      exclude: ['node_modules/**'],
    }),
  ],
};

export default config;
