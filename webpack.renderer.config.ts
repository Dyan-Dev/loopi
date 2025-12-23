import type { Configuration } from "webpack";
import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    alias: {
      "@src": __dirname + "/src",
      "@components": __dirname + "/src/components",
      "@hooks": __dirname + "/src/hooks",
      "@app-types": __dirname + "/src/types",
      "@utils": __dirname + "/src/utils",
    },
  },
};
