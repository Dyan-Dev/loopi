# Loopi — Local‑First Typed Automation Platform

[![License: O'Saasy](https://img.shields.io/badge/license-O%27Saasy-blue.svg)](LICENSE)

## What Is Loopi?

Loopi is the open‑source, local‑first, typed automation platform that combines real browser automation with APIs and a visual, no‑code builder. It runs on Windows, macOS, and Linux, and uses a clean TypeScript architecture with Electron BrowserWindow + webContents control and auto‑typed variables to make building reliable automations simple and transparent.

## About Loopi

- **Local‑first:** Your workflows execute on your machine—no cloud lock‑in.
- **Visual builder:** Drag‑and‑drop workflows with typed variables and clear data flow.
- **Real browser control:** Electron BrowserWindow + webContents automation.
- **API + browser:** Hybrid automation that fetches/transforms data and drives the UI.
- **Typed data:** Automatic variable typing for safer, clearer pipelines.
- **Open‑source:** Developer‑friendly TypeScript codebase and strong documentation.
- **Custom scheduling:** Interval, cron expressions, or one-time execution.

## How Loopi Is Different
- **n8n:** API‑centric; lacks real browser control for UI‑heavy tasks.
- **Zapier/Make:** Cloud‑only; not local‑first, limited privacy and offline use.
- **Playwright/Puppeteer:** Code‑first libraries; no visual builder or typed workflows.
- **Selenium IDE:** Fragile selectors; lower reliability on dynamic, complex sites.
- **RPA suites:** Closed‑source and heavy‑weight; higher cost and vendor lock‑in.

Loopi’s unique combo: a local desktop app + visual workflows + real browser control + API nodes + typed variables.

## 🎬 Demo Video

### Quick Start Demo (2 min)
[![Loopi Demo](https://img.youtube.com/vi/QLP-VOGVHBc/maxresdefault.jpg)](https://youtu.be/QLP-VOGVHBc?si=FczG6_QU04WFDJCP)

Watch how to:
- Build your first automation
- Navigate to a website
- Extract data with variables
- Compare values using conditions
- Run the automation in a real browser window

## 🚦 Getting Started

### Installation

```bash
git clone https://github.com/Dyan-Dev/loopi.git
cd loopi
pnpm install
pnpm start
```

For detailed setup instructions and your first automation, see [GETTING_STARTED.md](./docs/GETTING_STARTED.md).

### Building

```bash
pnpm run make           # Package for current platform
pnpm run publish        # Build and publish
```

## 🚀 Features

- **Visual Workflow Editor**: Drag-and-drop node graph using ReactFlow
- **Browser Automation**: Execute automation steps in real Chromium windows
- **Interactive Element Picker**: Click-to-select CSS selectors from live pages
- **Data Extraction**: Extract text from elements and store in variables for reuse
- **Variable System**: Set, modify, and substitute variables using `{{varName}}` syntax
- **Conditional Logic**: Branching flows; use condition nodes together with variables for explicit loop control
- **Custom Scheduling**: Interval-based, cron expressions, or one-time schedules
- **Import/Export**: Save and share automation workflows as JSON
- **TypeScript**: Fully typed codebase with discriminated unions for type safety

## 📦 Tech Stack

- **Electron** - Cross-platform desktop application framework
- **React** - Component-based UI with hooks
- **TypeScript** - Type-safe development
- **ReactFlow** - Interactive node graph editor
- **Tailwind CSS** + **shadcn/ui** - Modern, accessible UI components
- **Electron Forge** - Build and packaging toolchain

## 🏗 Project Structure

```
src/
├── main/                      # Electron main process
│   ├── index.ts              # Main entry point & lifecycle
│   ├── windowManager.ts      # Window creation and management
│   ├── automationExecutor.ts # Step execution engine
│   ├── selectorPicker.ts     # Interactive element picker
│   ├── desktopScheduler.ts   # Workflow scheduling
│   └── ipcHandlers.ts        # IPC communication bridge
├── components/               # React components
│   ├── AutomationBuilder.tsx # Visual workflow editor
│   ├── Dashboard.tsx         # Automation management
│   └── automationBuilder/    # Builder subcomponents
│       ├── BuilderHeader.tsx
│       ├── BuilderCanvas.tsx
│       ├── AutomationNode.tsx
│       ├── AddStepPopup.tsx
│       ├── ScheduleConfig.tsx
│       └── nodeDetails/      # Node configuration UI
│           ├── NodeDetails.tsx
│           ├── NodeHeader.tsx
│           ├── StepEditor.tsx
│           ├── ConditionEditor.tsx
│           ├── stepTypes/    # Step-specific editors
│           └── customComponents/
├── hooks/                    # Custom React hooks
│   ├── useNodeActions.ts     # Node CRUD operations
│   └── useExecution.ts       # Automation execution logic
├── types/                    # TypeScript type definitions
│   ├── steps.ts              # Automation step types (discriminated union)
│   ├── flow.ts               # ReactFlow graph types
│   ├── automation.ts         # Business domain types
│   └── index.ts              # Barrel exports
├── utils/
│   └── automationIO.ts       # Import/export utilities
├── preload.ts                # Secure IPC bridge
├── app.tsx                   # Root React component
└── renderer.ts               # Renderer process entry
```

## 🛠 Architecture

### Main Process (`src/main/`)

The Electron main process is modularized into focused services:

- **WindowManager**: Creates and manages application windows (main UI + browser)
- **AutomationExecutor**: Executes automation steps via `webContents.executeJavaScript`
- **SelectorPicker**: Injects interactive element picker into browser pages
- **IPC Handlers**: Routes messages between renderer and main process

### Renderer Process (`src/components/`)

React-based UI with component hierarchy:

- **App**: Root component managing view routing (Dashboard ↔ Builder ↔ Credentials)
- **AutomationBuilder**: Visual editor using ReactFlow for node graphs
- **Hooks**: Shared logic for node management (`useNodeActions`) and execution (`useExecution`)

### Type System (`src/types/`)

Robust type definitions with **discriminated unions** for type safety:

```typescript
// Each step type is uniquely identified by its 'type' field
type AutomationStep =
  | StepNavigate      // { type: "navigate", value: string }
  | StepClick         // { type: "click", selector: string }
  | StepType          // { type: "type", selector: string, value: string, credentialId?: string }
  | StepExtract       // { type: "extract", selector: string, storeKey?: string }
  | StepSetVariable   // { type: "setVariable", variableName: string, value: string }
  | StepModifyVariable// { type: "modifyVariable", variableName: string, operation: ModifyOp, value: string }
  | ... more variants

// TypeScript narrows types automatically:
switch (step.type) {
  case "navigate":
    // ✅ step.value is available
    break;
  case "click":
    // ✅ step.selector is available
    break;
}
```

### IPC Security

Uses **context isolation** with `contextBridge` for secure renderer ↔ main communication.

The preload API now exposes additional executor helpers (variable init / query) and conditional execution helpers:

```typescript
// preload.ts exposes limited API
contextBridge.exposeInMainWorld("electronAPI", {
  openBrowser: (url) => ipcRenderer.invoke("browser:open", url),
  runStep: (step) => ipcRenderer.invoke("browser:runStep", step),
  runConditional: (condition) => ipcRenderer.invoke("browser:runConditional", condition),
  initVariables: (vars) => ipcRenderer.invoke("executor:initVariables", vars),
  getVariables: () => ipcRenderer.invoke("executor:getVariables"),
  pickSelector: (url) => ipcRenderer.invoke("pick-selector", url),
});
```

## 🎯 Key Features

### Interactive Element Picker

Click-to-select CSS selectors from live pages - no manual typing needed.

### Variable System

Auto-typed variables with dot notation and array indexing:
- `{{username}}` - Simple variables
- `{{user.name}}` - Nested properties
- `{{users[0]}}` - Array indexing
- `{{users[0].email}}` - Mixed access

Types automatically detected: numbers, booleans, objects, and arrays.

**Learn more:** See [VARIABLES.md](./docs/VARIABLES.md)

### Graph Execution

Automation flows execute as directed graphs starting from the root node, following edges through conditional branches until completion.

## 📖 Documentation

Comprehensive documentation split into focused guides for different needs:

### 📍 **Start Here**
- **[Documentation Index](./docs/README.md)** - Overview of all docs
- **[Documentation Map](./docs/DOCUMENTATION_MAP.md)** - Navigation guide, find what you need

### For Users
- **[GETTING_STARTED.md](./docs/GETTING_STARTED.md)** - Installation and your first automation
- **[VARIABLES.md](./docs/VARIABLES.md)** - Variable system, types, and access patterns (dot notation, arrays, nesting)
- **[STEPS_REFERENCE.md](./docs/STEPS_REFERENCE.md)** - Complete step type reference with JSON examples
- **[examples/](./docs/examples/)** - Real-world automation examples

### For Developers
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design, data flows, type system, security model
- **[COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md)** - React components, hooks, and UI patterns
- **[NEW_STEP_TEMPLATE.md](./docs/NEW_STEP_TEMPLATE.md)** - Complete checklist for adding new step types
- **[DEVELOPMENT_WORKFLOWS.md](./docs/DEVELOPMENT_WORKFLOWS.md)** - Common dev tasks and troubleshooting
- **[DOCUMENTATION_GUIDE.md](./docs/DOCUMENTATION_GUIDE.md)** - How to maintain and extend documentation

### Project Info
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines and code style (Biome)

## 📚 Examples

Example automation JSON files under `docs/examples/` demonstrate common patterns:

- `contact_form_submission.json` - Form filling
- `google_search.json` - Search and navigation
- `ecommerce_price_monitor.json` - Multi-page scraping
- `api_call_github_user.json` - API calls with object access
- `api_call_newsletter_post.json` - POST requests

**To use an example:**
1. Open the builder and choose "Import"
2. Select a JSON file from `docs/examples/`
3. Inspect the automation to see patterns
4. Run it with the Run button


## 🔒 Security Notes

- **Context Isolation**: Renderer process cannot directly access Node.js/Electron APIs
- **Preload Script**: Only exposes whitelisted IPC channels via `contextBridge`
- **No Direct Node Access**: Renderer uses async IPC for all privileged operations
- **Credential Encryption**: Credentials stored with placeholder encryption (! implement real crypto for production)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Editor & Formatting Setup

This project uses **Biome** for formatting and linting.

Before committing changes, please ensure your code is formatted:

```bash
pnpm format
```

#### VS Code (Biome)

If you're using VS Code, you can enable automatic formatting and linting via Biome.

##### 1. Install the Extension
Install the official **Biome VS Code extension** from the Visual Studio Marketplace: [here](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

##### 2. Set Biome as the Default Formatter
To make Biome your default formatter:

1. Open any [supported file](https://biomejs.dev/internals/language-support) (e.g., `.ts`, `.tsx`, `.js`)
2. Open the Command Palette: *View → Command Palette* or `Ctrl/⌘ + Shift + P`
3. Select *Format Document With…*
4. Select *Configure Default Formatter*
5. Choose *Biome*

##### 3. Learn More
For advanced configuration and options, see the Biome [reference documentation](https://biomejs.dev/reference/vscode).

## Contributing & Community

- See `CONTRIBUTING.md` for contribution guidelines, coding style and PR workflow.
- Please follow the `CODE_OF_CONDUCT.md` to help keep this community welcoming.
- Security issues should be reported privately as described in `SECURITY.md`.

## 📧 Support

For support, bug reports, or questions:
- **Documentation**: [https://loopi.dyan.live/docs](https://loopi.dyan.live/docs)
- **FAQ**: [https://loopi.dyan.live/docs/faq](https://loopi.dyan.live/docs/faq)
- **Email**: support@dyan.live
- **GitHub Issues**: [Report bugs or request features](https://github.com/Dyan-Dev/loopi/issues)
- **GitHub Discussions**: [Community discussions](https://github.com/Dyan-Dev/loopi/discussions)

## 📄 License

This project is licensed under the O'Saasy License. See LICENSE for details.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps
- [ReactFlow](https://reactflow.dev/) - Node-based UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
