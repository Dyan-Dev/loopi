## Documentation Structure Guide

This guide explains how to maintain and extend Loopi's documentation in a structured, scalable way.

### When to Add/Update Documentation

| Change Type | Where | What to Update |
|------------|-------|-----------------|
| New step type | STEPS_REFERENCE.md | Add to "Step Types Reference" section with example JSON |
| New feature | New section in appropriate file or ARCHITECTURE.md | Add with code examples and use cases |
| Bug fix | Minimal or none | Only if behavior changes significantly |
| Variable system change | VARIABLES.md | Update type detection rules or access patterns |
| Architecture change | ARCHITECTURE.md | Update relevant section with new diagrams/flows |
| API endpoint change | STEPS_REFERENCE.md | Update API Call section with new fields |

### Documentation Files Quick Reference

**ARCHITECTURE.md** - For developers
- System design and data flows
- Process architecture (main/renderer)
- Type system design
- Security model
- Extension points for adding features

**GETTING_STARTED.md** - For new users
- Installation steps
- Building first automation
- Common patterns
- Troubleshooting

**VARIABLES.md** - For all users
- Variable syntax and access patterns
- Type detection rules
- API response handling
- Best practices and examples

**STEPS_REFERENCE.md** - For all users
- All step types with examples
- Field references
- Tips for each step type

### Adding a New Step Type

Use this structured approach:

#### 1. Update STEPS_REFERENCE.md

Add to the "Step Types Reference" section following this format:

```markdown
#### YourNewStep
Brief description of what the step does.

**Basic example:**
```json
{
  "type": "yourNewStep",
  "field1": "value",
  "field2": "value"
}
```

**With variables:**
```json
{
  "type": "yourNewStep",
  "field1": "{{variableName}}"
}
```

**Key features:**
- Feature 1 description
- Feature 2 description

**Common use cases:**
- Use case 1
- Use case 2

#### 2. Update ARCHITECTURE.md (if needed)

If the step requires special handling:

```markdown
### YourNewStep

**Type Definition** (in `src/types/steps.ts`):
```typescript
interface StepYourNewStep extends StepBase {
  type: "yourNewStep";
  field1: string;
  field2?: string;
}
```

**Execution Logic** (in `src/main/automationExecutor.ts`):
- How it's executed
- Special behavior or requirements

**UI Component** (in `src/components/automationBuilder/nodeDetails/stepTypes/`):
- Component structure
- Key interactions

#### 3. Create Example Automation

Add to `docs/examples/`:
- File: `your_step_example.json`
- Include 2-3 steps showing the new step in context
- Add comment or use case in STEPS_REFERENCE.md linking to example

#### 4. Update Code Files

In order:
1. `src/types/steps.ts` - Add type definition
2. `src/components/automationBuilder/nodeDetails/stepTypes/` - Add editor component
3. `src/main/automationExecutor.ts` - Add execution logic
4. `src/hooks/useNodeActions.ts` - Add initial values
5. `src/components/automationBuilder/nodeDetails/StepEditor.tsx` - Add to switch

### Adding a New Feature (Non-Step)

#### 1. Add to ARCHITECTURE.md

Create a new subsection:

```markdown
## FeatureName

**Purpose:** Brief explanation

**Components Involved:**
- Component1 - Role
- Component2 - Role

**Data Flow:**
```
Flow diagram
```

**Key Implementation Details:**
- Detail 1
- Detail 2

**Extension Points:**
- How to extend this feature
```

#### 2. Update Relevant Feature Docs

If affecting variables, update VARIABLES.md; if affecting execution, update GETTING_STARTED.md, etc.

#### 3. Create Example

Add to `docs/examples/` if it benefits from a concrete example.

### Documentation Update Checklist

Before committing code changes:

- [ ] **STEPS_REFERENCE.md** - New step types added with examples?
- [ ] **VARIABLES.md** - Variables system changes documented?
- [ ] **ARCHITECTURE.md** - Major architectural changes explained?
- [ ] **GETTING_STARTED.md** - New features explained in "Building More Complex Automations"?
- [ ] **Code comments** - Complex logic has inline comments?
- [ ] **Examples** - Real-world example JSON added if applicable?
- [ ] **Type definitions** - Code matches documentation?

### Useful Patterns

**Documenting variable access:**
```markdown
**Simple syntax:** `{{variableName}}`

**With nesting:** `{{object.property}}`

**With arrays:** `{{array[0]}}`

**Combined:** `{{array[0].property}}`

*API responses are stored as objects - see [VARIABLES.md](./VARIABLES.md) for details*
```

**Documenting step fields:**
```markdown
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| selector | string | Yes | CSS selector for element |
| value | string | No | Supports `{{variables}}` |
| operation | enum | Yes | Options: set, increment, decrement, append |
```

**Referencing other docs:**
```markdown
For detailed information, see [VARIABLES.md](./VARIABLES.md#automatic-type-detection)
For step examples, see [STEPS_REFERENCE.md](./STEPS_REFERENCE.md)
```

### File Format Standards

All documentation files use:
- **Markdown** with proper heading hierarchy (# > ## > ### > ####)
- **Code blocks** with language tags (```typescript, ```json, etc.)
- **Emphasis** for important terms (using *emphasis* or **bold**)
- **Links** to related documentation
- **Examples** for every major concept
- **Line length** max 100 characters (wrap longer lines)

### Version Control

When updating documentation:

1. **Group related changes** - If adding a step, update STEPS_REFERENCE.md + ARCHITECTURE.md + example in one commit
2. **Use clear commit messages** - "docs: Add DatePicker step documentation" not just "update docs"
3. **Avoid massive documentation rewrites** - Update incrementally
4. **Test links** - Verify relative links work (use `./FILE.md` not `FILE.md`)

### Quick Tips

1. **Keep it current** - Update docs when code changes
2. **Real examples > theoretical** - Actual JSON and code over abstract descriptions
3. **Link strategically** - Cross-reference related concepts
4. **Update checklist** - Use the Documentation Update Checklist before commits
5. **Simple language** - Avoid jargon; define terms when first introduced
6. **Copy from similar** - When adding a step, copy STEPS_REFERENCE.md section from similar step

