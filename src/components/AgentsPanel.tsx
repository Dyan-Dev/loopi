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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Agents</h2>
          <p className="text-sm text-muted-foreground">
            AI agents that execute tasks using workflows, APIs, and desktop controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAgents}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No agents yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Create agents to automate complex tasks. Agents can run workflows, make API calls,
            control your desktop, and more. You can also ask Loopi in the Chat tab to create agents
            for you.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Your First Agent
          </Button>
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
