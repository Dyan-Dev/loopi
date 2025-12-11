import { Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  data?: unknown;
  duration?: number;
}

const getLevelColor = (level: string): string => {
  const isDark = document.documentElement.classList.contains("dark");

  if (isDark) {
    // Dark mode colors
    switch (level) {
      case "DEBUG":
        return "text-indigo-400";
      case "INFO":
        return "text-blue-400";
      case "WARN":
        return "text-yellow-400";
      case "ERROR":
        return "text-red-400";
      default:
        return "text-green-400";
    }
  } else {
    // Light mode colors
    switch (level) {
      case "DEBUG":
        return "text-indigo-600";
      case "INFO":
        return "text-blue-600";
      case "WARN":
        return "text-amber-600";
      case "ERROR":
        return "text-red-600";
      default:
        return "text-green-600";
    }
  }
};

interface DebugLogsPanelProps {
  isDebugEnabled: boolean;
}

/**
 * DebugLogsPanel - Displays real-time debug logs in split-screen view
 * Shows on the right side of the automation builder when debug mode is enabled
 */
export function DebugLogsPanel({ isDebugEnabled }: DebugLogsPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logStats, setLogStats] = useState<Record<string, number>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect theme changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Show status message for 3 seconds then hide
  useEffect(() => {
    if (exportStatus.show) {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      statusTimeoutRef.current = setTimeout(() => {
        setExportStatus({ ...exportStatus, show: false });
      }, 3000);
    }
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [exportStatus.show]);

  // Poll for logs when debug is enabled
  useEffect(() => {
    if (!isDebugEnabled) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const loadLogs = async () => {
      try {
        const logsData = await window.electronAPI?.debug?.getLogs();
        setLogs((logsData as LogEntry[]) || []);
        const stats = await window.electronAPI?.debug?.getStatistics();
        setLogStats((stats as Record<string, number>) || {});
      } catch (error) {
        console.error("Failed to load logs:", error);
      }
    };

    // Initial load
    loadLogs();

    // Poll for new logs every 500ms
    pollIntervalRef.current = setInterval(loadLogs, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isDebugEnabled]);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClearLogs = async () => {
    try {
      await window.electronAPI?.debug?.clearLogs();
      setLogs([]);
      setLogStats({});
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  const handleExportLogs = async () => {
    try {
      const logsJson = await window.electronAPI?.debug?.exportLogs();
      if (!logsJson) {
        setExportStatus({
          show: true,
          message: "Failed to export logs: No logs available",
          type: "error",
        });
        return;
      }

      // Get download path from settings
      const settings = await window.electronAPI?.settings?.load();
      const downloadPath = settings?.downloadPath;

      if (!downloadPath) {
        setExportStatus({
          show: true,
          message: "Download path not set. Please configure it in Settings.",
          type: "error",
        });
        return;
      }

      // Use IPC to save file to the configured download path
      const filename = `loopi-debug-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      const success = await window.electronAPI?.saveFile?.({
        filePath: `${downloadPath}/${filename}`,
        content: logsJson,
      });

      if (success) {
        setExportStatus({
          show: true,
          message: `Logs exported successfully to Downloads: ${filename}`,
          type: "success",
        });
      } else {
        setExportStatus({
          show: true,
          message: "Failed to save logs to downloads folder",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Failed to export logs:", error);
      setExportStatus({
        show: true,
        message: `Failed to export logs: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    }
  };

  if (!isDebugEnabled) {
    return null;
  }

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden border-l ${
        isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
      }`}
    >
      {/* Export Status Message */}
      {exportStatus.show && (
        <div
          className={`px-3 py-2 text-sm font-medium ${
            exportStatus.type === "success"
              ? isDarkMode
                ? "bg-green-900/30 text-green-300 border-b border-green-700/50"
                : "bg-green-100 text-green-800 border-b border-green-300"
              : isDarkMode
                ? "bg-red-900/30 text-red-300 border-b border-red-700/50"
                : "bg-red-100 text-red-800 border-b border-red-300"
          }`}
        >
          {exportStatus.message}
        </div>
      )}
      {/* Header */}
      <div
        className={`shrink-0 border-b p-3 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Debug Logs
          </h3>
          <div className="flex gap-1">
            <Button
              onClick={handleExportLogs}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              title="Export logs as JSON"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={handleClearLogs}
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs ${
                isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"
              }`}
              title="Clear all logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {Object.keys(logStats).length > 0 && (
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div
              className={`p-1.5 rounded border ${
                isDarkMode ? "bg-blue-900/30 border-blue-700/50" : "bg-blue-100 border-blue-300"
              }`}
            >
              <div className={`font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                {logStats.total || 0}
              </div>
              <div className={`text-xs ${isDarkMode ? "text-blue-400/70" : "text-blue-600"}`}>
                Total
              </div>
            </div>
            <div
              className={`p-1.5 rounded border ${
                isDarkMode
                  ? "bg-indigo-900/30 border-indigo-700/50"
                  : "bg-indigo-100 border-indigo-300"
              }`}
            >
              <div
                className={`font-semibold ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}
              >
                {logStats.debug || 0}
              </div>
              <div className={`text-xs ${isDarkMode ? "text-indigo-400/70" : "text-indigo-600"}`}>
                Debug
              </div>
            </div>
            <div
              className={`p-1.5 rounded border ${
                isDarkMode ? "bg-amber-900/30 border-amber-700/50" : "bg-amber-100 border-amber-300"
              }`}
            >
              <div className={`font-semibold ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}>
                {logStats.warn || 0}
              </div>
              <div className={`text-xs ${isDarkMode ? "text-amber-400/70" : "text-amber-600"}`}>
                Warn
              </div>
            </div>
            <div
              className={`p-1.5 rounded border ${
                isDarkMode ? "bg-red-900/30 border-red-700/50" : "bg-red-100 border-red-300"
              }`}
            >
              <div className={`font-semibold ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                {logStats.error || 0}
              </div>
              <div className={`text-xs ${isDarkMode ? "text-red-400/70" : "text-red-600"}`}>
                Error
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Container */}
      <div
        ref={logContainerRef}
        className={`flex-1 overflow-y-auto font-mono text-xs p-3 space-y-1 ${
          isDarkMode ? "bg-black text-green-400" : "bg-slate-100 text-slate-900"
        }`}
      >
        {logs.length === 0 ? (
          <div className={isDarkMode ? "text-slate-500" : "text-slate-500"}>
            Waiting for automation to run...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap word-wrap break-all">
              <span className={getLevelColor(log.level)}>
                [{log.timestamp}] [{log.level}] [{log.category}]
              </span>{" "}
              {log.message}
              {log.duration !== undefined && (
                <span className={isDarkMode ? "text-yellow-400" : "text-amber-600"}>
                  {" "}
                  ({log.duration.toFixed(2)}ms)
                </span>
              )}
              {log.data && (
                <div className={`ml-4 mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>
                  {JSON.stringify(log.data, null, 2)
                    .split("\n")
                    .map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default DebugLogsPanel;
