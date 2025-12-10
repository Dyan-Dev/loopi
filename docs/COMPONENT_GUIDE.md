## Component Documentation

Detailed guide for understanding and extending React components in Loopi.

### Component Hierarchy

```
App (src/app.tsx)
├── Router → Dashboard | AutomationBuilder | Settings
│
├── Dashboard (src/components/Dashboard.tsx)
│   ├── Tabs: "Your Automations" | "Examples"
│   │
│   ├── YourAutomations (src/components/dashboard/YourAutomations.tsx)
│   │   └── Lists user's automations
│   │   └── Edit/Delete/Export actions
│   │
│   └── Examples (src/components/dashboard/Examples.tsx)
│       └── Lists 7 example automations
│       └── "Load Example" button for each
│
├── AutomationBuilder (src/components/AutomationBuilder.tsx)
│   ├── BuilderHeader
│   │   ├── Title & Description
│   │   ├── Run/Stop buttons
│   │   └── Settings dialog
│   │
│   ├── BuilderCanvas (ReactFlow)
│   │   ├── AutomationNode (visual node)
│   │   ├── AddStepPopup (step type picker)
│   │   └── Edge connections
│   │
│   └── NodeDetails (right sidebar)
│       ├── NodeHeader (title + delete)
│       │
│       ├── StepEditor (routes to specific step editor)
│       │   ├── ClickStep (src/components/.../stepTypes/ClickStep.tsx)
│       │   ├── TypeStep
│       │   ├── ExtractStep
│       │   ├── ApiCallStep
│       │   ├── NavigateStep
│       │   ├── SetVariableStep
│       │   ├── ModifyVariableStep
│       │   └── ... other steps
│       │
│       └── ConditionEditor (if conditional node)
│           ├── Element existence conditions
│           ├── Value comparison conditions
│           └── Post-processing options
│
└── Settings (src/components/Settings.tsx)
    ├── Appearance (Theme selector: Light, Dark, System)
    ├── Downloads (Download path configuration with folder picker)
    ├── Notifications (Enable/Disable toggle)
    └── About (App info and GitHub link)
```

### Key Components

#### App.tsx (src/app.tsx)

Root component handling app-level state and routing.

**Responsibilities:**
- Manage automations list
- Manage credentials
- Route between views (Dashboard, Builder, Credentials)
- Handle app lifecycle

**State:**
```typescript
const [automations, setAutomations] = useState<Automation[]>([]);
const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>();
const [currentAutomation, setCurrentAutomation] = useState<Automation>();
```

#### Dashboard.tsx (src/components/Dashboard.tsx)

Container component managing automation list and examples with tab navigation.

**Props:**
```typescript
interface DashboardProps {
  automations: StoredAutomation[];
  onCreateAutomation: () => void;
  onEditAutomation: (automation: StoredAutomation) => void;
  onUpdateAutomations: (automations: StoredAutomation[]) => void;
}
```

**Features:**
- Two-tab interface: "Your Automations" and "Examples"
- Import automation from JSON file
- Load example automations from `docs/examples/` folder (via IPC)
- Delete automation with file system cleanup (via IPC)
- Switches to "Your Automations" tab after import/load

**Key Methods:**
- `handleImportAutomation()` - Import automation JSON file
- `handleLoadExample(example)` - Load example via `tree.loadExample()` IPC
- `handleDeleteAutomation(automationId)` - Delete via `tree.delete()` IPC, removes file from disk

#### YourAutomations.tsx (src/components/dashboard/YourAutomations.tsx)

Tab component displaying user's saved automations.

**Props:**
```typescript
interface YourAutomationsProps {
  automations: StoredAutomation[];
  totalAutomations: number;
  onEditAutomation: (automation: StoredAutomation) => void;
  onDeleteAutomation: (automationId: string) => Promise<void>;
}
```

**Features:**
- Card-based grid layout
- Shows automation name, description, last update time
- Edit button → open in builder
- Delete button (Trash2 icon) → confirmation dialog → IPC delete
- Empty state when no automations exist

**Key Methods:**
- `handleDelete(automationId)` - Shows confirmation dialog, calls async delete callback

#### Examples.tsx (src/components/dashboard/Examples.tsx)

Tab component displaying example automations for user learning.

**Props:**
```typescript
interface ExamplesProps {
  automations: StoredAutomation[];
  onLoadExample: (example) => Promise<void>;
}
```

**Features:**
- Grid layout with 7 curated example automations
- Examples: Google Search, Contact Form, E-commerce Price Monitor, GitHub API, Hacker News, Multi-Page Scraper, Pagination Loop
- "Load Example" button for each example
- Creates new automation from example data
- Hover shadow effect for interactivity

