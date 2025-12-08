## Documentation Quick Reference

One-page guide to Loopi documentation structure and usage.

---

## 📍 **Where to Start**

```
New to Loopi?
├─ README.md → Overview
├─ docs/README.md → Documentation Index  
└─ GETTING_STARTED.md → Installation & First Steps
```

---

## 📚 **All Documentation Files**

### Core Guides (What You Read)
| Document | Length | For Whom | Topic |
|----------|--------|---------|-------|
| **GETTING_STARTED.md** | 500 lines | Users | Installation, first automation, patterns |
| **VARIABLES.md** | 400 lines | Users | Variable syntax, types, examples |
| **STEPS_REFERENCE.md** | 600 lines | Users | All step types with examples |
| **ARCHITECTURE.md** | 300 lines | Developers | System design, internals |
| **COMPONENT_GUIDE.md** | 500 lines | Developers | React components, patterns |

### How-To Guides (Step-by-Step)
| Document | Length | Use When | Outcome |
|----------|--------|----------|---------|
| **NEW_STEP_TEMPLATE.md** | 600 lines | Adding new step type | Complete working step |
| **DEVELOPMENT_WORKFLOWS.md** | 500 lines | Common dev tasks | Task completed correctly |
| **DOCUMENTATION_GUIDE.md** | 400 lines | Updating documentation | Docs stay current |

### Navigation Guides (Finding Things)
| Document | Length | Use For | Result |
|----------|--------|---------|--------|
| **DOCUMENTATION_MAP.md** | 300 lines | Task lookup | Find right document |
| **docs/README.md** | 150 lines | Overview | Full documentation index |

---

## 🎯 **Task Quick Links**

| I Want To... | Read This | Time |
|---|---|---|
| Get started | GETTING_STARTED.md | 15 min |
| Build first automation | GETTING_STARTED.md#your-first-automation | 30 min |
| Use variables | VARIABLES.md | 20 min |
| Look up a step | STEPS_REFERENCE.md | 5 min |
| Add new step | NEW_STEP_TEMPLATE.md | 45 min |
| Fix a bug | DEVELOPMENT_WORKFLOWS.md#fixing-a-bug | 30 min |
| Understand system | ARCHITECTURE.md | 30 min |
| Modify component | COMPONENT_GUIDE.md | 20 min |
| Find any topic | DOCUMENTATION_MAP.md | 5 min |

---

## 📖 **Reading Paths by Role**

### 👤 New User
1. **README.md** (2 min) - Overview
2. **GETTING_STARTED.md** (30 min) - Install & first automation
3. **VARIABLES.md** (20 min) - Learn variable system
4. **STEPS_REFERENCE.md** (as needed) - Look up steps

**Result**: Can build automations

### 👨‍💻 New Developer
1. **README.md** (2 min) - Overview
2. **ARCHITECTURE.md** (30 min) - System design
3. **COMPONENT_GUIDE.md** (20 min) - Component structure
4. **NEW_STEP_TEMPLATE.md** (if adding feature) - Complete guide
5. **DEVELOPMENT_WORKFLOWS.md** (as needed) - Common tasks

**Result**: Can modify codebase, add features

### 🏗️ Maintainer
1. **DOCUMENTATION_GUIDE.md** (15 min) - Standards & checklist
2. **Relevant doc file** (varies) - What to update
3. **DOCUMENTATION_MAP.md** (as needed) - Find connections
4. **Commit checklist** from DEVELOPMENT_WORKFLOWS.md

**Result**: Documentation stays current

---

## 🔄 **Update Workflow**

```
You make code changes
  ↓
Check DOCUMENTATION_GUIDE.md
  "When to add/update documentation"
  ↓
Choose your task type:
  ├─ New step → NEW_STEP_TEMPLATE.md
  ├─ New feature → DOCUMENTATION_GUIDE.md
  ├─ Component change → COMPONENT_GUIDE.md
  └─ Bug fix → Check if docs changed
  ↓
Follow the checklist/guide
  ↓
Use DOCUMENTATION_GUIDE.md checklist
  ↓
Run: pnpm format
  ↓
Commit with clear message
```

