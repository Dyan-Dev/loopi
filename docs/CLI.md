# Loopi CLI

Run and manage your Loopi workflows from the command line.

The CLI connects to the running Loopi desktop app over a local HTTP server. This means:
- The **Loopi desktop app must be running** for the CLI to work.
- All execution happens inside the desktop app — the CLI just sends commands and streams back logs.
- Your workflows, credentials, and browser sessions are shared between the UI and CLI.

---

## Prerequisites

- Loopi desktop app running (via `pnpm start` or installed release)
- Node.js 16+ and pnpm (only needed for development builds)

---

## Two Ways to Use the CLI

| Method | When to use | Command prefix |
|--------|-------------|----------------|
| `loopi-cli` | Loopi is **installed** as a desktop app | `loopi-cli <command>` |
| `pnpm run:workflow` | Running Loopi from **source** (development) | `pnpm run:workflow <command>` |

Both methods support the exact same commands and options. The examples below show both — pick whichever matches your setup.

> **Note:** The `loopi-cli` command is automatically installed to your PATH when the Loopi desktop app starts. On Linux/macOS it's placed in `/usr/local/bin/` (or `~/.local/bin/`). On Windows, it's in `%LOCALAPPDATA%\Loopi\`.

---

## Quick Start

**Installed app:**
```bash
# 1. Make sure the Loopi desktop app is running

# 2. Check the connection
loopi-cli ping

# 3. List your saved workflows
loopi-cli list

# 4. Run a workflow from a JSON file
loopi-cli run my-workflow.json

# 5. Run a saved workflow by ID
loopi-cli run --id abc123
```

**Development mode:**
```bash
# 1. Start the Loopi desktop app
pnpm start

# 2. Check the connection
pnpm run:workflow ping

# 3. List your saved workflows
pnpm run:workflow list

# 4. Run a workflow from a JSON file
pnpm run:workflow run my-workflow.json

# 5. Run a saved workflow by ID
pnpm run:workflow run --id abc123
```

---

## Commands

### `ping` — Check Connection

Verify the desktop app is running and the CLI can connect.

```bash
loopi-cli ping
# or in development:
pnpm run:workflow ping
```

Output:
```
Loopi is running on port 19542.
```

---

### `list` — List Saved Workflows

List all workflows saved in the desktop app.

```bash
loopi-cli list
# or in development:
pnpm run:workflow list
```

Output:
```
Found 3 workflow(s):

  abc123-def456
    Name:    My Scraper
    Desc:    Scrapes product prices daily
    Nodes:   8  |  Edges: 7
    Updated: 2026-03-15T10:30:00.000Z

  ghi789-jkl012
    Name:    Slack Notifier
    Nodes:   4  |  Edges: 3
    Updated: 2026-03-14T08:00:00.000Z
```

Shorthand: `ls`

---

### `get <id>` — Get Workflow Details

Print the full JSON of a saved workflow. Useful for inspecting or exporting.

```bash
loopi-cli get abc123-def456
# or in development:
pnpm run:workflow get abc123-def456
```

Output: Full workflow JSON (nodes, edges, variables, etc.)

You can pipe it to a file to export:
```bash
loopi-cli get abc123-def456 > my-workflow.json
```

---

### `run <file.json>` — Run Workflow from File

Run a workflow by providing a JSON file. The file should contain `nodes` and `edges` arrays.

```bash
loopi-cli run ./docs/examples/github_issue_tracker.json
# or in development:
pnpm run:workflow run ./docs/examples/github_issue_tracker.json
```

Output (streamed in real-time):
```
Loading workflow from: /home/user/loopi/docs/examples/github_issue_tracker.json
Connecting to Loopi on port 19542...

  [INFO]  Workflow: GitHub Issue Tracker | Nodes: 5, Edges: 4
  [INFO]  Validation passed. Starting execution...
  [RUN ]  node-1 (navigate)
  [ OK ]  node-1 (navigate)
  [RUN ]  node-2 (extract)
  [ OK ]  node-2 (extract)
  [RUN ]  node-3 (apiCall)
  [ OK ]  node-3 (apiCall)

Workflow completed successfully in 3.2s.

Final variables:
  issueCount: 42
  latestIssue: {"title": "Bug fix", "number": 123}
