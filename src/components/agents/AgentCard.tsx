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
  idle: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  running: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

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
  const completedTasks = agent.tasks.filter((t) => t.status === "completed").length;
  const totalTasks = agent.tasks.length;

  return (
    <Card
      className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onClick(agent)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
        </div>
        <Badge className={`ml-2 text-xs ${STATUS_COLORS[agent.status] || ""}`}>
          {agent.status}
        </Badge>
      </div>

      {agent.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.description}</p>
      )}

      {totalTasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Tasks</span>
            <span>
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary rounded-full h-1.5 transition-all"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

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
        {agent.status === "running" ? (
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
