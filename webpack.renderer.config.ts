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
  },
};
