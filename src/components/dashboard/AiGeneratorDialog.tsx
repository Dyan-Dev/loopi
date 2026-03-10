import type { AppSettings } from "@app-types/globals";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface AiGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkflowGenerated: (data: {
    nodes: unknown[];
    edges: unknown[];
    name: string;
    description: string;
  }) => void;
}

export function AiGeneratorDialog({
  open,
  onOpenChange,
  onWorkflowGenerated,
}: AiGeneratorDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSettings, setAiSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (open) {
      window.electronAPI?.settings.load().then((saved) => {
        if (saved) setAiSettings(saved);
      });
    }
  }, [open]);

  const isConfigured =
    aiSettings?.aiProvider === "ollama" || aiSettings?.aiApiKey || aiSettings?.aiCredentialId;

  const handleGenerate = async () => {
    if (!prompt.trim() || !aiSettings?.aiProvider) return;

    setLoading(true);
    setError("");

    try {
      const result = await window.electronAPI?.ai.generateWorkflow({
        prompt: prompt.trim(),
        provider: aiSettings.aiProvider,
        ...(aiSettings.aiCredentialId && { credentialId: aiSettings.aiCredentialId }),
        ...(!aiSettings.aiCredentialId && aiSettings.aiApiKey && { apiKey: aiSettings.aiApiKey }),
        ...(aiSettings.aiModel && { model: aiSettings.aiModel }),
        ...(aiSettings.aiProvider === "ollama" && {
          baseUrl: aiSettings.ollamaBaseUrl || "http://localhost:11434",
        }),
      });

      if (!result) {
        setError("Failed to communicate with backend");
        return;
      }

      if (result.success && result.data) {
        onWorkflowGenerated(result.data);
        onOpenChange(false);
        setPrompt("");
        setError("");
      } else {
        setError(result.error || "Generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const providerLabel =
    aiSettings?.aiProvider === "openai"
      ? "OpenAI"
      : aiSettings?.aiProvider === "anthropic"
        ? "Anthropic"
        : aiSettings?.aiProvider === "ollama"
          ? "Ollama"
          : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Workflow Generator</DialogTitle>
          <DialogDescription>
            Describe what you want your automation to do and AI will generate the workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!aiSettings?.aiProvider || !isConfigured ? (
            <div className="rounded-md bg-muted/50 border border-border p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Settings className="h-4 w-4 shrink-0" />
              <span>
                Configure your AI provider in{" "}
                <span className="font-medium text-foreground">Settings &gt; AI</span> first.
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Using <span className="font-medium text-foreground">{providerLabel}</span>
                  {aiSettings.aiModel && (
                    <>
                      {" "}
                      / <span className="font-medium text-foreground">{aiSettings.aiModel}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Describe your workflow</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Navigate to Hacker News, extract the top 5 post titles, and save them to a variable"
                  rows={4}
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || !aiSettings?.aiProvider || !isConfigured}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
