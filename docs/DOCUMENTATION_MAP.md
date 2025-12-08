## Documentation Map

Quick reference guide to all Loopi documentation files and how to use them.

### By Audience

#### 👤 End Users (Want to use Loopi)
| Document | Purpose | Start Here |
|-----------|---------|-----------|
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Installation, first automation, common patterns | ✅ Start here |
| [VARIABLES.md](./VARIABLES.md) | Learn variable system, syntax, type detection | After first steps |
| [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) | Look up any step type with examples | When building automations |
| [examples/](./examples/) | Real-world automation examples to learn from | For inspiration |

#### 👨‍💻 Developers (Want to modify Loopi)
| Document | Purpose | When to Use |
|-----------|---------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Understand system design and data flow | First time contributing |
| [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) | React component structure and patterns | When modifying UI |
| [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md) | Step-by-step guide to add new step types | Adding features |
| [DEVELOPMENT_WORKFLOWS.md](./DEVELOPMENT_WORKFLOWS.md) | Common tasks and troubleshooting | Day-to-day development |
| [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) | How to maintain documentation | Before committing |

---

### By Task

#### 🚀 "I want to..."

**...build my first automation**
1. Read: [GETTING_STARTED.md](./GETTING_STARTED.md) - Installation & 5-step tutorial
2. Reference: [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) - Step types available
3. Learn: [VARIABLES.md](./VARIABLES.md) - How to use variables

**...use variables in my automation**
1. Read: [VARIABLES.md](./VARIABLES.md) - Complete variable guide
2. See: [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) - Examples in each step type
3. Try: [examples/api_call_github_user.json](./examples/api_call_github_user.json) - Variable usage example

