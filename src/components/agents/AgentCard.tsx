import type { Agent } from "@app-types/agent";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Clock, Play, Square, Trash2 } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (agent: Agent) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60",
  running:
    "bg-emerald-100 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60",
  stopped:
    "bg-muted text-muted-foreground border-border",
  failed:
    "bg-red-100 text-red-700 border-red-200/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60",
};

function displayStatus(agent: Agent): string {
  if (agent.status === "running") return "running";
  if (agent.status === "failed") return "failed";
  if (agent.schedule && agent.schedule.type !== "manual") return "active";
  return "stopped";
}

const CAPABILITY_LABELS: Record<string, string> = {
  browser: "Browser",
  api: "API",
  desktop: "Desktop",
  ai: "AI",
  workflows: "Workflows",
  credentials: "Credentials",
  filesystem: "Files",
};

export function AgentCard({ agent, onStart, onStop, onDelete, onClick }: AgentCardProps) {
  const status = displayStatus(agent);
  const isScheduled = !!agent.schedule && agent.schedule.type !== "manual";
  const workflowCount = agent.workflowIds?.length ?? 0;
  const reflectionCount = agent.reflections?.length ?? 0;

  return (
    <Card
      className="card-premium relative p-5 cursor-pointer overflow-hidden"
      onClick={() => onClick(agent)}
    >
      {status === "running" && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" aria-hidden />
      )}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-serif text-sm shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_-4px_rgba(193,95,54,0.45)]">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate leading-tight">{agent.name}</h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{agent.role}</p>
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] font-medium uppercase tracking-wider border ${STATUS_COLORS[status] || ""}`}>
          {status === "running" && (
            <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
          {status}
        </Badge>
      </div>

      {agent.goal && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.goal}</p>
      )}

      <div className="flex gap-3 text-[10px] text-muted-foreground mb-3">
        <span>
          {workflowCount} workflow{workflowCount === 1 ? "" : "s"}
        </span>
        <span>·</span>
        <span>
          {reflectionCount} reflection{reflectionCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {agent.capabilities.slice(0, 4).map((cap) => (
          <span
            key={cap}
            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
          >
            {CAPABILITY_LABELS[cap] || cap}
          </span>
        ))}
        {agent.capabilities.length > 4 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            +{agent.capabilities.length - 4}
          </span>
        )}
      </div>

      {agent.lastRunAt && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
          <Clock className="h-3 w-3" />
          Last run: {new Date(agent.lastRunAt).toLocaleString()}
        </div>
      )}

      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        {agent.status === "running" || (isScheduled && status === "active") ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1"
            onClick={() => onStop(agent.id)}
          >
            <Square className="h-3 w-3 mr-1" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1"
            onClick={() => onStart(agent.id)}
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(agent.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
