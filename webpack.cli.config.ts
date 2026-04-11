import path from "path";
import type { Configuration } from "webpack";

/**
 * Webpack config that bundles the CLI into a single standalone JS file.
 * The output (dist/loopi-cli.js) is included as an extraResource in the
 * packaged Electron app so users can run `loopi` from their terminal.
 */
export const cliConfig: Configuration = {
  target: "node",
  mode: "production",
  entry: "./src/cli/runWorkflow.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
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
