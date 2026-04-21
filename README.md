# Loopi

**The open-source desktop automation platform — visual workflow builder, real browser control, desktop cursor/keyboard automation, shell command execution, AI agents, and 80+ API integrations. All running locally on your machine.**

[![License: O'Saasy](https://img.shields.io/badge/license-O%27Saasy-blue.svg)](LICENSE)

## Install

Download the latest release for your OS from [**Releases**](https://github.com/Dyan-Dev/loopi/releases).

| Platform | Format |
|----------|--------|
| Windows  | `.exe` installer |
| Linux    | `.deb` package |

Or build from source:

```bash
git clone https://github.com/Dyan-Dev/loopi.git
cd loopi
pnpm install
pnpm start
```

---

## What Can Loopi Do?

Loopi automates anything on your computer — not just the browser.

**Browser Automation** — Navigate, click, type, extract data, upload files, take screenshots in a real Chromium window.

**Desktop Control** — Move the mouse cursor, click, drag, scroll, type text, press keys, and execute hotkey combos anywhere on your desktop. Works on Linux (X11 & Wayland), macOS, and Windows.

**System Commands** — Run any shell command, capture stdout/stderr/exit codes into workflow variables, pipe outputs between steps. Automate git, docker, scripts, or any CLI tool.

**AI Agents** — Goal-driven agents that run your workflows on a schedule, reflect on every run, and self-patch broken workflows. Powered by OpenAI, Anthropic, Claude Code, or Ollama (100% local).

**80+ Integrations** — Slack, Discord, GitHub, Notion, Stripe, Postgres, Google Sheets, Telegram, Twitter, and many more — all built-in.

**Visual Workflow Builder** — Drag-and-drop node editor. Build complex multi-step automations without writing code.

**CLI Support** — Run and manage workflows from your terminal. List, create, update, delete, and execute — all from the command line.

---

## AI-Powered Automation — Local or Cloud, Your Choice

> **Build agentic workflows that connect AI to real browser actions, desktop control, system commands, and 80+ APIs — without sending your data to the cloud.**

Loopi gives AI models the ability to **act**: browse the web, move the cursor, run commands, call APIs, query databases, send messages, and process data — all orchestrated visually.

**Connect any LLM:**
- **OpenAI** (GPT-4o, GPT-4o-mini, GPT-4-turbo) — cloud
- **Anthropic** (Claude Sonnet 4.5, Opus 4) — cloud
- **Claude Code** — uses the local Claude Code CLI, no API key needed
- **Ollama** (Llama, Mistral, Mixtral, Qwen, DeepSeek, etc.) — runs 100% locally, your data never leaves your machine

**What you can build:**
- AI agents that browse websites, extract data, and make decisions
- Desktop automation bots that move the mouse, click, type, and interact with any application
- System administration workflows that run shell commands and process outputs
- Chains that call an API, feed the response to an AI model, and post the output to Slack/Discord/Notion
- Local-first AI pipelines with Ollama — no API keys, no cloud, no cost

---

## What Makes Loopi Different

| | Loopi | n8n | Zapier/Make | Playwright | Selenium IDE | RPA Suites |
|---|---|---|---|---|---|---|
| Visual builder | Yes | Yes | Yes | No | Partial | Yes |
| Real browser control | Yes | No | No | Yes | Yes | Yes |
| Desktop cursor/keyboard | Yes | No | No | No | No | Yes |
| System command execution | Yes | No | No | No | No | Varies |
| API integrations | 80+ | Yes | Yes | No | No | Varies |
| Local + cloud AI | Yes | Cloud only | Cloud only | No | No | Cloud only |
| Agentic workflows | Yes | Partial | No | No | No | No |
| Runs locally | Yes | Self-host | No | Yes | Yes | Varies |
| Open source | Yes | Yes | No | Yes | Yes | No |
| CLI support | Yes | Yes | No | Yes | No | No |
| Typed variables | Yes | No | No | N/A | No | No |
| Free | Yes | Limits | No | Yes | Yes | No |

**Loopi is the only open-source tool that gives you visual workflows + browser automation + desktop control + system commands + 80+ API integrations + AI agents, all local-first.**

## Key Features

**Visual Workflow Builder** — Drag-and-drop node editor powered by ReactFlow. Build complex automations without writing code.

**Real Browser Automation** — Navigate, click, type, extract data, upload files, take screenshots — all in a real Chromium window you can watch.

**Desktop Cursor & Keyboard Control** — Move the mouse to any screen position, click (left/right/double), drag, scroll, type text, press individual keys, and execute hotkey combinations (Ctrl+C, Alt+Tab, etc.). Full support for Linux Wayland via ydotool, X11 via nut-js, and native support on macOS and Windows.

**System Command Execution** — Run any shell command from your workflows. Capture stdout, stderr, and exit codes into separate variables. Set working directory, timeout, and shell. Pipe command output into subsequent steps via variable substitution.

**Desktop Screenshots** — Capture the full screen or specific regions. Works on Wayland (via Electron desktopCapturer), X11 (via nut-js), and all platforms. Save to custom paths and store file paths in variables.

**80+ Integrations** — Connect to services out of the box:

| Category | Services |
|----------|----------|
| Communication | Slack, Discord, Telegram, WhatsApp, Mattermost |
| Email | SendGrid, Gmail, Mailchimp, ConvertKit, ActiveCampaign |
| Dev & Project | GitHub, GitLab, Jira, Linear, Asana, Trello, ClickUp, Monday, Todoist |
| Cloud & Storage | AWS S3, Supabase, Dropbox, Box, Google Drive |
| Databases | Postgres, MongoDB, MySQL, Redis, Elasticsearch, Snowflake, NocoDB, Baserow |
| CRM & Sales | Salesforce, HubSpot, Pipedrive |
| Payments | Stripe, PayPal, Xero, QuickBooks |
| E-Commerce | Shopify, WooCommerce |
| Support | Zendesk, Freshdesk, Intercom, Helpscout, ServiceNow |
| CMS & Content | Notion, WordPress, Ghost, Webflow, Contentful, Coda |
| DevOps | CircleCI, Jenkins, Sentry, PagerDuty, Grafana, Cloudflare, Netlify |
| AI | OpenAI, Anthropic, Ollama (local) |
| Other | Google Sheets, Google Calendar, Airtable, Typeform, Calendly, Twilio, Zoom, Spotify, Reddit, and more |

**Typed Variable System** — Auto-detected types with dot notation and array indexing: `{{user.name}}`, `{{items[0].price}}`, `{{apiResponse.data}}`.

**Data Transforms** — JSON parse/stringify, math operations, string operations, date/time, filter arrays, map arrays, and inline code execution.

**Conditional Logic & Loops** — Branch workflows with conditions, iterate over arrays with forEach loops.

**Credentials Manager** — Store API keys and tokens securely. Select credentials from a dropdown when configuring steps.

**Scheduling** — Run automations on intervals, cron expressions, or one-time schedules.

**Agents** — Build autonomous agents with a goal, a set of workflows, and a schedule. After every run the reflection engine judges progress against the goal and can rewrite the workflow graph in place to fix itself. See [AGENTS.md](./docs/AGENTS.md).

**Import/Export** — Save and share automations as JSON. Includes 30+ example workflows to get started.

**CLI Support** — Run and manage workflows from your terminal while the desktop app is running. List, create, update, delete, and execute workflows — all from the command line.

## Tech Stack

Electron, React 19, TypeScript, ReactFlow, Tailwind CSS, Radix UI, Biome, nut-js (desktop control), ydotool (Wayland support)

## Documentation

- [Getting Started](./docs/GETTING_STARTED.md) — Installation and first automation
- [CLI](./docs/CLI.md) — Run and manage workflows from the command line
- [Steps Reference](./docs/STEPS_REFERENCE.md) — All step types and their fields
- [Variables](./docs/VARIABLES.md) — Variable system and access patterns
- [Credentials](./docs/CREDENTIALS.md) — Managing API credentials
- [Agents](./docs/AGENTS.md) — Goal-driven agents with reflection and self-patching workflows
- [Architecture](./docs/ARCHITECTURE.md) — System design and data flow
- [Component Guide](./docs/COMPONENT_GUIDE.md) — React component structure
- [Adding New Steps](./docs/NEW_STEP_TEMPLATE.md) — How to add step types
- [Development Workflows](./docs/DEVELOPMENT_WORKFLOWS.md) — Common dev tasks

## Contributing

We welcome contributions — especially around AI agent capabilities, new integrations, desktop automation, and workflow templates.

```bash
pnpm install        # Install dependencies
pnpm start          # Run in development
pnpm run format     # Format with Biome
pnpm test           # Run tests
pnpm run make       # Build for current platform
```

**Ideas for contributors:**
- Add new AI model providers (Gemini, Cohere, local GGUF models)
- Build agentic workflow templates (research agents, monitoring agents, content pipelines)
- Add new service integrations
- Improve desktop automation (OCR, image matching, window management)
- Improve the AI copilot (auto-generate workflows from natural language)
- Add tool-use / function-calling support for connected LLMs

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. This project uses **Biome** for formatting and linting.

## Support

- [GitHub Issues](https://github.com/Dyan-Dev/loopi/issues) — Bug reports and feature requests
- [GitHub Discussions](https://github.com/Dyan-Dev/loopi/discussions) — Questions and community
- Email: support@dyan.live

## License

[O'Saasy License](LICENSE)
