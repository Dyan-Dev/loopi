import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface VariableInspectorProps {
  isRunning: boolean;
  onClose: () => void;
}

/**
 * VariableInspector - Live variable state viewer for debugging workflows
 *
 * Shows all current variables during and after execution.
 * Auto-refreshes while automation is running, manual refresh otherwise.
 */
export function VariableInspector({ isRunning, onClose }: VariableInspectorProps) {
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const fetchVariables = useCallback(async () => {
    try {
      setLoading(true);
      const vars = await window.electronAPI?.getVariables();
      if (vars) setVariables(vars);
    } catch (err) {
      console.error("Failed to fetch variables:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh while running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(fetchVariables, 1000);
    return () => clearInterval(interval);
  }, [isRunning, fetchVariables]);

  // Fetch on mount and when execution stops
  useEffect(() => {
    fetchVariables();
  }, [isRunning, fetchVariables]);

  const formatValue = (value: unknown): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return value.length > 200 ? `${value.slice(0, 200)}...` : value;
    try {
      const json = JSON.stringify(value, null, 2);
      return json.length > 500 ? `${json.slice(0, 500)}...` : json;
    } catch {
      return String(value);
    }
  };

  const getTypeBadge = (value: unknown) => {
    if (value === null) return "null";
    if (Array.isArray(value)) return `array[${value.length}]`;
    return typeof value;
  };

  const entries = Object.entries(variables);

  return (
    <div className="h-full flex flex-col bg-card border-b border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Variables</h3>
          {isRunning && (
            <Badge variant="secondary" className="text-[10px] animate-pulse">
              Live
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {entries.length} variable{entries.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={fetchVariables}
            disabled={loading}
            title="Refresh variables"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} title="Close">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
            {isRunning
              ? "Waiting for variables..."
              : "No variables yet. Run an automation to see variable state."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map(([key, value]) => (
              <div key={key} className="px-3 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-semibold text-primary">{key}</code>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {getTypeBadge(value)}
                  </Badge>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono leading-relaxed">
                  {formatValue(value)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VariableInspector;
