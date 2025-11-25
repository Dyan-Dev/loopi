# Architecture Documentation

## Overview

Automa is built on Electron's multi-process architecture with a clear separation between main process (Node.js) and renderer process (React/browser). This document explains the design decisions and data flow patterns.

## Process Architecture

### Main Process (`src/main/`)

The main process runs Node.js and manages the application lifecycle. It's organized into modular services:

#### WindowManager
- **Purpose**: Centralized window lifecycle management
- **Responsibilities**:
  - Create main application window
  - Create browser automation window (on-demand)
  - Manage window references and cleanup
  - Configure security settings (preload scripts, context isolation)

#### AutomationExecutor
- **Purpose**: Execute automation steps in browser windows
- **Key Methods**:
  - `executeStep(browserWindow, step)`: Runs a single step
  - `evaluateConditional(browserWindow, config)`: Evaluates branching logic
  - `injectIndexIntoSelector(selector, index)`: Template variable substitution
- **State Management**:
  - Maintains `loopIndices` map for tracking loop iteration state per conditional node
  - Stores `currentNodeId` for coordinating selector injection

#### SelectorPicker
- **Purpose**: Interactive element selection from live pages
- **Flow**:
  1. Injects navigation bar for URL changes
  2. Injects picker UI (hover highlights, click capture)
  3. Generates unique CSS selectors using structural paths
  4. Handles special cases (select elements → extract option data)
  5. Returns selector via IPC promise
- **Selector Generation Strategy**:
  - Prefers structural selectors (`tag:nth-of-type(n)`)
  - Builds full path from `html` root
  - Ensures uniqueness at each level

#### IPC Handlers
- **Purpose**: Route IPC messages to appropriate services
- **Registered Channels**:
  - `browser:open`, `browser:close` → WindowManager
  - `browser:runStep`, `browser:runConditional` → AutomationExecutor
  - `pick-selector` → SelectorPicker
  - `browser:closed` event → Main window notification

### Renderer Process (`src/`)

React-based UI running in Chromium with restricted privileges.

#### Component Hierarchy

```
App (root)
├── Dashboard
│   └── Automation list & management
├── CredentialVault
│   └── Secure credential storage
└── AutomationBuilder
    ├── BuilderHeader
    │   ├── Settings dialog (name, description, schedule)
    │   └── Execution controls (run, pause, stop)
    ├── BuilderCanvas (ReactFlow)
    │   ├── AutomationNode (visual representation)
    │   ├── AddStepPopup (step type picker)
    │   └── NodeDetails
    │       ├── NodeHeader (title + delete)
    │       ├── StepEditor (routes to step-specific forms)
    │       └── ConditionEditor (branching config)
    └── Hooks
        ├── useNodeActions (node CRUD, edge validation)
        └── useExecution (automation orchestration)
```

#### Custom Hooks

**useNodeActions**
- Manages node/edge operations in the graph
- Enforces edge constraints:
  - Regular nodes: max 1 outgoing edge
  - Conditional nodes: max 2 (if/else branches)
  - Root node (id="1"): cannot be deleted
- Creates type-specific initial step values via discriminated union switch

**useExecution**
- Orchestrates automation execution
- Implements recursive graph traversal:
  ```typescript
  executeGraph(nodeId) {
    visit node
    execute step/condition
    determine next nodes (based on edges + branch result)
    recurse for each next node
  }
  ```
- Manages visual feedback (nodeRunning state)
- Handles browser lifecycle (auto-open if needed)

## Data Flow Patterns

### Node Editing Flow

```
User edits field in NodeDetails
  ↓
onUpdate(nodeId, "update", { step: { ...step, field: newValue } })
  ↓
useNodeActions.handleNodeAction
  ↓
setNodes((nodes) => nodes.map(n => n.id === nodeId ? { ...n, data: updates } : n))
  ↓
ReactFlow re-renders updated node
```

### Selector Picking Flow

```
1. User clicks "Pick Element" button
   ↓
2. NodeDetails.handlePickSelector()
   ↓
3. window.electronAPI.pickSelector(recentUrl)  [IPC invoke]
   ↓
4. Main: ipcHandlers → SelectorPicker.pickSelector()
   ↓
5. Open/focus browser window, inject picker script
   ↓
6. User hovers (highlight) + clicks element
   ↓
7. Injected script generates CSS selector
   ↓
8. window.electronAPI.sendSelector(selector)  [IPC send]
   ↓
9. Main: receive "selector-picked", resolve promise
   ↓
10. Renderer: receives selector, updates step data
```

### Automation Execution Flow

```
1. User clicks "Run Automation"
   ↓
2. useExecution.runAutomation()
   ↓
3. Open browser if not already open
   ↓
4. executeGraph("1")  // Start at root node
   ↓
5. For each node:
   - Mark as running (visual feedback)
   - If step: window.electronAPI.runStep(step)
     → Main: AutomationExecutor.executeStep()
     → webContents.executeJavaScript(...)
   - If conditional: window.electronAPI.runConditional(config)
     → Main: AutomationExecutor.evaluateConditional()
     → Check condition, return boolean + loop state
   - Determine next nodes from edges
   - Recurse
   ↓
6. Complete: reset state, show success message
```

## Type System Design

### Discriminated Unions

