import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copyWatch from "rollup-plugin-copy-watch"; // Utilisation de copy-watch pour surveiller les fichiers
import sass from "rollup-plugin-sass";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/polaris.mjs",
  output: {
    file: "dist/Data/systems/polaris/polaris.mjs",
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    terser(), // Minification pour un fichier plus compact
    copyWatch({
      targets: [
        {src: ["src/assets/**/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/assets"},
        {src: ["src/lang/**/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/lang"},
        {src: ["src/templates/**/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/templates"},
        {src: ["src/config.json", "!src/**/*~"], dest: "dist/Data/systems/polaris"},
      ],
      watch: ["src/assets/**/*", "src/lang/**/*", "src/templates/**/*", "src/config.json"],
    }),
    sass({
      output: "dist/Data/systems/polaris/polaris.css",
    }),
  ],
};
