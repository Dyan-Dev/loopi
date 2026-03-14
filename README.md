# Loopi

**The open-source desktop automation platform that combines a visual builder, real browser control, AI agents, and 80+ API integrations — all running locally on your machine.**

[![License: O'Saasy](https://img.shields.io/badge/license-O%27Saasy-blue.svg)](LICENSE)

## Demo

[![Loopi Demo](https://img.youtube.com/vi/QLP-VOGVHBc/maxresdefault.jpg)](https://youtu.be/QLP-VOGVHBc?si=FczG6_QU04WFDJCP)

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

## AI-Powered Automation — Local or Cloud, Your Choice

> **Build agentic workflows that connect AI to real browser actions and 80+ APIs — without sending your data to the cloud.**

Loopi gives AI models the ability to **act**: browse the web, call APIs, query databases, send messages, and process data — all orchestrated visually. Think of it as giving your AI hands and eyes.

**Connect any LLM:**
- **OpenAI** (GPT-4o, GPT-4o-mini) — cloud
- **Anthropic** (Claude) — cloud
- **Ollama** (Llama, Mistral, Gemma, Phi, etc.) — runs 100% locally, your data never leaves your machine

**What you can build:**
- AI agents that browse websites, extract data, and make decisions
- Workflows that use LLMs to summarize, classify, or generate content — then act on the results
- Chains that call an API, feed the response to an AI model, and post the output to Slack/Discord/Notion
- Local-first AI pipelines with Ollama — no API keys, no cloud, no cost
- AI copilot that generates, explains, and auto-fixes your workflows

**Why this matters:** Most AI agent frameworks are code-only. Most no-code tools are cloud-only. Loopi is both visual and local-first, with the option to go cloud when you want to. You own your data, your models, and your workflows.

---

## What Makes Loopi Different

| | Loopi | n8n | Zapier/Make | Playwright | Selenium IDE | RPA Suites |
|---|---|---|---|---|---|---|
| Visual builder | Yes | Yes | Yes | No | Partial | Yes |
| Real browser control | Yes | No | No | Yes | Yes | Yes |
| API integrations | 80+ | Yes | Yes | No | No | Varies |
| Local + cloud AI | Yes | Cloud only | Cloud only | No | No | Cloud only |
| Agentic workflows | Yes | Partial | No | No | No | No |
| Runs locally | Yes | Self-host | No | Yes | Yes | Varies |
| Open source | Yes | Yes | No | Yes | Yes | No |
| Typed variables | Yes | No | No | N/A | No | No |
| Free | Yes | Limits | No | Yes | Yes | No |

**Loopi is the only tool that gives you visual workflows + real browser automation + 80+ API integrations + local & cloud AI + typed variables, all local-first and open source.**

## Key Features

**Visual Workflow Builder** — Drag-and-drop node editor powered by ReactFlow. Build complex automations without writing code.

**Real Browser Automation** — Navigate, click, type, extract data, upload files, take screenshots — all in a real Chromium window you can watch.

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

**Import/Export** — Save and share automations as JSON. Includes example workflows to get started.

## Tech Stack

Electron, React 19, TypeScript, ReactFlow, Tailwind CSS, Radix UI, Biome

## Documentation

- [Getting Started](./docs/GETTING_STARTED.md) — Installation and first automation
- [Steps Reference](./docs/STEPS_REFERENCE.md) — All step types and their fields
- [Variables](./docs/VARIABLES.md) — Variable system and access patterns
- [Credentials](./docs/CREDENTIALS.md) — Managing API credentials
- [Architecture](./docs/ARCHITECTURE.md) — System design and data flow
- [Component Guide](./docs/COMPONENT_GUIDE.md) — React component structure
- [Adding New Steps](./docs/NEW_STEP_TEMPLATE.md) — How to add step types
- [Development Workflows](./docs/DEVELOPMENT_WORKFLOWS.md) — Common dev tasks

## Contributing

We welcome contributions — especially around AI agent capabilities, new integrations, and workflow templates.

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
- Improve the AI copilot (auto-generate workflows from natural language)
- Add tool-use / function-calling support for connected LLMs

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. This project uses **Biome** for formatting and linting.

## Support

- [GitHub Issues](https://github.com/Dyan-Dev/loopi/issues) — Bug reports and feature requests
- [GitHub Discussions](https://github.com/Dyan-Dev/loopi/discussions) — Questions and community
- Email: support@dyan.live

## License

[O'Saasy License](LICENSE)