**Example Data Source:**
- Loaded from `docs/examples/*.json` via IPC handler `loopi:loadExample`
- Files read by main process for security (no direct renderer file access)

#### AutomationBuilder.tsx (src/components/AutomationBuilder.tsx)

Main editor interface with ReactFlow canvas.

**Props:**
```typescript
interface AutomationBuilderProps {
  automation: Automation;
  onSave: (automation: Automation) => void;
  onRunComplete: () => void;
}
```

**Key State:**
```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
const [isRunning, setIsRunning] = useState(false);
const [isBrowserOpen, setIsBrowserOpen] = useState(false);
```

**Sub-components:**
- **BuilderHeader** - Controls and settings
- **BuilderCanvas** - ReactFlow graph editor
- **NodeDetails** - Right sidebar for node editing

#### BuilderCanvas (src/components/automationBuilder/BuilderCanvas.tsx)

ReactFlow-based visual editor.

**Features:**
- Drag-and-drop nodes
- Connect edges
- Delete nodes
- Select nodes
- Add step popup

**ReactFlow Configuration:**
```typescript
<ReactFlow nodes={nodes} edges={edges}>
  <Controls />
  <Background />
  <MiniMap />
  <Panel position="bottom-left">
    <AddStepPopup onAddStep={handleAddStep} />
  </Panel>
</ReactFlow>
```

#### NodeDetails (src/components/automationBuilder/nodeDetails/)

Right sidebar for editing selected node.

**Structure:**
```
NodeDetails/
├── NodeDetails.tsx (main container)
├── NodeHeader.tsx (title + delete button)
├── StepEditor.tsx (routes to step-specific editor)
├── ConditionEditor.tsx (for conditional nodes)
├── stepTypes/ (step-specific editors)
│   ├── ClickStep.tsx
│   ├── TypeStep.tsx
│   ├── ExtractStep.tsx
│   ├── ApiCallStep.tsx
│   ├── NavigateStep.tsx
│   ├── SetVariableStep.tsx
│   ├── ModifyVariableStep.tsx
│   ├── index.ts (exports all)
│   └── types.ts (StepProps interface)
└── customComponents/ (reusable UI)
    └── SelectorButton.tsx (pick element)
```

**NodeDetails.tsx:**
```typescript
interface NodeDetailsProps {
  node: Node;
  onUpdate: (nodeId, action, data) => void;
  onPickWithSetter: (callback) => void;
}
```

**Key Functions:**
- Renders title/description field
- Routes to StepEditor or ConditionEditor based on node type
- Calls `onUpdate` when step changes

#### StepEditor.tsx (src/components/automationBuilder/nodeDetails/StepEditor.tsx)

Router component that renders the appropriate step-specific editor.

**Implementation:**
```typescript
function StepEditor({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  switch (step.type) {
    case "click":
      return <ClickStep {...props} />;
    case "type":
      return <TypeStep {...props} />;
    case "extract":
      return <ExtractStep {...props} />;
    // ... more cases
    default:
      return <div>Unknown step type</div>;
  }
}
```

**Adding a new step:**
1. Create `src/components/.../stepTypes/YourStep.tsx`
2. Add to `index.ts` exports
3. Add case in `StepEditor.tsx` switch

#### Example Step Component: ClickStep.tsx

```typescript
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SelectorButton } from "../customComponents";
import { StepProps } from "./types";

export function ClickStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  // Type guard
  if (step.type !== "click") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Selector</Label>
        <Input
          value={step.selector || ""}
          onChange={(e) => onUpdate(id, "update", {
            step: { ...step, selector: e.target.value }
          })}
          placeholder="e.g., button.submit"
          className="text-xs"
        />
      </div>

      <SelectorButton
        onSelect={(selector) =>
          onUpdate(id, "update", {
            step: { ...step, selector }
          })
        }
      />
    </div>
  );
}
```

**Pattern for all step editors:**
1. Type guard: `if (step.type !== "stepType") return null;`
2. Read current values from `step` props
3. On change, call `onUpdate(id, "update", { step: { ...step, field: newValue } })`
4. Return UI elements

### Custom Hooks

#### useNodeActions (src/hooks/useNodeActions.ts)

Manages CRUD operations on nodes and edges.

**Key Functions:**
```typescript
const handleNodeAction = (nodeId, action, data) => {
  // action: "add", "update", "delete"
  // Validates constraints (root node, edge limits)
  // Updates setNodes/setEdges
};

const getInitialStepData = (stepType) => {
  // Returns default values for each step type
};

const validateEdgeConnection = (source, target) => {
  // Ensures edge constraints are met
  // Regular nodes: 1 outgoing
  // Conditionals: 2 outgoing (if/else)
};
```

