# Automa - Visual Browser Automation Platform

A powerful Electron-based desktop application for creating, managing, and executing browser automation workflows with a visual node-based editor.

## 🚀 Features

- **Visual Workflow Editor**: Drag-and-drop node graph using ReactFlow
- **Browser Automation**: Execute automation steps in real Chromium windows
- **Interactive Element Picker**: Click-to-select CSS selectors from live pages
- **Conditional Logic**: Branching flows; use condition nodes together with variables for explicit loop control
- **Import/Export**: Save and share automation workflows as JSON
- **Scheduling**: Manual, interval-based, or fixed-time execution
- **TypeScript**: Fully typed codebase with discriminated unions for type safety

## 📦 Tech Stack

- **Electron** - Cross-platform desktop application framework
- **React** - Component-based UI with hooks
- **TypeScript** - Type-safe development
- **ReactFlow** - Interactive node graph editor
- **Tailwind CSS** + **shadcn/ui** - Modern, accessible UI components
- **Electron Forge** - Build and packaging toolchain

## 🏗️ Project Structure

```
src/
├── main/                      # Electron main process
│   ├── index.ts              # Main entry point & lifecycle
│   ├── windowManager.ts      # Window creation and management
│   ├── automationExecutor.ts # Step execution engine
│   ├── selectorPicker.ts     # Interactive element picker
│   └── ipcHandlers.ts        # IPC communication bridge
├── components/               # React components
│   ├── AutomationBuilder.tsx # Visual workflow editor
│   ├── Dashboard.tsx         # Automation management (Edit/Export actions rendered as buttons)
│   └── automationBuilder/    # Builder subcomponents
│       ├── BuilderHeader.tsx
│       ├── BuilderCanvas.tsx
│       ├── AutomationNode.tsx
│       ├── AddStepPopup.tsx
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

## 🛠️ Architecture

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
  | StepNavigate    // { type: "navigate", value: string }
  | StepClick       // { type: "click", selector: string }
  | StepType        // { type: "type", selector: string, value: string, credentialId?: string }
  | ... 10 more variants

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

## 🎯 Key Features Explained

### Interactive Element Picker

1. User clicks "Pick Element" button in step configuration
2. Renderer sends IPC request to main process
3. Main process injects picker script into browser page
4. User hovers (highlights) and clicks element
5. Script generates unique CSS selector (e.g., `html > body > div:nth-of-type(3) > button:first-of-type`)
6. Selector sent back to renderer via IPC
7. Step configuration auto-populated

### Variable-driven loops and template substitution

The project now uses an explicit variable system instead of the legacy `loopUntilFalse` behavior.

- Add a `Set Variable` or `Modify Variable` step to declare and change variables as your flow runs.
- Use double-curly tokens `{{variableName}}` inside selectors, step inputs, and API payloads; those tokens are substituted at runtime by the executor.

Example selector using a variable:

```
Selector: .product-list > div:nth-of-type({{index}})
```

Control how `{{index}}` changes by placing `Modify Variable` steps (increment/decrement/append/set) in your graph. This makes loop semantics explicit and easier to maintain.

Conditional nodes also support post-processing of extracted text (strip currency symbols, remove non-numeric characters, regex replace, and parse-as-number) to make comparisons robust (for example, comparing `$29.99` numerically).

### Graph Execution

Automation flows are executed as directed graphs:

1. Start at root node (id="1")
2. Execute current node's step/condition
3. Follow outgoing edges to next nodes:
   - Regular nodes: 1 outgoing edge
   - Conditional nodes: 2 edges ("if" or "else" branch)
4. Recurse until no more nodes
5. Mark nodes as "running" for visual feedback

## 🚦 Getting Started

### Installation

```bash
git clone https://github.com/Dyan-Dev/automa.git
cd automa
npm install
```

### Development

```bash
npm start              # Start Electron app with hot reload
```

### Building

```bash
npm run make           # Package for current platform
npm run publish        # Build and publish (requires config)

## Examples

Example automation JSON files are included under `docs/examples/` to help you test common scenarios quickly.

- `docs/examples/pagination.json` — clicks the "Next" button on a listing page repeatedly until no next page is available and extracts titles.
- `docs/examples/variable_loop.json` — demonstrates initializing an `index` variable with `Set Variable`, extracting a row by `{{index}}`, and incrementing the index with `Modify Variable` to loop.
- `docs/examples/price_extraction.json` — extracts a price string, strips currency symbols and non-numeric characters, parses it as a number, and compares against a threshold (e.g. $50).

How to use an example:

1. Open the Automation Builder and choose _Import_ (or place the JSON into the import dialog).
2. Select one of the files under `docs/examples/` and import it into the editor.
3. Inspect nodes to see `Set Variable` / `Modify Variable` usage and condition transforms (e.g. `stripCurrency`, `parseAsNumber`).
4. Run the automation from the builder using the Run button. The executor will initialize variables and execute steps in the browser window.

Tip: Use the `Condition` node's "Post-process Extracted Text" options for robust comparisons when dealing with currency or noisy text.
```

## 📝 Adding a New Step Type

1. **Define type in `src/types/steps.ts`**:
```typescript
export interface StepCustom extends StepBase {
  type: "custom";
  customField: string;
}

export type AutomationStep = 
  | StepNavigate
  | StepClick
  | ...
  | StepCustom;  // Add to union
```

2. **Create editor in `src/components/automationBuilder/nodeDetails/stepTypes/`**:
```typescript
export function CustomStep({ step, id, onUpdate }: StepProps) {
  return (
    <div>
      <Label>Custom Field</Label>
      <Input
        value={step.customField}
        onChange={(e) => onUpdate(id, "update", { 
          step: { ...step, customField: e.target.value } 
        })}
      />
    </div>
  );
}
```

3. **Add execution logic in `src/main/automationExecutor.ts`**:
```typescript
case "custom": {
  // Use the executor's substitution helper to resolve any `{{var}}` tokens
  const value = this.substituteVariables(step.customField);
  await wc.executeJavaScript(`console.log(${JSON.stringify(value)});`);
  break;
}
```

4. **Update `useNodeActions.ts`** to provide default initial values when creating new nodes.

## 🔒 Security Notes

- **Context Isolation**: Renderer process cannot directly access Node.js/Electron APIs
- **Preload Script**: Only exposes whitelisted IPC channels via `contextBridge`
- **No Direct Node Access**: Renderer uses async IPC for all privileged operations
- **Credential Encryption**: Credentials stored with placeholder encryption (⚠️ implement real crypto for production)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Contributing & Community

- See `CONTRIBUTING.md` for contribution guidelines, coding style and PR workflow.
- Please follow the `CODE_OF_CONDUCT.md` to help keep this community welcoming.
- Security issues should be reported privately as described in `SECURITY.md`.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps
- [ReactFlow](https://reactflow.dev/) - Node-based UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
