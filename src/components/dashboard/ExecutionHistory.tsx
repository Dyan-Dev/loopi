import type { ExecutionRecord } from "@app-types/automation";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Ban, CheckCircle2, ChevronDown, ChevronRight, Clock, Trash2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ExecutionHistoryProps {
  automationId?: string;
}

export function ExecutionHistory({ automationId }: ExecutionHistoryProps) {
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = automationId
        ? await window.electronAPI?.history.getByAutomation(automationId)
        : await window.electronAPI?.history.getAll();
      setRecords(data || []);
    } catch (err) {
      console.error("Failed to fetch execution history:", err);
    } finally {
      setLoading(false);
    }
  }, [automationId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDeleteRecord = async (record: ExecutionRecord) => {
    try {
      await window.electronAPI?.history.deleteRecord(record.automationId, record.id);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      toast.success("Execution record deleted");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const handleClearAll = async () => {
    try {
      if (automationId) {
        await window.electronAPI?.history.deleteByAutomation(automationId);
      } else {
        await window.electronAPI?.history.clearAll();
      }
      setRecords([]);
      toast.success("Execution history cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (ts: string): string => {
    try {
      const date = new Date(ts);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading execution history...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Execution History</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {records.length} record{records.length !== 1 ? "s" : ""}
          </span>
          {records.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-2">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No execution history yet. Run an automation to see results here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {records.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <Card key={record.id} className="overflow-hidden">
                <CardHeader
                  className="py-3 px-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}

                      {record.cancelled ? (
                        <Ban className="h-4 w-4 text-yellow-500" />
                      ) : record.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}

                      <div>
                        <CardTitle className="text-sm font-medium">
                          {record.automationName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(record.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          record.cancelled
                            ? "secondary"
                            : record.success
                              ? "default"
                              : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {record.cancelled ? "Cancelled" : record.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(record.duration)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {record.stepCount} step{record.stepCount !== 1 ? "s" : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(record);
                        }}
                        title="Delete record"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="px-4 pb-3 pt-0">
                    {record.error && (
                      <div className="mb-3 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                        {record.error}
                      </div>
                    )}

                    {record.steps.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Step Execution Log
                        </p>
                        {record.steps.map((step, i) => (
                          <div
                            key={`${step.nodeId}-${i}`}
                            className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-muted/50"
                          >
                            {step.status === "success" ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                            )}
                            <code className="text-muted-foreground">{step.stepType}</code>
                            <span className="text-muted-foreground/60 truncate">{step.nodeId}</span>
                            {step.error && (
                              <span className="text-red-500 truncate ml-auto">{step.error}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No step details recorded.</p>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