#### useExecution (src/hooks/useExecution.ts)

Orchestrates automation execution.

**Key Functions:**
```typescript
const runAutomation = async () => {
  // 1. Open browser if needed
  // 2. Start graph traversal from root (id="1")
  // 3. For each node:
  //    - Execute step or evaluate condition
  //    - Determine next node(s)
  //    - Mark as running visually
  // 4. Handle completion/errors
};

const executeGraph = async (nodeId) => {
  // Recursive depth-first traversal
  // Executes node's step/condition
  // Follows outgoing edges
  // Returns to parent
};
```

## Storage & Backend

### TreeStore (src/main/treeStore.ts)

File system layer for automation persistence.

**Key Functions:**
```typescript
// List all saved automations
listAutomations(folder: string): StoredAutomation[]

// Load specific automation by ID
loadAutomation(id: string, folder: string): StoredAutomation | null

// Save/update automation to disk
saveAutomation(automation: StoredAutomation, folder: string): string

// Delete automation file permanently
deleteAutomation(id: string, folder: string): boolean

// Load example from docs/examples folder
loadExample(fileName: string): StoredAutomation
```

**Storage Location:**
- User automations: `~/.config/[AppName]/.trees/tree_[automationId].json`
- Examples (read-only): `docs/examples/*.json`
- File format: JSON with StoredAutomation schema

**Example:**
```typescript
{
  "id": "1734000000000",
  "name": "Google Search Automation",
  "description": "Search Google and take screenshot",
  "createdAt": "2024-12-12 10:00:00",
  "updatedAt": "2024-12-12 10:30:00",
  "flow": { nodes: [...], edges: [...] }
}
```

### IPC Bridge (src/preload.ts)

Exposes secure API to renderer process.

**Available Methods:**
```typescript
window.electronAPI.tree = {
  list(): Promise<StoredAutomation[]>
  load(): Promise<StoredAutomation | null>
  save(automation: StoredAutomation): Promise<string>
  loadExample(fileName: string): Promise<StoredAutomation>
  delete(automationId: string): Promise<boolean>
}
```

**Security Model:**
- Renderer cannot access filesystem directly
- All file I/O routed through main process
- Context isolation prevents direct Node.js access
- Preload script acts as secure gateway

### IPC Handlers (src/main/ipcHandlers.ts)

Routes IPC messages to appropriate services.

**Automation Handlers:**
- `loopi:listTrees` → TreeStore.listAutomations()
- `loopi:loadTrees` → TreeStore.loadAutomation()
- `loopi:saveTree` → TreeStore.saveAutomation()
- `loopi:loadExample` → TreeStore.loadExample()
- `loopi:deleteTree` → TreeStore.deleteAutomation()

**Settings Handlers:**
- `loopi:loadSettings` → SettingsStore.loadSettings() - Retrieves saved app settings
- `loopi:saveSettings` → SettingsStore.saveSettings() - Persists settings and re-setup download handler

**File Dialog Handlers:**
- `dialog:selectFolder` → electron.dialog.showOpenDialog() - Opens native folder picker

