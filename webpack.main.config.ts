import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";

export const mainConfig: Configuration = {
  /**
   * Main entry point for the Electron main process
   */
  entry: "./src/main/index.ts",
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    alias: {
      "@src": __dirname + "/src",
      "@main": __dirname + "/src/main",
      "@app-types": __dirname + "/src/types",
      "@utils": __dirname + "/src/utils",
    },
  },
};
