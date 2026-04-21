import type { Agent } from "@app-types/agent";
import type { StoredAutomation } from "@app-types/automation";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { ScrollArea } from "@components/ui/scroll-area";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  File,
  FileText,
  FolderOpen,
  Loader2,
  Pencil,
  Play,
  Plus,
  Save,
  SlidersHorizontal,
  Square,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AgentDetailDialogProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onOpenWorkflow?: (automation: StoredAutomation) => void;
}

const LOG_COLORS = {
  info: "text-muted-foreground",
  warn: "text-yellow-600 dark:text-yellow-400",
  error: "text-red-600 dark:text-red-400",
};

const VERDICT_STYLE: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  ok: {
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
    color: "text-green-600 dark:text-green-400",
    label: "ok",
  },
  modify: {
    icon: <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />,
    color: "text-blue-600 dark:text-blue-400",
    label: "modified",
  },
  fail: {
    icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    color: "text-red-600 dark:text-red-400",
    label: "fail",
  },
};

function formatScheduleInfo(
  agent: Agent
): { label: string; detail: string; nextRun?: string } | null {
  if (!agent.schedule || agent.schedule.type === "manual") return null;

  switch (agent.schedule.type) {
    case "interval": {
      const mins = agent.schedule.intervalMinutes || 60;
      const label = mins >= 60 ? `Every ${mins / 60}h` : `Every ${mins}m`;
      const anchor = agent.lastRunAt || agent.createdAt;
      let nextRun: string | undefined;
      if (anchor) {
        const next = new Date(new Date(anchor).getTime() + mins * 60 * 1000);
        nextRun = next > new Date() ? next.toLocaleString() : "Imminent";
      }
      return { label: "Interval", detail: label, nextRun };
    }
    case "cron":
      return { label: "Cron", detail: agent.schedule.expression || "—" };
    case "once": {
      const dt = agent.schedule.datetime;
      return {
        label: "One-time",
        detail: dt ? new Date(dt).toLocaleString() : "—",
        nextRun: dt && new Date(dt) > new Date() ? new Date(dt).toLocaleString() : undefined,
      };
    }
    default:
      return null;
  }
}

