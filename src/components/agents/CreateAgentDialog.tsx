import type { AgentCapability } from "@app-types/agent";
import type { Credential } from "@app-types/globals";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (config: {
    name: string;
    role: string;
    description: string;
    goal: string;
    workflowIds: string[];
    capabilities: AgentCapability[];
    model: {
      provider: "openai" | "anthropic" | "ollama" | "claude-code";
      model: string;
      credentialId?: string;
      baseUrl?: string;
    };
    credentialIds: string[];
  }) => void;
}

interface WorkflowOption {
  id: string;
  name: string;
}

const CAPABILITIES: { id: AgentCapability; label: string; description: string }[] = [
  { id: "browser", label: "Browser", description: "Web browsing and DOM automation" },
  { id: "api", label: "API Calls", description: "Make HTTP requests" },
  { id: "desktop", label: "Desktop", description: "Mouse, keyboard, screen control" },
  { id: "ai", label: "AI", description: "Call LLM providers" },
  { id: "workflows", label: "Workflows", description: "Create and run workflows" },
  { id: "credentials", label: "Credentials", description: "Access stored credentials" },
  { id: "filesystem", label: "Filesystem", description: "Read/write files" },
];

const PROVIDER_MODELS: Record<string, { label: string; models: string[] }> = {
  "claude-code": {
    label: "Claude Code (CLI)",
    models: ["claude"],
  },
  anthropic: {
    label: "Anthropic",
    models: ["claude-sonnet-4-5-20250929", "claude-sonnet-4-20250514", "claude-opus-4-20250514"],
  },
  openai: {
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  ollama: {
    label: "Ollama (Local)",
    models: ["llama3", "mistral", "mixtral", "codellama", "qwen2", "deepseek-coder"],
  },
};

export function CreateAgentDialog({ open, onClose, onCreate }: CreateAgentDialogProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [provider, setProvider] = useState("claude-code");
  const [model, setModel] = useState("claude");
  const [baseUrl, setBaseUrl] = useState("");
  const [capabilities, setCapabilities] = useState<AgentCapability[]>(["ai", "workflows"]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>("");
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<string[]>([]);
  const [modelValidation, setModelValidation] = useState<{
    valid: boolean;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      window.electronAPI?.credentials
        .list()
        .then(setCredentials)
        .catch(() => {
          /* ignore */
        });
      window.electronAPI?.tree
        ?.list?.()
        .then((list) =>
          setWorkflows(
            (list || []).map((w: { id: string; name: string }) => ({ id: w.id, name: w.name }))
          )
        )
        .catch(() => {
          /* ignore */
        });
    }
  }, [open]);

  useEffect(() => {
    if (provider && model) {
      window.electronAPI?.agents
        .validateModel(provider, model)
        .then(setModelValidation)
        .catch(() => setModelValidation(null));
    }
  }, [provider, model]);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const models = PROVIDER_MODELS[p]?.models;
    if (models?.length) setModel(models[0]);
  };

  const toggleCapability = (cap: AgentCapability) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const toggleWorkflow = (id: string) => {
    setSelectedWorkflowIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!name.trim() || !role.trim() || !goal.trim()) return;
    onCreate({
      name: name.trim(),
      role: role.trim(),
      description: description.trim(),
      goal: goal.trim(),
      workflowIds: selectedWorkflowIds,
      capabilities,
      model: {
        provider: provider as "openai" | "anthropic" | "ollama" | "claude-code",
        model,
        credentialId: selectedCredentialId || undefined,
        baseUrl: baseUrl || undefined,
      },
      credentialIds: selectedCredentialIds,
    });
    setName("");
    setRole("");
    setDescription("");
    setGoal("");
    setSelectedWorkflowIds([]);
    setCapabilities(["ai", "workflows"]);
    setSelectedCredentialIds([]);
    setSelectedCredentialId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="agent-name" className="text-xs">
                Name
              </Label>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Social Monitor"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="agent-role" className="text-xs">
                Role
              </Label>
              <Input
                id="agent-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Social Media Manager"
                className="mt-1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="agent-desc" className="text-xs">
              Description
            </Label>
            <Textarea
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Goal */}
          <div>
            <Label htmlFor="agent-goal" className="text-xs">
              Goal
            </Label>
            <Textarea
              id="agent-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What outcome should this agent achieve? The reflection engine uses this to decide if the run made progress."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Workflows */}
          <div>
            <Label className="text-xs mb-2 block">Assigned Workflows</Label>
            {workflows.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                No workflows available. Create one in the Dashboard first.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded p-2">
                {workflows.map((w) => (
                  <label
                    key={w.id}
                    className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-muted"
                  >
                    <Checkbox
                      checked={selectedWorkflowIds.includes(w.id)}
                      onCheckedChange={() => toggleWorkflow(w.id)}
                    />
                    <span className="truncate">{w.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Model Provider */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Provider</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_MODELS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(PROVIDER_MODELS[provider]?.models || []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Model validation feedback */}
          {modelValidation && !modelValidation.valid && (
            <div className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{modelValidation.reason}</span>
            </div>
          )}
          {modelValidation?.valid && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Model suitable for agentic tasks
            </div>
          )}

          {/* Ollama base URL */}
          {provider === "ollama" && (
            <div>
              <Label className="text-xs">Ollama Base URL</Label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="mt-1"
              />
            </div>
          )}

          {/* Credential for AI provider */}
          {provider !== "claude-code" && provider !== "ollama" && credentials.length > 0 && (
            <div>
              <Label className="text-xs">API Credential</Label>
              <Select value={selectedCredentialId} onValueChange={setSelectedCredentialId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select credential..." />
                </SelectTrigger>
                <SelectContent>
                  {credentials
                    .filter((c) => c.type === provider || c.type === "apiKey")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Capabilities */}
          <div>
            <Label className="text-xs mb-2 block">Capabilities</Label>
            <div className="grid grid-cols-2 gap-2">
              {CAPABILITIES.map((cap) => (
                <label
                  key={cap.id}
                  className="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-muted"
                >
                  <Checkbox
                    checked={capabilities.includes(cap.id)}
                    onCheckedChange={() => toggleCapability(cap.id)}
                  />
                  <div>
                    <span className="font-medium">{cap.label}</span>
                    <p className="text-[10px] text-muted-foreground">{cap.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !name.trim() ||
              !role.trim() ||
              !goal.trim() ||
              (modelValidation !== null && !modelValidation.valid)
            }
          >
            Create Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
