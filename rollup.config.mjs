import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import sass from 'rollup-plugin-sass';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import os from 'os';

const isProduction = process.env.NODE_ENV === 'production';

function resolveFoundryPath() {
  if (process.env.FOUNDRY_DATA_PATH) {
    return `${process.env.FOUNDRY_DATA_PATH}/systems/polaris`;
  }

  const isWSL =
    Boolean(process.env.WSL_DISTRO_NAME) || os.release().toLowerCase().includes('microsoft');

  return isWSL
    ? `${process.env.HOME}/foundrydata/Data/systems/polaris`
    : `${process.env.HOME}/.local/share/FoundryVTT/Data/systems/polaris`;
}

const foundryPath = resolveFoundryPath();

export default {
  input: 'src/polaris.mjs',
  output: {
    file: `${foundryPath}/polaris.mjs`,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    }),
    resolve(),
    commonjs(),
    isProduction && terser(),
    copy({
      copyOnce: true, // Évite les recompilations en boucle au démarrage
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
