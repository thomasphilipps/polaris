import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sass from 'rollup-plugin-sass';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy-watch';
import { dest } from 'gulp';

const isProduction = process.env.NODE_ENV === 'production';

const foundryPath = `${process.env.HOME}/.local/share/FoundryVTT/Data/systems/polaris`;

export default {
  input: 'src/polaris.mjs',
  output: {
    file: `${foundryPath}/polaris.mjs`,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    isProduction && terser(), // Minification pour un fichier plus compact
    copy({
      watch: ['src/assets/', 'src/lang/', 'src/templates/', 'src/system.json', 'src/polaris.css', 'src/packs'],
      targets: [

        { src: ['src/assets/*', '!src/**/*~'], dest: `${foundryPath}/assets` },
        { src: ['src/lang/*', '!src/**/*~'], dest: `${foundryPath}/lang` },
        { src: ['src/templates/*', '!src/**/*~'], dest: `${foundryPath}/templates` },
        { src: ['src/packs/*', '!src/**/*~'], dest: `${foundryPath}/packs` },
        { src: ['src/system.json', '!src/**/*~'], dest: foundryPath },
        { src: ['src/polaris.css', '!src/**/*~'], dest: foundryPath },
      ],
    }),
  ],
};
