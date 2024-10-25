import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copyWatch from "rollup-plugin-copy-watch"; // Utilisation de copy-watch pour surveiller les fichiers
import sass from "rollup-plugin-sass";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy-watch";

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
    copy({
      watch: ["src/assets/", "src/lang/", "src/templates/", "src/system.json"],
      targets: [
        { src: ["src/assets/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/assets" },
        { src: ["src/lang/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/lang" },
        { src: ["src/templates/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/templates" },
        { src: ["src/system.json", "!src/**/*~"], dest: "dist/Data/systems/polaris" },
      ],
    }),
    sass({
      output: "dist/Data/systems/polaris/polaris.css",
    }),
  ],
};