**...access API response data**
1. Read: [VARIABLES.md](./VARIABLES.md#api-response-storage) - API storage section
2. Reference: [STEPS_REFERENCE.md](./STEPS_REFERENCE.md#api-call) - API Call step docs
3. Try: [examples/api_call_github_user.json](./examples/api_call_github_user.json) - Real API example

**...extract and compare data**
1. Read: [STEPS_REFERENCE.md](./STEPS_REFERENCE.md#extract-with-logic) - Extract With Logic step
2. Reference: [VARIABLES.md](./VARIABLES.md#automatic-type-detection) - Type detection
3. Learn: [GETTING_STARTED.md](./GETTING_STARTED.md#using-conditional-branches) - Condition workflow

**...add a new step type to Loopi**
1. Read: [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md) - Complete step-by-step guide
2. Reference: [ARCHITECTURE.md](./ARCHITECTURE.md) - System understanding
3. Check: [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) - Component patterns
4. Update: [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) - Update docs checklist

**...fix a bug in step execution**
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand flow
2. Check: [DEVELOPMENT_WORKFLOWS.md](./DEVELOPMENT_WORKFLOWS.md#fixing-a-bug-in-step-execution) - Debugging process
3. Locate: [src/main/automationExecutor.ts](../src/main/automationExecutor.ts) - Execution logic

**...modify a React component**
1. Read: [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) - Component structure
2. Learn: [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md#key-components) - Which component to edit
3. Check: [DEVELOPMENT_WORKFLOWS.md](./DEVELOPMENT_WORKFLOWS.md) - Testing steps

**...contribute to the project**
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview
2. Pick your task:
   - Adding feature → [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md)
   - Modifying UI → [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)
   - Fixing bug → [DEVELOPMENT_WORKFLOWS.md](./DEVELOPMENT_WORKFLOWS.md)
3. Before commit: [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md#documentation-update-checklist)

**...understand how variables work internally**
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md#variables-system) - Variable implementation
2. See: [src/main/automationExecutor.ts](../src/main/automationExecutor.ts) - Code
3. Learn: [VARIABLES.md](./VARIABLES.md) - User perspective

**...understand the overall architecture**
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete system design
2. Explore: [ARCHITECTURE.md](./ARCHITECTURE.md#process-architecture) - Main/Renderer process
3. See: [ARCHITECTURE.md](./ARCHITECTURE.md#data-flow-patterns) - Data flows

---

### Document Structure Overview

```
docs/
│
├── 📚 User Guides (For using Loopi)
│   ├── GETTING_STARTED.md
│   │   └── Installation, first automation, patterns
│   │
│   ├── VARIABLES.md
│   │   └── Variable syntax, type detection, examples
│   │
│   ├── STEPS_REFERENCE.md
│   │   └── All step types with JSON examples
│   │
│   └── examples/
│       └── Real-world automation JSON files
│
├── 🏗️ Architecture & Design (For developers)
│   ├── ARCHITECTURE.md
│   │   └── System design, data flows, types, security
│   │
│   ├── COMPONENT_GUIDE.md
│   │   └── React components, hooks, UI patterns
│   │
│   └── DEVELOPMENT_WORKFLOWS.md
│       └── Common tasks, debugging, troubleshooting
│
└── 🛠️ Developer Guides (For contributing)
    ├── NEW_STEP_TEMPLATE.md
    │   └── Complete checklist for new steps
    │
    ├── DOCUMENTATION_GUIDE.md
    │   └── How to maintain documentation
    │
    └── DOCUMENTATION_MAP.md (this file)
        └── Navigation guide
```

---

### File Relationship Map

```
GETTING_STARTED.md
├── → Links to VARIABLES.md (learn variables)
├── → Links to STEPS_REFERENCE.md (step types)
└── → References examples/ (real examples)

VARIABLES.md
├── → Links to STEPS_REFERENCE.md (in step docs)
├── → Links to GETTING_STARTED.md (workflows)
└── → Used by: Anyone using {{variables}}

STEPS_REFERENCE.md
├── → Links to VARIABLES.md (variable syntax)
├── → Links to GETTING_STARTED.md (workflows)
└── → Used by: Anyone configuring steps

ARCHITECTURE.md
├── → Links to NEW_STEP_TEMPLATE.md (adding features)
├── → Links to COMPONENT_GUIDE.md (component structure)
├── → Links to VARIABLES.md (variable system)
└── → Links to DEVELOPMENT_WORKFLOWS.md (debugging)

NEW_STEP_TEMPLATE.md
├── → References ARCHITECTURE.md (system understanding)
├── → References COMPONENT_GUIDE.md (component patterns)
├── → Updates STEPS_REFERENCE.md (documentation)
└── → Creates examples/ files (automation examples)

COMPONENT_GUIDE.md
├── → References ARCHITECTURE.md (data flow)
├── → Used by: When modifying React components
└── → References DEVELOPMENT_WORKFLOWS.md (testing)

DEVELOPMENT_WORKFLOWS.md
├── → Links to NEW_STEP_TEMPLATE.md (detailed steps)
├── → Links to DOCUMENTATION_GUIDE.md (before commit)
└── → Used by: Day-to-day development

DOCUMENTATION_GUIDE.md
├── → Links to all docs (update checklist)
├── → Used by: Before committing changes
└── → References: Documentation structure
```

---

### Quick Navigation

**Finding specific information:**

| Looking for... | Check... |
|---|---|
| How to use variables | [VARIABLES.md](./VARIABLES.md) |
| Step type examples | [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) |
| How to build automation | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| System architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Adding new step type | [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md) |
| Modifying components | [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) |
| Common dev tasks | [DEVELOPMENT_WORKFLOWS.md](./DEVELOPMENT_WORKFLOWS.md) |
| How to document changes | [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) |

---

### Reading Order by Role

**First-time User:**
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Get the app running
2. [VARIABLES.md](./VARIABLES.md) - Understand variables
3. [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) - Learn all step types
4. [examples/](./examples/) - See real examples

**New Developer:**
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Understand the product
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
3. [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md) - If adding feature
4. [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) - If modifying UI
5. [DEVELOPMENT_WORKFLOWS.md](./DEVELOPMENT_WORKFLOWS.md) - For daily tasks

**Maintaining Documentation:**
1. [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) - Structure and standards
2. Relevant file (VARIABLES.md, STEPS_REFERENCE.md, etc.)
3. Update checklist from [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md#documentation-update-checklist)

---

### Keeping Documentation Current

When you make changes:
1. Check [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md#when-to-addupdate-documentation) for what to update
2. Use the relevant guide:
   - New step → [NEW_STEP_TEMPLATE.md](./NEW_STEP_TEMPLATE.md)
   - New feature → [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md#adding-a-new-feature-non-step)
   - Component change → [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)
3. Apply [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md#documentation-update-checklist) checklist
4. Format: `pnpm format`
5. Commit with clear message
