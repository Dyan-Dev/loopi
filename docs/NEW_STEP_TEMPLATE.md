## Template: Adding a New Step Type

Complete checklist and examples for adding a new automation step type to Loopi.

### Quick Checklist

- [ ] Step name and type defined
- [ ] Type definition added to `src/types/steps.ts`
- [ ] UI metadata added to `stepTypes` array
- [ ] Editor component created in `src/components/.../stepTypes/`
- [ ] Executor logic added to `src/main/automationExecutor.ts`
- [ ] Initial values added to `src/hooks/useNodeActions.ts`
- [ ] Exported from `stepTypes/index.ts` and added to `StepEditor.tsx`
- [ ] STEPS_REFERENCE.md documentation added
- [ ] Example JSON created in `docs/examples/`
- [ ] ARCHITECTURE.md updated (if complex logic)

---

## Step-by-Step Implementation

### 1. Define Type in `src/types/steps.ts`

Add to the file following the existing pattern:

```typescript
// Add interface
export interface Step{YourStepName} extends StepBase {
  type: "{yourStepType}";
  field1: string;
  field2?: number;  // Optional
  field3: "option1" | "option2";  // Enum-like
}

// Add to AutomationStep union
export type AutomationStep =
  | StepNavigate
  | StepClick
  | Step{YourStepName}  // Add here
  | ... other steps;

// Add to UI metadata
export const stepTypes = [
  // ... existing
  {
    value: "{yourStepType}",
    label: "Your Step Name",
    icon: IconComponent,
    description: "What this step does"
  },
] as const;
```

**Example: Extract step**
```typescript
export interface StepExtract extends StepBase {
  type: "extract";
  selector: string;
  storeKey?: string;
}
```

---

### 2. Create Editor Component

File: `src/components/automationBuilder/nodeDetails/stepTypes/YourStep.tsx`

```typescript
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { StepProps } from "./types";

export function YourStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  // Type guard - return null if wrong step type
  if (step.type !== "yourStepType") return null;

  return (
    <div className="space-y-3">
      {/* Field 1: Text Input */}
      <div className="space-y-2">
        <Label className="text-xs">Field Label</Label>
        <Input
          value={step.field1 || ""}
          onChange={(e) => onUpdate(id, "update", {
            step: { ...step, field1: e.target.value }
          })}
          placeholder="Enter value"
          className="text-xs"
        />
      </div>

      {/* Field 2: Dropdown */}
      <div className="space-y-2">
        <Label className="text-xs">Option Field</Label>
        <Select value={step.field3 || ""} onValueChange={(val) =>
          onUpdate(id, "update", {
            step: { ...step, field3: val as "option1" | "option2" }
          })
        }>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Optional: Selector Picker Button */}
      <SelectorButton
        onSelect={(selector) =>
          onUpdate(id, "update", {
            step: { ...step, field1: selector }
          })
        }
      />
    </div>
  );
}
```

**Reference implementations:**
- Simple: `ClickStep.tsx` (just selector)
- Complex: `TypeStep.tsx` (selector + text + optional fields)
- With picker: `ExtractStep.tsx` (use `onPickWithSetter`)

---

### 3. Export Component

File: `src/components/automationBuilder/nodeDetails/stepTypes/index.ts`

```typescript
export { YourStep } from "./YourStep";
export { ClickStep } from "./ClickStep";
// ... others
```

---

### 4. Add to StepEditor

File: `src/components/automationBuilder/nodeDetails/StepEditor.tsx`

In the switch statement:

```typescript
case "yourStepType":
  return (
    <YourStep
      step={step}
      id={id}
      onUpdate={onUpdate}
      onPickWithSetter={onPickWithSetter}
    />
  );
```

Import at top:
```typescript
import { YourStep } from "./stepTypes";
```

---

### 5. Add Execution Logic

File: `src/main/automationExecutor.ts`

In `executeStep()` method:

```typescript
case "yourStepType": {
  const field1 = this.substituteVariables(step.field1);
  
  // Your execution logic here
  const result = await performAction(field1, step.field3);
  
  // Store results if needed
  if (step.storeKey) {
    this.variables[step.storeKey] = result;
  }
  break;
}
```

**Common patterns:**

```typescript
// Execute JavaScript in browser
await webContents.executeJavaScript(`
  // Your JS code here
`);

// Wait for user action
await this.wait(1000);

// Get element value
const value = await webContents.executeJavaScript(`
  document.querySelector('${selector}').value
`);

// Store variable (auto-typed)
this.variables[storeKey] = this.parseValue(value);
```

---

### 6. Add Initial Values

File: `src/hooks/useNodeActions.ts`

In `getInitialStepData()` switch:

```typescript
case "yourStepType":
  return {
    type: "yourStepType",
    description: "",
    field1: "",
    field2: 0,
    field3: "option1"
  };
```

Make sure all required fields have defaults.

---

### 7. Update Documentation

File: `docs/STEPS_REFERENCE.md`

Add to "Step Types Reference" section:

```markdown
#### Your Step Name
Brief description of what the step does.

```json
{
  "type": "yourStepType",
  "field1": "value",
  "field3": "option1"
}
```

**With variables:**
```json
{
  "type": "yourStepType",
  "field1": "{{variableName}}"
}
```

**Key features:**
- Feature 1
- Feature 2

**Common use cases:**
- Use case 1
- Use case 2

---

### 8. Create Example

File: `docs/examples/your_step_example.json`

```json
{
  "id": "1",
  "type": "setVariable",
  "description": "Set up",
  "variableName": "value",
  "value": "example"
}
```

Simple example showing your step in context (2-3 steps total).

---

### 9. Update Architecture (if needed)

File: `docs/ARCHITECTURE.md`

Only if step has special behavior:

```markdown
### YourStepName

**Type Definition** (in `src/types/steps.ts`):
```typescript
interface StepYourStepName extends StepBase {
  type: "yourStepType";
  field1: string;
}
```

**Execution Logic** (in `src/main/automationExecutor.ts`):
- Special handling or requirements
- Variables stored if applicable

## Common Step Patterns

### Pattern: Selector-based Step
```typescript
// Type
interface StepSelector extends StepBase {
  type: "stepName";
  selector: string;
}

// Execution
case "stepName": {
  const selector = this.substituteVariables(step.selector);
  const result = await webContents.executeJavaScript(`
    document.querySelector('${selector}').doSomething()
  `);
  break;
}
```

### Pattern: Store Result
```typescript
case "stepName": {
  const result = await someAction();
  
  // Store as auto-typed value
  if (step.storeKey) {
    this.variables[step.storeKey] = this.parseValue(result);
  }
  break;
}
```

### Pattern: Use Variable
```typescript
case "stepName": {
  const value = this.substituteVariables(step.variableRef);
  // Use value in action
  break;
}
```

### Pattern: Conditional Storage
```typescript
case "stepName": {
  const value = await extractValue();
  
  // Only store if provided
  if (step.storeKey && step.storeKey.trim()) {
    this.variables[step.storeKey] = value;
  }
  break;
}
```

---

## Testing Your Step

1. **Type check**: Run `pnpm build` - should compile without errors
2. **Create automation**: Use AutomationBuilder to add your step
3. **Verify UI**: Check that all fields render correctly
4. **Test execution**: Run automation, watch it execute
5. **Verify variables**: Check that variables are stored/accessed correctly
6. **Edge cases**: Test with empty values, special characters, large data

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Step not appearing in add menu | Check `stepTypes` array in `steps.ts` and `StepEditor.tsx` |
| Editor not rendering | Check type guard in component (`if (step.type !== ...)`) |
| Execution error | Check `substituteVariables()` is used for string fields with `{{}}` |
| Variable not storing | Check `this.variables[key] = value` in executor case |
| Type errors in switch | Verify step added to `AutomationStep` union |

