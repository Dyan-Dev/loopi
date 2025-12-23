# Code Style and Import Conventions

This project uses TypeScript + Biome for formatting. Import paths are organized with aliases to improve readability and refactor safety.

- Aliases (TypeScript + Webpack):
  - `@src/*` → `src/*`
  - `@components/*` → `src/components/*`
  - `@hooks/*` → `src/hooks/*`
  - `@main/*` → `src/main/*`
  - `@app-types/*` → `src/types/*`
  - `@utils/*` → `src/utils/*`

- Types:
  - Use `@app-types/*` for importing shared types across layers.
  - Global `ElectronAPI` in `src/types/globals.d.ts` is the source of truth for all window bridge contracts.
  - Conditional node types live in `src/types/conditions.ts` and are used by IPC and UI.

- Variables typing:
  - Automation variables are typed as `Record<string, unknown>` to allow numbers/booleans/objects.
  - Prefer parsing values (e.g., numbers/JSON) at edges and keep internal state typed.

- Lint/Format:
  - Run `pnpm format` (Biome) before committing.

