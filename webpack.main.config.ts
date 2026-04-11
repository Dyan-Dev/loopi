import type { Configuration } from "webpack";
import webpack from "webpack";
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
  externals: {
    "@nut-tree-fork/nut-js": "commonjs2 @nut-tree-fork/nut-js",
  },
  plugins: [
    // These are optional runtime dependencies loaded via dynamic import().
    // Ignore them at build time so webpack doesn't fail when they're not installed.
    new webpack.IgnorePlugin({ resourceRegExp: /^@aws-sdk\/client-s3$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^mongodb$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^mysql2\/promise$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^pg$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^ioredis$/ }),
  ],
};
