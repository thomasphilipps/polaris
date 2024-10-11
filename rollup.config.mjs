import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import sass from "rollup-plugin-sass";

export default [
  {
    input: "src/polaris.ts",
    output: {
      file: "dist/Data/systems/polaris/polaris.mjs",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.build.json" }), // Utilise le fichier de configuration pour déclarations
      copy({
        targets: [
          { src: "src/assets/**/*", dest: "dist/Data/systems/polaris/assets" },
          { src: "src/lang/**/*", dest: "dist/Data/systems/polaris/lang" },
          { src: "src/templates/**/*", dest: "dist/Data/systems/polaris/templates" },
          { src: "src/system.json", dest: "dist/Data/systems/polaris" },
        ],
      }),
    ],
  },
  {
    input: "src/sass/main.scss",
    output: {
      file: "dist/Data/systems/polaris/polaris.css",
    },
    plugins: [
      sass({
        output: "dist/Data/systems/polaris/polaris.css",
      }),
    ],
  },
];
