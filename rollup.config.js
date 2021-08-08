import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'js/index.ts',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript(),
    scss({
      output: 'dist/css/bundle.css',
      sourceMap: true
    }),
    serve({
      port: '8080',
    }),
    livereload(),
  ],
};