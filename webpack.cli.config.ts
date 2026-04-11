import path from "path";
import type { Configuration } from "webpack";

/**
 * Webpack config that bundles the CLI into a single standalone JS file.
 */
export const cliConfig: Configuration = {
  target: "node",
  mode: "production",
  entry: "./src/cli/runWorkflow.ts",
  output: {
    path: path.resolve(process.cwd(), "dist"),
    filename: "loopi-cli.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.cli.json",
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};

export default cliConfig;
