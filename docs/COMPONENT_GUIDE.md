## Component Documentation

Detailed guide for understanding and extending React components in Loopi.

### Component Hierarchy

```
App (src/app.tsx)
├── Router → Dashboard | AutomationBuilder | Credentials
│
├── Dashboard (src/components/Dashboard.tsx)
│   └── Lists all automations
│   └── Edit/Delete/Export actions
│
└── AutomationBuilder (src/components/AutomationBuilder.tsx)
    ├── BuilderHeader
    │   ├── Title & Description
    │   ├── Run/Stop buttons
    │   └── Settings dialog
    │
    ├── BuilderCanvas (ReactFlow)
    │   ├── AutomationNode (visual node)
    │   ├── AddStepPopup (step type picker)
    │   └── Edge connections
    │
    └── NodeDetails (right sidebar)
        ├── NodeHeader (title + delete)
        │
        ├── StepEditor (routes to specific step editor)
        │   ├── ClickStep (src/components/.../stepTypes/ClickStep.tsx)
        │   ├── TypeStep
        │   ├── ExtractStep
        │   ├── ApiCallStep
        │   ├── NavigateStep
        │   ├── SetVariableStep
        │   ├── ModifyVariableStep
        │   └── ... other steps
        │
        └── ConditionEditor (if conditional node)
            ├── Element existence conditions
            ├── Value comparison conditions
            └── Post-processing options
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

List and manage automations.

**Props:**
```typescript
interface DashboardProps {
  automations: Automation[];
  onEdit: (automation: Automation) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}
```

**Features:**
- List all automations
- Edit button → open in builder
- Delete button → confirm and remove
- New Automation button → create new

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