---

## 📊 **Document Map**

```
README.md (Main entry point)
├── docs/README.md (Documentation index)
│   └── DOCUMENTATION_MAP.md (Navigation guide)
│
├── User Guides
│   ├── GETTING_STARTED.md (Install & first steps)
│   ├── VARIABLES.md (Variable system)
│   ├── STEPS_REFERENCE.md (All step types)
│   └── examples/ (Real automations)
│
└── Developer Guides
    ├── ARCHITECTURE.md (System design)
    ├── COMPONENT_GUIDE.md (React components)
    ├── NEW_STEP_TEMPLATE.md (Adding steps)
    ├── DEVELOPMENT_WORKFLOWS.md (Common tasks)
    └── DOCUMENTATION_GUIDE.md (Maintaining docs)
```

---

## ✅ **Before You Commit**

```bash
# 1. Code changes complete
git status

# 2. Format code
pnpm format

# 3. Build successful
pnpm build

# 4. Identify documentation needs
Check: DOCUMENTATION_GUIDE.md#when-to-addupdate-documentation

# 5. Update relevant docs
- STEPS_REFERENCE.md? (new step)
- VARIABLES.md? (variable system change)
- ARCHITECTURE.md? (major change)
- COMPONENT_GUIDE.md? (UI change)

# 6. Run documentation checklist
From: DOCUMENTATION_GUIDE.md#documentation-update-checklist

# 7. Check formatting again
pnpm format

# 8. Write commit message
Format: From DEVELOPMENT_WORKFLOWS.md

# 9. Commit
git commit -m "feat: Your change here"
```

---

## 🔍 **Finding Specific Topics**

### Variables
- **How to use**: VARIABLES.md
- **In steps**: STEPS_REFERENCE.md (each step)
- **Implementation**: ARCHITECTURE.md#variables-system

### Steps
- **All types**: STEPS_REFERENCE.md
- **Add new**: NEW_STEP_TEMPLATE.md
- **Modify**: DEVELOPMENT_WORKFLOWS.md#modifying-existing-step

### Components
- **Structure**: COMPONENT_GUIDE.md#component-hierarchy
- **Key ones**: COMPONENT_GUIDE.md#key-components
- **Patterns**: COMPONENT_GUIDE.md#ui-component-patterns
- **Create new**: COMPONENT_GUIDE.md#adding-a-new-component

### Architecture
- **Overview**: ARCHITECTURE.md#overview
- **Processes**: ARCHITECTURE.md#process-architecture
- **Data flow**: ARCHITECTURE.md#data-flow-patterns
- **Type system**: ARCHITECTURE.md#type-system-design

### Development
- **Setup**: GETTING_STARTED.md#installation
- **Workflows**: DEVELOPMENT_WORKFLOWS.md
- **Testing**: DEVELOPMENT_WORKFLOWS.md#testing-your-changes
- **Troubleshooting**: DEVELOPMENT_WORKFLOWS.md#troubleshooting-development-issues

---

## 📞 **Common Questions**

| Question | Answer | Read |
|----------|--------|------|
| How do I get started? | Follow GETTING_STARTED.md | GETTING_STARTED.md |
| Where is documentation? | In docs/ folder, index at docs/README.md | docs/README.md |
| How do I use variables? | See VARIABLES.md | VARIABLES.md |
| How do I add a step? | Follow NEW_STEP_TEMPLATE.md | NEW_STEP_TEMPLATE.md |
| Where is code located? | See ARCHITECTURE.md#project-structure | README.md |
| How do I debug? | See DEVELOPMENT_WORKFLOWS.md | DEVELOPMENT_WORKFLOWS.md |
| How do I contribute? | See CONTRIBUTING.md and DOCUMENTATION_GUIDE.md | CONTRIBUTING.md |
| Where do I find stuff? | Use DOCUMENTATION_MAP.md | DOCUMENTATION_MAP.md |

