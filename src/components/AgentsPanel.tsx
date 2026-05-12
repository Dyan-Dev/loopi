import type { Agent } from "@app-types/agent";
import type { StoredAutomation } from "@app-types/automation";
import { Bot, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AgentCard } from "./agents/AgentCard";
import { AgentDetailDialog } from "./agents/AgentDetailDialog";
import { CreateAgentDialog } from "./agents/CreateAgentDialog";
import { Button } from "./ui/button";

interface AgentsPanelProps {
  onOpenWorkflow?: (automation: StoredAutomation) => void;
}

export function AgentsPanel({ onOpenWorkflow }: AgentsPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadAgents = useCallback(async () => {
    try {
      const list = await window.electronAPI?.agents.list();
      setAgents(list || []);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleCreate = async (
    config: Parameters<NonNullable<typeof window.electronAPI>["agents"]["create"]>[0]
  ) => {
    try {
      const agent = await window.electronAPI!.agents.create(config);
      toast.success(`Agent "${agent.name}" created`);
      loadAgents();
    } catch (err) {
      toast.error(`Failed to create agent: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleStart = async (id: string) => {
    try {
      toast.info("Starting agent...");
      await window.electronAPI!.agents.start(id);
      toast.success("Agent started");
      loadAgents();
    } catch (err) {
      toast.error(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
      loadAgents();
    }
  };

  const handleStop = async (id: string) => {
    try {
      await window.electronAPI!.agents.stop(id);
      toast.success("Agent stopped");
      loadAgents();
    } catch (err) {
      toast.error(`Failed to stop: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await window.electronAPI!.agents.delete(id);
      toast.success("Agent deleted");
      if (selectedAgent?.id === id) {
        setDetailOpen(false);
        setSelectedAgent(null);
      }
      loadAgents();
    } catch (err) {
      toast.error(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleClickAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setDetailOpen(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 sm:p-7 mb-6 grain">
        <div className="absolute inset-0 mesh-warm opacity-35 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary mb-3">
              <span className="w-5 h-px bg-primary/60" />
              Agents
            </span>
            <h2 className="font-serif text-3xl leading-[1.05] tracking-tight mb-2">
              Goal‑driven workers that{" "}
              <em className="not-italic ink-gradient">patch themselves</em>.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI agents that execute tasks using workflows, APIs, and desktop controls. Reflection rewrites failing workflows in place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadAgents} className="backdrop-blur bg-card/80">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 py-20 text-center grain">
          <div className="absolute inset-0 surface-dotted opacity-25 pointer-events-none" aria-hidden />
          <div className="relative flex flex-col items-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" aria-hidden />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(193,95,54,0.5)]">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="font-serif text-xl mb-2">No agents yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
              Create agents to automate complex tasks. Agents can run workflows, make API calls,
              control your desktop, and more. You can also ask Loopi in the Chat tab to create agents
              for you.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Your First Agent
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
              onClick={handleClickAgent}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateAgentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <AgentDetailDialog
        agent={selectedAgent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStart={handleStart}
        onStop={handleStop}
        onOpenWorkflow={onOpenWorkflow}
      />
    </div>
  );
}
