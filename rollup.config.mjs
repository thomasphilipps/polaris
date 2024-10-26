import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sass from "rollup-plugin-sass";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy-watch";

const isProduction = process.env.NODE_ENV === "production";

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
    isProduction && terser(), // Minification pour un fichier plus compact
    copy({
      watch: ["src/assets/", "src/lang/", "src/templates/", "src/system.json", "src/polaris.css"],
      targets: [
        { src: ["src/assets/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/assets" },
        { src: ["src/lang/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/lang" },
        { src: ["src/templates/*", "!src/**/*~"], dest: "dist/Data/systems/polaris/templates" },
        { src: ["src/system.json", "!src/**/*~"], dest: "dist/Data/systems/polaris" },
        { src: ["src/polaris.css", "!src/**/*~"], dest: "dist/Data/systems/polaris" },
      ],
    }),
  ],
};