```

---

### `run --id <id>` — Run Saved Workflow by ID

Run a workflow that's already saved in the desktop app without needing the JSON file.

```bash
loopi-cli run --id abc123-def456
# or in development:
pnpm run:workflow run --id abc123-def456
```

The output format is the same as running from a file.

---

### `create <file.json>` — Import/Create a Workflow

Import a workflow JSON file into the desktop app's storage.

```bash
loopi-cli create ./my-new-workflow.json
# or in development:
pnpm run:workflow create ./my-new-workflow.json
```

Output:
```
Workflow created with ID: abc123-def456
```

The workflow will now appear in the desktop app's dashboard.

Shorthand: `import`

---

### `update <id> <file.json>` — Update a Workflow

Replace a saved workflow's data with new JSON. The workflow ID is preserved.

```bash
loopi-cli update abc123-def456 ./updated-workflow.json
# or in development:
pnpm run:workflow update abc123-def456 ./updated-workflow.json
```

Output:
```
Workflow 'abc123-def456' updated.
```

---

### `delete <id>` — Delete a Workflow

Delete a saved workflow by ID.

```bash
loopi-cli delete abc123-def456
# or in development:
pnpm run:workflow delete abc123-def456
```

Output:
```
Workflow 'abc123-def456' deleted.
```

Shorthand: `rm`

---

## Global Options

These options work with any command:

| Option | Description | Default |
|--------|-------------|---------|
| `--port <port>` | Override the server port | Auto-discovered or `19542` |
| `--headless` | Run browser steps in the background | `true` |
| `--no-headless` | Show the browser window during execution | `false` |
| `--help`, `-h` | Show help text | — |

Examples:
```bash
# Run on a specific port
loopi-cli --port 19543 list

# Run with visible browser window
loopi-cli run --no-headless my-workflow.json

# Same commands in development mode
pnpm run:workflow --port 19543 list
pnpm run:workflow run --no-headless my-workflow.json
```

---

## Workflow JSON Format

A workflow JSON file has this structure:

```json
{
  "name": "My Workflow",
  "description": "Optional description",
  "nodes": [
    {
      "id": "node-1",
      "type": "automationStep",
      "data": {
        "step": {
          "type": "navigate",
          "value": "https://example.com"
        }
      },
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "node-2",
      "type": "automationStep",
      "data": {
        "step": {
          "type": "extract",
          "selector": "h1",
          "storeKey": "title"
        }
      },
      "position": { "x": 0, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}
```

**Node types:** `automationStep`, `browserConditional`, `variableConditional`, `forEach`

**Step types:** See [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) for the full list of 86+ step types.

**Tip:** The easiest way to get a valid workflow JSON is to build it in the desktop UI, then export it or use `loopi-cli get <id>`.

---

## How It Works

```
┌──────────────┐          HTTP (localhost)          ┌─────────────────────┐
│   CLI Tool   │  ──────────────────────────────►   │  Loopi Desktop App  │
│  (your      │   POST /run, GET /workflows, ...   │  (Electron)         │
│  terminal)  │  ◄──────────────────────────────    │                     │
│              │   Streams NDJSON status updates     │  Runs workflows     │
└──────────────┘                                     │  Controls browser   │
                                                     └─────────────────────┘
```

1. When the desktop app starts, it launches a local HTTP server on `127.0.0.1:19542`.
2. The CLI discovers the port by reading a `.loopi-port` file from the app's data directory.
3. Commands are sent as HTTP requests; workflow execution streams back real-time NDJSON logs.
4. Only accessible from localhost — not exposed to the network.

---

## Port Discovery

The CLI automatically finds the correct port by checking:

| Platform | Port file location |
|----------|-------------------|
| Linux | `~/.config/loopi/.loopi-port` |
| macOS | `~/Library/Application Support/loopi/.loopi-port` |
| Windows | `%APPDATA%/loopi/.loopi-port` |

You can override this with `--port <port>` or set the `LOOPI_CLI_PORT` environment variable in the desktop app.

---

## REST API Reference

The CLI communicates with these endpoints. You can also call them directly with `curl` or any HTTP client.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check |
| `POST` | `/run` | Run inline workflow (JSON body with nodes/edges) |
| `GET` | `/workflows` | List all saved workflows |
| `GET` | `/workflows/:id` | Get a workflow by ID |
| `POST` | `/workflows` | Create a new workflow |
| `PUT` | `/workflows/:id` | Update a workflow |
| `DELETE` | `/workflows/:id` | Delete a workflow |
| `POST` | `/workflows/:id/run` | Run a saved workflow |

**Example with curl:**
```bash
# List workflows
curl http://127.0.0.1:19542/workflows

# Run a saved workflow
curl -X POST http://127.0.0.1:19542/workflows/abc123/run \
  -H "Content-Type: application/json" \
  -d '{"headless": true}'
```

---

## Troubleshooting

**"Cannot connect to Loopi on port 19542. Is the desktop app running?"**
- Make sure the Loopi desktop app is open and fully loaded.
- Check if the port is correct: `cat ~/.config/loopi/.loopi-port` (Linux).
- Try specifying the port manually: `--port 19543`.

**"Workflow not found"**
- Run `list` to see available workflow IDs.
- IDs are UUIDs — make sure you're using the full ID.

**"Validation failed"**
- The workflow JSON may be malformed. Check the nodes and edges structure.
- Make sure node types are `automationStep`, `browserConditional`, `variableConditional`, or `forEach` (not `step`).

**Browser steps not working in headless mode**
- Some browser steps require a visible window. Try `--no-headless`.

---

## Next Steps

- [Steps Reference](./STEPS_REFERENCE.md) — All step types and their fields
- [Variables](./VARIABLES.md) — Variable system and access patterns
- [Getting Started](./GETTING_STARTED.md) — Build your first workflow in the UI
- [examples/](./examples/) — Ready-to-import workflow JSON files
