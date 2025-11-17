# automa
A visual automation builder that lets you create, schedule, and run automations with secure credential management

## Features

- Electron for building cross-platform desktop applications
- React for creating scalable, component-based UIs
- TypeScript for strongly-typed and maintainable JavaScript code
- Tailwind CSS for utility-first styling and rapid UI development
- Electron Forge for simple packaging and publishing of Electron applications

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Dyan-Dev/automa.git
```

Navigate to the project folder:

```bash
cd automa
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm start
```

## Editor & Formatting Setup

This project uses **Biome** for formatting and linting.

Before committing changes, please ensure your code is formatted:

```bash
pnpm format
```

### VS Code (Biome)

If you're using VS Code, you can enable automatic formatting and linting via Biome.

#### 1. Install the Extension
Install the official **Biome VS Code extension** from the Visual Studio Marketplace: [here](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

#### 2. Set Biome as the Default Formatter
To make Biome your default formatter:

1. Open any [supported file](https://biomejs.dev/internals/language-support) (e.g., `.ts`, `.tsx`, `.js`)
2. Open the Command Palette: *View → Command Palette* or `Ctrl/⌘ + Shift + P`
3. Select *Format Document With…*
4. Select *Configure Default Formatter*
5. Choose *Biome*

#### 3. Learn More
For advanced configuration and options, see the Biome [reference documentation](https://biomejs.dev/reference/vscode).

## Package the Project

Package the project as an Electron app:

```bash
pnpm run make
```

## Contributing

Before committing any changes, please ensure your code is formatted:

```bash
pnpm format
```

This ensures consistency across the project and avoids unnecessary diffs.
