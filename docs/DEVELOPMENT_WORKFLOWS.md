## Development Workflows

Common tasks and how to accomplish them in Loopi development.

### Adding a New Step Type (Complete Workflow)

**Time:** ~30 minutes  
**Complexity:** Medium

1. **Define the step type**
   - File: `src/types/steps.ts`
   - Add interface, add to union, add to `stepTypes` array

2. **Create UI component**
   - File: `src/components/automationBuilder/nodeDetails/stepTypes/YourStep.tsx`
   - Use existing step as template

3. **Wire up component**
   - File: `src/components/automationBuilder/nodeDetails/stepTypes/index.ts` - add export
   - File: `src/components/automationBuilder/nodeDetails/StepEditor.tsx` - add case

4. **Implement execution**
   - File: `src/main/automationExecutor.ts` - add case in `executeStep()`

5. **Add defaults**
   - File: `src/hooks/useNodeActions.ts` - add case in `getInitialStepData()`

6. **Test**
   - Run `pnpm start`
   - Create automation, add your step
   - Verify UI renders
   - Run automation, verify execution

7. **Document**
   - File: `docs/STEPS_REFERENCE.md` - add step documentation
   - File: `docs/examples/` - create example automation
   - Run: `pnpm format` before committing

**Reference:** [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md)

---

### Fixing a Bug in Step Execution

**Example:** Extract step not storing variables correctly

1. **Identify which file has the bug**
   - UI issue? → `src/components/.../stepTypes/ExtractStep.tsx`
   - Execution issue? → `src/main/automationExecutor.ts` (extract case)
   - Type issue? → `src/types/steps.ts` (StepExtract interface)

2. **Add logging to understand issue**
   ```typescript
   // In automationExecutor.ts
   case "extract": {
     const selector = this.substituteVariables(step.selector);
     console.log("Extracting from:", selector);
     const value = await webContents.executeJavaScript(`...`);
     console.log("Extracted value:", value, "Type:", typeof value);
     if (step.storeKey) {
       this.variables[step.storeKey] = this.parseValue(value);
       console.log("Stored as:", this.variables[step.storeKey]);
     }
     break;
   }
   ```

3. **Test in dev mode**
   - Run `pnpm start`
   - Create automation with Extract step
   - Open DevTools (F12) → Logs tab
   - Check console output

4. **Fix the issue**
   - Apply fix to relevant file
   - Test again to verify

5. **Update documentation if behavior changed**
   - `docs/STEPS_REFERENCE.md` - step documentation
   - `docs/VARIABLES.md` - if variable handling changed

---

### Modifying Existing Step

**Example:** Add optional `delay` field to Click step

1. **Update type**
   ```typescript
   // src/types/steps.ts
   interface StepClick extends StepBase {
     type: "click";
     selector: string;
     delay?: number;  // Add this
   }
   ```

2. **Update UI component**
   ```typescript
   // src/components/.../stepTypes/ClickStep.tsx
   <div className="space-y-2">
     <Label className="text-xs">Delay (ms)</Label>
     <Input
       type="number"
       value={step.delay || 0}
       onChange={(e) => onUpdate(id, "update", {
         step: { ...step, delay: parseInt(e.target.value) }
       })}
     />
   </div>
   ```

3. **Update execution**
   ```typescript
   // src/main/automationExecutor.ts
   case "click": {
     const selector = this.substituteVariables(step.selector);
     if (step.delay) {
       await this.wait(step.delay);
     }
     await webContents.executeJavaScript(`...`);
     break;
   }
   ```

4. **Update documentation**
   - `docs/STEPS_REFERENCE.md` - update Click step section
   - Add field to JSON examples
   - Document the new field

---

### Fixing TypeScript Errors

**Common patterns:**

**Error:** `Property 'x' does not exist on type 'StepBase'`
- **Cause:** Accessing field not in type definition
- **Fix:** Update step interface in `src/types/steps.ts`

**Error:** `Type 'unknown' is not assignable to type 'string'`
- **Cause:** Variable could be any type, but code expects string
- **Fix:** Add type check: `if (typeof var === "string")`

**Error:** `case 'newStep' not handled in switch`
- **Cause:** Added new step type but didn't update switch statement
- **Fix:** Add case in `StepEditor.tsx` or `AutomationExecutor.executeStep()`

**Debugging:**
```bash
pnpm build           # Check all errors
pnpm start           # Development mode with live reload
```

---

### Testing Your Changes

**Manual Testing Checklist:**

For any change, test in this order:

1. **TypeScript compilation**
   ```bash
   pnpm build
   # Should complete with no errors
   ```

2. **Application startup**
   ```bash
   pnpm start
   # App should launch without crashing
   ```

3. **Basic functionality**
   - Open Dashboard
   - Create new automation
   - Add steps of relevant types
   - Edit step configurations

4. **Execution**
   - Run automation
   - Watch in preview window
   - Check console logs
   - Verify results

5. **Code formatting**
   ```bash
   pnpm format
   # Fix any style issues before committing
   ```

---

### Committing Changes

**Commit Message Format:**

```
type: brief description

Optional longer explanation if needed.

- Detail 1
- Detail 2
```

**Types:**
- `feat:` - New step type or feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code restructuring
- `test:` - Test additions/updates
- `chore:` - Build, dependencies, etc.

**Examples:**
```
feat: Add DatePicker step type

Allows users to interact with date picker inputs.
Supports various date formats and localization.

- Add StepDatePicker type and UI
- Implement execution in automationExecutor
- Add STEPS_REFERENCE.md documentation

fix: Correct variable substitution in API URLs

Variables with special characters now escape properly.

refactor: Simplify variable type detection

Extract parseValue logic to reduce code duplication.

docs: Update VARIABLES.md with array nesting examples
```

---

### Creating a Pull Request

**Before pushing:**

```bash
# 1. Format code
pnpm format

# 2. Verify it compiles
pnpm build

# 3. Test manually
pnpm start

# 4. Check for any debug logs
git diff  # Remove console.log, etc.

# 5. Write clear commit message
git commit -m "feat: Add new step type"

# 6. Push to feature branch
git push origin feature/your-feature
```

**PR Description Template:**

```markdown
## Description
What does this PR do?

## Type of Change
- [ ] New step type
- [ ] Bug fix
- [ ] Feature enhancement
- [ ] Documentation
- [ ] Refactoring

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How to test this change:
1. Step 1
2. Step 2

## Documentation Updated
- [ ] STEPS_REFERENCE.md
- [ ] ARCHITECTURE.md
- [ ] VARIABLES.md
- [ ] Example JSON created

## Screenshots/Videos (if applicable)
```

---

### Reviewing Documentation

**Checklist before committing:**

- [ ] All code changes documented
- [ ] Step types updated in STEPS_REFERENCE.md
- [ ] New features explained in ARCHITECTURE.md
- [ ] Variable changes documented in VARIABLES.md
- [ ] Examples created if applicable
- [ ] All links verify (use relative paths: `./FILE.md`)
- [ ] Code formatting applied (`pnpm format`)

---

### Troubleshooting Development Issues

**App won't start:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm start
```

**TypeScript errors don't clear:**
```bash
pnpm build --force
```

**Hot reload not working:**
- Restart dev server: `Ctrl+C` then `pnpm start`
- Check file saved in editor

**Variables not substituting:**
- Add logging in `substituteVariables()` method
- Check `{{varName}}` syntax is correct (no spaces allowed)
- Verify variable set before use

**Step not executing:**
- Check case statement in `automationExecutor.ts`
- Add `console.log()` to debug execution path
- Verify selector is valid (test in browser DevTools)