All step types are modeled as a discriminated union with `type` as the discriminant:

```typescript
type AutomationStep = 
  | { type: "navigate"; id: string; description: string; value: string }
  | { type: "click"; id: string; description: string; selector: string }
  | { type: "type"; id: string; description: string; selector: string; value: string; credentialId?: string }
  | ...

// TypeScript narrows automatically based on type field
function execute(step: AutomationStep) {
  switch (step.type) {
    case "navigate":
      // step.value is known to exist
      return loadURL(step.value);
    case "click":
      // step.selector is known to exist
      return click(step.selector);
  }
}
```

**Benefits**:
- Compile-time exhaustiveness checking
- Prevents accessing fields that don't exist on a variant
- Self-documenting via type definitions

### Schedule Type

Similarly, schedules use discriminated unions:

```typescript
type Schedule =
  | { type: "manual" }
  | { type: "interval"; interval: number; unit: "minutes" | "hours" | "days" }
  | { type: "fixed"; value: string }  // "HH:MM" format
```

This prevents bugs like accessing `schedule.interval` when `schedule.type === "fixed"`.

## Security Model

### Context Isolation

Renderer process runs with:
```javascript
webPreferences: {
  contextIsolation: true,    // Isolate renderer from preload
  nodeIntegration: false,    // No direct Node.js access
  preload: PRELOAD_PATH      // Only bridge via preload
}
```

### IPC Surface

Preload script exposes minimal API via `contextBridge`:

```typescript
// ✅ Allowed: Renderer can invoke these IPC channels
electronAPI.openBrowser(url)
electronAPI.runStep(step)
electronAPI.pickSelector(url)

// ❌ Blocked: Renderer cannot access
require('fs')
require('child_process')
ipcRenderer.send('arbitrary-channel')
```

### Browser Window Security

Automation browser windows use same preload + context isolation to allow navigation bar script access to controlled IPC for URL loading.

## State Management

### React State Organization

- **App-level state**: `automations[]`, `credentials[]`, `currentView`
- **Builder-level state**: `nodes[]`, `edges[]`, `selectedNodeId`, `schedule`
- **Execution state**: `isBrowserOpen`, `isAutomationRunning`, `currentNodeId`

No global state library (Redux, Zustand) needed—props drilling is minimal due to focused component hierarchy.

### Main Process State

- WindowManager: `mainWindow`, `browserWindow` references
- AutomationExecutor: `loopIndices`, `currentNodeId` for loop coordination

## Performance Considerations

### ReactFlow Optimization

- Uses `useNodesState` and `useEdgesState` for memoized updates
- Node types registered once at module level
- Callbacks wrapped in `useCallback` to prevent re-renders

### IPC Patterns

- Uses `invoke`/`handle` for request-response (promises)
- Uses `send`/`on` for one-way events (`browser:closed`)
- Avoids sending large data structures; passes IDs and fetch on demand

### Browser Automation

- Steps execute sequentially with `await` to ensure order
- Each step completes before moving to next (no parallelization within flow)
- Visual feedback (500ms delay) between steps for debugging

## Extension Points

### Adding New Step Types

1. Define type in `src/types/steps.ts`
2. Add to `AutomationStep` union
3. Create editor component in `stepTypes/`
4. Add execution case in `AutomationExecutor.executeStep()`
5. Add initial value in `useNodeActions` switch
6. Add to `stepTypes` UI metadata array

### Custom Conditional Types

1. Add to `ConditionType` union in `flow.ts`
2. Update `ConditionEditor` UI
3. Implement logic in `AutomationExecutor.evaluateConditional()`

### IPC Channels

1. Add handler in `ipcHandlers.ts`
2. Expose method in `preload.ts`
3. Invoke from renderer via `window.electronAPI.*`

## Testing Strategy

### Unit Tests (Recommended)

- **Utilities**: `automationIO.ts` (import/export validation)
- **Hooks**: `useNodeActions`, `useExecution` (with mock IPC)
- **Main Services**: `AutomationExecutor`, `SelectorPicker` (with mock BrowserWindow)

### Integration Tests

- End-to-end flow: Create automation → Save → Load → Execute
- Selector picker: Inject → Highlight → Click → Receive selector
- Import/Export: Round-trip JSON serialization

### Manual Testing Checklist

- [ ] Create new automation with multiple step types
- [ ] Add conditional node with if/else branches
- [ ] Test loopUntilFalse with dynamic index
- [ ] Pick selectors from live page
- [ ] Execute automation and verify steps
- [ ] Import/export workflows
- [ ] Schedule configuration (all types)

## Known Limitations

1. **Loop State Persistence**: Loop indices reset on app restart
2. **Credential Encryption**: Placeholder implementation (use `electron-store` + crypto for production)
3. **Error Recovery**: Limited retry logic in automation execution
4. **Concurrency**: One automation runs at a time
5. **Step Validation**: Minimal validation before execution (e.g., invalid selectors)

## Future Improvements

- [ ] Persistent execution logs with screenshots
- [ ] Subflow/reusable component support
- [ ] Variable system for passing data between steps
- [ ] Headless execution mode (no browser UI)
- [ ] Cloud sync for workflows
- [ ] Collaborative editing
- [ ] Plugin system for custom step types
- [ ] Advanced scheduling (cron expressions)
