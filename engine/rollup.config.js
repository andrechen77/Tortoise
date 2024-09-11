import { fileURLToPath } from 'node:url';
import { wasm } from '@rollup/plugin-wasm';
import resolve from '@rollup/plugin-node-resolve';
import coffee from '@bkuri/rollup-plugin-coffeescript';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import includePaths from 'rollup-plugin-includepaths';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const extensions = [ '.coffee', '.js' ]

export default {
  input: 'src/main/coffee/bootstrap.coffee',
  output: {
    file: 'target/classes/js/tortoise-engine.js', // TODO where should this actually be placed?
    format: 'iife',
  },
  plugins: [
    coffee(),
    nodePolyfills({ extensions }),
    resolve({ extensions }),
    alias({
      entries: {
        'brazier': 'brazierjs',
        'engine-scala': fileURLToPath(new URL('target/enginescalajs-opt.js', import.meta.url)),
      }
    }),
    includePaths({
      paths: ['./src/main/coffee/'],
      extensions,
    }),
    commonjs({
      include: ['src/**', 'node_modules/**'],
      extensions,
    }),
    wasm(),
  ],
  onwarn: (warning, warn) => {
    // suppress warning about `this` being rewritten to `undefined` when we are
    // consuming the output of the Scala.js code. according to https://stackoverflow.com/questions/70313954/how-to-avoid-this-has-been-rewritten-to-undefined-warning-when-bundling-sc,
    // ignoring the warning is the correct thing to do.
    if (warning.code === 'THIS_IS_UNDEFINED' && warning.loc.file.endsWith("target/enginescalajs-opt.js")) {
      return;
    }

    warn(warning);
  }
};
