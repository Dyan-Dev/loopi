import type { ReactFlowEdge, ReactFlowNode } from "@app-types";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  MessageSquare,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AiCopilotPanelProps {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  selectedNodeId: string | null;
  lastError?: string | null;
  onClose: () => void;
}

type CopilotAction = "explain" | "suggest" | "fix";

interface CopilotSettings {
  provider: "openai" | "anthropic" | "ollama";
  apiKey: string;
  model: string;
  baseUrl: string;
}

export function AiCopilotPanel({
  nodes,
  edges,
  selectedNodeId,
  lastError,
  onClose,
}: AiCopilotPanelProps) {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CopilotSettings>({
    provider: "openai",
    apiKey: "",
    model: "",
    baseUrl: "",
  });

  useEffect(() => {
    window.electronAPI?.settings.load().then((saved) => {
      if (saved) {
        setSettings((prev) => ({
          ...prev,
          ...(saved.aiProvider && { provider: saved.aiProvider }),
          ...(saved.aiApiKey && { apiKey: saved.aiApiKey }),
          ...(saved.aiModel && { model: saved.aiModel }),
          ...(saved.ollamaBaseUrl && { baseUrl: saved.ollamaBaseUrl }),
        }));
      }
    });
  }, []);

  const serializeContext = useCallback(() => {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: { step: n.data.step },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
      })),
      selectedNodeId: selectedNodeId || undefined,
      error: lastError || undefined,
    };
  }, [nodes, edges, selectedNodeId, lastError]);

  const runCopilot = useCallback(
    async (action: CopilotAction) => {
      if (!settings.apiKey && settings.provider !== "ollama") {
        toast.error("Please configure an API key in Copilot settings");
        setShowSettings(true);
        return;
      }

      if (nodes.length === 0) {
        toast.warning("Add some nodes to the workflow first");
        return;
      }

      setLoading(true);
      setResponse(null);

      try {
        const result = await window.electronAPI?.ai.copilot({
          action,
          context: serializeContext(),
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model || undefined,
          ...(settings.provider === "ollama" && {
            baseUrl: settings.baseUrl || "http://localhost:11434",
          }),
        });

        if (result?.success && result.response) {
          setResponse(result.response);
        } else {
          toast.error(result?.error || "Copilot request failed");
        }
      } catch (err) {
        toast.error("Failed to reach AI provider");
        console.error("Copilot error:", err);
      } finally {
        setLoading(false);
      }
    },
    [settings, nodes, serializeContext]
  );

  return (
    <Card className="w-full flex-1 min-h-0 flex flex-col">
      <CardHeader className="p-3 flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Copilot</span>
            <Badge variant="secondary" className="text-[10px]">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              {showSettings ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-2 space-y-2 pt-2 border-t border-border">
            <div>
              <label className="text-xs text-muted-foreground">Provider</label>
              <div className="flex gap-1 mt-1">
                {(["openai", "anthropic", "ollama"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={settings.provider === p ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => setSettings({ ...settings, provider: p })}
                  >
                    {p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "Ollama"}
                  </Button>
                ))}
              </div>
            </div>
            {settings.provider !== "ollama" && (
              <div>
                <label className="text-xs text-muted-foreground">API Key</label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background"
                  placeholder={`${settings.provider === "openai" ? "sk-..." : "sk-ant-..."}`}
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Model (optional)</label>
              <input
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background"
                placeholder={
                  settings.provider === "openai"
                    ? "gpt-4o-mini"
                    : settings.provider === "anthropic"
                      ? "claude-sonnet-4-5-20250929"
                      : "mistral"
                }
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pt-0 flex-1 overflow-y-auto space-y-3">
        {/* Action buttons */}
        <div className="flex flex-col gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            onClick={() => runCopilot("explain")}
            disabled={loading}
          >
            <MessageSquare className="h-3 w-3 mr-2" />
            {selectedNodeId ? "Explain this node" : "Explain workflow"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            onClick={() => runCopilot("suggest")}
            disabled={loading}
          >
            <Lightbulb className="h-3 w-3 mr-2" />
            Suggest next steps
          </Button>
          {lastError && (
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs h-8 border-red-200 dark:border-red-800"
              onClick={() => runCopilot("fix")}
              disabled={loading}
            >
              <Wrench className="h-3 w-3 mr-2 text-red-500" />
              Help fix error
            </Button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <div className="bg-muted/50 rounded-md p-3 text-xs leading-relaxed whitespace-pre-wrap">
            {response}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