**Type Definitions (src/types/globals.d.ts):**
```typescript
interface ElectronAPI {
  tree: {
    list: () => Promise<StoredAutomation[]>;
    load: () => Promise<StoredAutomation | null>;
    save: (automation: StoredAutomation) => Promise<string>;
    loadExample: (fileName: string) => Promise<StoredAutomation>;
    delete: (automationId: string) => Promise<boolean>;
  };
  settings: {
    load: () => Promise<AppSettings>;
    save: (settings: AppSettings) => Promise<void>;
  };
  selectFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### Settings Component (src/components/Settings.tsx)

App-wide preferences and configuration interface.

**Purpose:**
Allows users to customize theme, manage download location, and configure notifications. All settings persist to disk via Electron storage and apply immediately without a save button.

**Features:**
- **Theme Selection**: Light, Dark, or System preference
  - Stores selection in `~/.config/[AppName]/settings.json`
  - Applies theme by toggling `dark` class on document root
  - Respects system preference when "System" mode selected
  - No page flicker: theme loads synchronously from storage before render
  
- **Download Path Configuration**: Custom download location
  - Folder picker via native file dialog
  - Stores full path in settings
  - Auto-creates directory if doesn't exist
  - Used by DownloadManager when processing downloads
  
- **Notifications Toggle**: Enable/disable app notifications
  - Stores preference in settings
  - Can be extended for toast notification control
  
- **About Section**: App info and links
  - GitHub repository link
  - App version and description

**Implementation:**
```typescript
export function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: "light",
    enableNotifications: true,
  });

  // Load settings on mount
  useEffect(() => {
    window.electronAPI.settings.load().then(setSettings);
  }, []);

  // Auto-save on change
  useEffect(() => {
    window.electronAPI.settings.save(settings);
  }, [settings]);

  // Theme application
  useEffect(() => {
    if (settings.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
    }
  }, [settings.theme]);

  const handleSelectFolder = async () => {
    const path = await window.electronAPI.selectFolder();
    if (path) {
      setSettings(prev => ({ ...prev, downloadPath: path }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Theme Section */}
      <div className="space-y-2">
        <Label>Theme</Label>
        <Select value={settings.theme} onValueChange={...}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Download Path Section */}
      <div className="space-y-2">
        <Label>Download Location</Label>
        <div className="flex gap-2">
          <Input 
            value={settings.downloadPath || ""}
            readOnly
            className="text-xs"
          />
          <Button onClick={handleSelectFolder} variant="outline">
            Browse
          </Button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="flex items-center justify-between">
        <Label>Enable Notifications</Label>
        <Switch 
          checked={settings.enableNotifications}
          onCheckedChange={...}
        />
      </div>
    </div>
  );
}
```

**Type Definition (src/types/globals.d.ts):**
```typescript
interface AppSettings {
  theme: "light" | "dark" | "system";
  enableNotifications: boolean;
  downloadPath?: string;
}

interface ElectronAPI {
  settings: {
    load: () => Promise<AppSettings>;
    save: (settings: AppSettings) => Promise<void>;
  };
  selectFolder: () => Promise<string | null>;
  // ... other APIs
}
```

**Backend Integration:**
- Loads from `SettingsStore` (src/main/settingsStore.ts)
- Saves to disk via IPC handler `loopi:saveSettings`
- Load handler: `loopi:loadSettings`
- Folder picker handler: `dialog:selectFolder`
- Download handler re-setup after settings save

**Dark Theme System:**
The dark theme uses CSS class toggling and Tailwind's dark mode:
```css
.dark .react-flow {
  background: #1f2937;
}

.dark .react-flow__controls {
  background: #111827;
  color: #f3f4f6;
}
```

Tailwind classes automatically respect `.dark` class:
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### UI Component Patterns

#### Form Fields

Use shadcn/ui components:

```typescript
// Text input
<Input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="hint..."
/>

// Label
<Label className="text-xs">Field Name</Label>

// Dropdown
<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Option 1</SelectItem>
  </SelectContent>
</Select>

// Textarea
<Textarea 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Checkbox
<Checkbox 
  checked={checked}
  onCheckedChange={setChecked}
/>
```

#### Layout Classes

Tailwind CSS spacing and layout:

```typescript
// Container with padding
<div className="p-4 space-y-3">

// Label + input group
<div className="space-y-2">
  <Label>Label</Label>
  <Input />
</div>

// Side-by-side (two columns)
<div className="grid grid-cols-2 gap-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Text size
<p className="text-xs">Small text</p>
<p className="text-sm">Regular text</p>
<p className="text-base">Larger text</p>
```

### Adding a New Component

**When to create a new component:**
- Reusable across multiple places
- Complex logic worth separating
- Significant UI section

**Structure:**
1. Create file in appropriate folder
2. Define props interface
3. Implement component
4. Export from parent's `index.ts` if applicable
5. Add to parent component imports

**Example:**
```typescript
// src/components/MyNewComponent.tsx
import { FC } from "react";

interface MyNewComponentProps {
  title: string;
  onAction: () => void;
}

export const MyNewComponent: FC<MyNewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4">
      <h3>{title}</h3>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Common Props Patterns

**Update handler:**
```typescript
onUpdate: (nodeId: string, action: "add" | "update" | "delete", data: any) => void
```

**Callback:**
```typescript
onSelect: (value: string) => void
onSave: () => Promise<void>
onCancel: () => void
```

**Data:**
```typescript
step: AutomationStep
node: Node
automation: Automation
```

### Testing Components

**Unit test pattern:**
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ClickStep } from "./ClickStep";

test("renders selector input", () => {
  const { getByPlaceholderText } = render(
    <ClickStep 
      step={{ type: "click", selector: "" }}
      id="1"
      onUpdate={jest.fn()}
    />
  );
  expect(getByPlaceholderText("e.g., button.submit")).toBeInTheDocument();
});
```

