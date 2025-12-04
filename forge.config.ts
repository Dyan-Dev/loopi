import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "assets/logo", // no extension
  },

  rebuildConfig: {},

  makers: [
    // Windows
    new MakerSquirrel(
      {
        name: "loopi",
      },
      ["win32"]
    ),

    // macOS ZIP
    new MakerZIP({}, ["darwin"]),

    // Linux .deb
    new MakerDeb(
      {
        options: {
          icon: "assets/logo.png",
          maintainer: "loopi",
        },
      },
      ["linux"]
    ),
  ],

  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
  ],
};

export default config;
