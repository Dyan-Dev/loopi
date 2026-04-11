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
    extraResource: ["dist/loopi-cli.js", "bin/loopi"],
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
          scripts: {
            postinst: "scripts/postinst.sh",
            postrm: "scripts/postrm.sh",
          },
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