export function AgentDetailDialog({
  agent,
  open,
  onClose,
  onStart,
  onStop,
  onOpenWorkflow,
}: AgentDetailDialogProps) {
  const [instructions, setInstructions] = useState<string | null>(null);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");
  const [loadingInstructions, setLoadingInstructions] = useState(false);
  const [savingInstructions, setSavingInstructions] = useState(false);
  const [workflows, setWorkflows] = useState<StoredAutomation[]>([]);
  const [files, setFiles] = useState<Array<{ name: string; size: number; modifiedAt: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileBuffer, setFileBuffer] = useState("");
  const [editingFile, setEditingFile] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [savingFile, setSavingFile] = useState(false);
  const [agentDir, setAgentDir] = useState<string>("");

  useEffect(() => {
    if (open && agent) {
      setLoadingInstructions(true);
      setEditingInstructions(false);
      window.electronAPI?.agents
        .getInstructions(agent.id)
        .then((content) => {
          setInstructions(content);
          setEditBuffer(content || "");
        })
        .catch(() => {
          /* ignore */
        })
        .finally(() => setLoadingInstructions(false));

      const workflowIds = agent.workflowIds || [];
      if (workflowIds.length > 0) {
        window.electronAPI?.tree
          .list()
          .then((all) => {
            const matched = (all || []).filter((w) => workflowIds.includes(w.id));
            setWorkflows(matched);
          })
          .catch(() => {
            /* ignore */
          });
      } else {
        setWorkflows([]);
      }

      // Load agent files and data dir
      reloadFiles(agent.id);
      window.electronAPI?.agents
        .getDir(agent.id)
        .then((dir) => setAgentDir(dir || ""))
        .catch(() => {
          /* ignore */
        });
      setSelectedFile(null);
      setFileContent("");
      setEditingFile(false);
    }
  }, [open, agent?.id]);

  const reloadFiles = (id: string) => {
    window.electronAPI?.agents
      .listFiles(id)
      .then((list) => setFiles(list || []))
      .catch(() => setFiles([]));
  };

  const handleOpenFile = async (filename: string) => {
    if (!agent) return;
    setSelectedFile(filename);
    setEditingFile(false);
    setLoadingFile(true);
    try {
      const content = await window.electronAPI!.agents.readFile(agent.id, filename);
      setFileContent(content);
      setFileBuffer(content);
    } catch (err) {
      toast.error(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSaveFile = async () => {
    if (!agent || !selectedFile) return;
    setSavingFile(true);
    try {
      await window.electronAPI!.agents.writeFile(agent.id, selectedFile, fileBuffer);
      setFileContent(fileBuffer);
      setEditingFile(false);
      reloadFiles(agent.id);
      toast.success("File saved");
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSavingFile(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!agent) return;
    if (!window.confirm(`Delete file "${filename}"?`)) return;
    try {
      await window.electronAPI!.agents.deleteFile(agent.id, filename);
      if (selectedFile === filename) {
        setSelectedFile(null);
        setFileContent("");
      }
      reloadFiles(agent.id);
      toast.success("File deleted");
    } catch (err) {
      toast.error(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleNewFile = async () => {
    if (!agent) return;
    const name = window.prompt("New file name (e.g. notes.txt):");
    if (!name) return;
    try {
      await window.electronAPI!.agents.writeFile(agent.id, name, "");
      reloadFiles(agent.id);
      handleOpenFile(name);
      setEditingFile(true);
      toast.success(`Created "${name}"`);
    } catch (err) {
      toast.error(`Failed to create file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSaveInstructions = async () => {
    if (!agent) return;
    setSavingInstructions(true);
    try {
      await window.electronAPI?.agents.saveInstructions(agent.id, editBuffer);
      setInstructions(editBuffer);
      setEditingInstructions(false);
      toast.success("Instructions saved");
    } catch {
      toast.error("Failed to save instructions");
    } finally {
      setSavingInstructions(false);
    }
  };

  if (!agent) return null;

  const scheduleInfo = formatScheduleInfo(agent);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{agent.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{agent.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{agent.status}</Badge>
              {agent.status === "running" ? (
                <Button size="sm" variant="outline" onClick={() => onStop(agent.id)}>
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              ) : (
                <Button size="sm" onClick={() => onStart(agent.id)}>
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Provider:</span>{" "}
              <span className="font-medium">{agent.model.provider}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Model:</span>{" "}
              <span className="font-medium">{agent.model.model}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              <span className="font-medium">{new Date(agent.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Capabilities:</span>{" "}
              <span className="font-medium">{agent.capabilities.join(", ")}</span>
            </div>
            {agent.lastRunAt && (
              <div>
                <span className="text-muted-foreground">Last Run:</span>{" "}
                <span className="font-medium">{new Date(agent.lastRunAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Schedule Info */}
          {scheduleInfo && (
            <div className="flex items-start gap-2 p-2.5 rounded-md border bg-muted/30">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-muted-foreground">Schedule:</span>{" "}
                  <span className="font-medium">{scheduleInfo.label}</span>
                  {" — "}
                  <span className="font-mono">{scheduleInfo.detail}</span>
                </div>
                {scheduleInfo.nextRun && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Clock className="h-3 w-3" />
                    <span>Next run: {scheduleInfo.nextRun}</span>
                  </div>
                )}
                {!scheduleInfo.nextRun && agent.status !== "running" && (
                  <div className="text-muted-foreground">Schedule active</div>
                )}
              </div>
            </div>
          )}

          {!scheduleInfo && (
            <div className="flex items-center gap-2 p-2.5 rounded-md border bg-muted/30 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              Manual trigger only — no schedule configured
            </div>
          )}

          {/* Linked Workflows */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5" />
              Workflows ({agent.workflowIds?.length ?? 0})
            </h4>
            {(agent.workflowIds?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground rounded-md border bg-muted/30 p-2">
                No workflows linked to this agent. Ask Loopi to create one or attach an existing
                workflow.
              </p>
            ) : workflows.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-md border bg-muted/30 p-2">
                {agent.workflowIds.length} workflow
                {agent.workflowIds.length === 1 ? "" : "s"} linked but not found in storage (they
                may have been deleted).
              </p>
            ) : (
              <div className="space-y-1.5">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="flex items-center justify-between p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{wf.name}</p>
                      {wf.description && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {wf.description}
                        </p>
                      )}
                    </div>
                    {onOpenWorkflow && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                        onClick={() => {
                          onClose();
                          onOpenWorkflow(wf);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open in Builder
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions File */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Instructions
              </h4>
              {!editingInstructions ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditBuffer(instructions || "");
                    setEditingInstructions(true);
                  }}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setEditingInstructions(false)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSaveInstructions}
                    disabled={savingInstructions}
                  >
                    {savingInstructions ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
            {loadingInstructions ? (
              <div className="flex items-center justify-center h-24 border rounded bg-muted/30">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : editingInstructions ? (
              <textarea
                className="w-full h-40 rounded border bg-background p-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                value={editBuffer}
                onChange={(e) => setEditBuffer(e.target.value)}
                spellCheck={false}
              />
            ) : (
              <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
                {instructions ? (
                  <pre className="text-[10px] font-mono whitespace-pre-wrap">{instructions}</pre>
                ) : (
                  <p className="text-xs text-muted-foreground">No instructions file</p>
                )}
              </ScrollArea>
            )}
          </div>

          {/* Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" />
                Files ({files.length})
              </h4>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleNewFile}>
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
            {agentDir && (
              <p
                className="text-[10px] text-muted-foreground mb-1 font-mono truncate"
                title={agentDir}
              >
                {agentDir}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mb-1">
              Use <code className="px-1 rounded bg-muted">{"{{agentDataDir}}"}</code> in workflows
              to reference this folder
            </p>
            {files.length === 0 ? (
              <div className="rounded border bg-muted/30 p-2 text-xs text-muted-foreground">
                No files yet. Agent workflows can create files here using{" "}
                <code className="px-1 rounded bg-muted">{"{{agentDataDir}}"}</code>.
              </div>
            ) : (
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2">
                <ScrollArea className="h-40 rounded border bg-muted/30">
                  <div className="p-1">
                    {files.map((f) => (
                      <div
                        key={f.name}
                        className={`flex items-center justify-between gap-1 px-1.5 py-1 rounded text-xs cursor-pointer group ${
                          selectedFile === f.name ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => handleOpenFile(f.name)}
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <File className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(f.name);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="rounded border bg-muted/30 flex flex-col h-40">
                  {!selectedFile ? (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      Select a file to view
                    </div>
                  ) : loadingFile ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-2 py-1 border-b text-[10px]">
                        <span className="font-mono truncate">{selectedFile}</span>
                        {!editingFile ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 text-[10px] px-1.5"
                            onClick={() => {
                              setFileBuffer(fileContent);
                              setEditingFile(true);
                            }}
                          >
                            <Pencil className="h-2.5 w-2.5 mr-0.5" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 text-[10px] px-1.5"
                              onClick={() => setEditingFile(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-5 text-[10px] px-1.5"
                              onClick={handleSaveFile}
                              disabled={savingFile}
                            >
                              {savingFile ? (
                                <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />
                              ) : (
                                <Save className="h-2.5 w-2.5 mr-0.5" />
                              )}
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingFile ? (
                        <textarea
                          className="flex-1 w-full bg-background p-2 text-[10px] font-mono resize-none focus:outline-none"
                          value={fileBuffer}
                          onChange={(e) => setFileBuffer(e.target.value)}
                          spellCheck={false}
                        />
                      ) : (
                        <ScrollArea className="flex-1">
                          <pre className="p-2 text-[10px] font-mono whitespace-pre-wrap">
                            {fileContent || <span className="text-muted-foreground">(empty)</span>}
                          </pre>
                        </ScrollArea>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Goal */}
          <div>
            <h4 className="text-sm font-medium mb-2">Goal</h4>
            <div className="rounded border bg-muted/30 p-2 text-xs whitespace-pre-wrap">
              {agent.goal ? (
                agent.goal
              ) : (
                <span className="text-muted-foreground">No goal defined</span>
              )}
            </div>
          </div>

          {/* Reflections */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Reflections ({agent.reflections?.length ?? 0})
            </h4>
            <ScrollArea className="h-40 rounded border p-2">
              {!agent.reflections || agent.reflections.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No reflections yet. The agent will reflect after each workflow run.
                </p>
              ) : (
                <div className="space-y-2">
                  {agent.reflections
                    .slice()
                    .reverse()
                    .map((r, i) => {
                      const style = VERDICT_STYLE[r.verdict] || VERDICT_STYLE.ok;
                      return (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <div className="mt-0.5">{style.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${style.color}`}>{style.label}</span>
                              {r.workflowName && (
                                <span className="text-muted-foreground truncate">
                                  · {r.workflowName}
                                </span>
                              )}
                              {r.patchApplied && (
                                <Badge variant="outline" className="text-[9px] py-0 px-1">
                                  patch applied
                                </Badge>
                              )}
                              {r.rolledBack && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] py-0 px-1 text-red-500"
                                >
                                  rolled back
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] whitespace-pre-wrap">{r.reason}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(r.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Logs */}
          <div className="flex-1 min-h-0">
            <h4 className="text-sm font-medium mb-2">Logs</h4>
            <ScrollArea className="h-40 rounded border bg-muted/30 p-2">
              {agent.logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No logs yet</p>
              ) : (
                <div className="space-y-1 font-mono">
                  {agent.logs
                    .slice()
                    .reverse()
                    .map((log, i) => (
                      <div key={i} className={`text-[10px] ${LOG_COLORS[log.level]}`}>
                        <span className="opacity-60">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>{" "}
                        [{log.level.toUpperCase()}] {log.message}
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
