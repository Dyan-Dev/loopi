import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Play,
  Pause,
  Square,
  Plus,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  MoreVertical,
  Calendar,
  Timer,
  Download,
  Upload,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Automation } from "../types/types";
import { exportAutomation, exportAllAutomations, importAutomation, importAllAutomations } from "../utils/automationIO";

interface DashboardProps {
  automations: Automation[];
  onCreateAutomation: () => void;
  onEditAutomation: (automation: Automation) => void;
  onManageCredentials: () => void;
  onUpdateAutomations: (automations: Automation[]) => void;
}

export function Dashboard({
  automations,
  onCreateAutomation,
  onEditAutomation,
  onManageCredentials,
  onUpdateAutomations,
}: DashboardProps) {
  const [executingAutomations, setExecutingAutomations] = useState<Set<string>>(
    new Set()
  );

  const handleImportAutomation = async () => {
    try {
      const automation = await importAutomation();
      onUpdateAutomations([...automations, automation]);
    } catch (error) {
      console.error("Failed to import automation:", error);
      alert("Failed to import automation. Please check the file format.");
    }
  };

  const handleImportAll = async () => {
    try {
      const importedAutomations = await importAllAutomations();
      onUpdateAutomations([...automations, ...importedAutomations]);
    } catch (error) {
      console.error("Failed to import automations:", error);
      alert("Failed to import automations. Please check the file format.");
    }
  };

  const handleExportAll = () => {
    if (automations.length === 0) {
      alert("No automations to export");
      return;
    }
    exportAllAutomations(automations);
  };

  const handleStartAutomation = async (id: string) => {
    setExecutingAutomations((prev) => new Set(prev).add(id));

    // Update automation status
    onUpdateAutomations(
      automations.map((automation) =>
        automation.id === id
          ? { ...automation, status: "running" as const }
          : automation
      )
    );

    // Mock execution - in real app this would trigger backend execution
    setTimeout(
      () => {
        const success = Math.random() > 0.3; // 70% success rate for demo

        onUpdateAutomations(
          automations.map((automation) =>
            automation.id === id
              ? {
                  ...automation,
                  status: "idle" as const,
                  lastRun: {
                    timestamp: new Date(),
                    success,
                    duration: Math.floor(Math.random() * 20000) + 5000,
                  },
                }
              : automation
          )
        );

        setExecutingAutomations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
      3000 + Math.random() * 5000
    );
  };

  const handleStopAutomation = (id: string) => {
    onUpdateAutomations(
      automations.map((automation) =>
        automation.id === id
          ? { ...automation, status: "idle" as const }
          : automation
      )
    );

    setExecutingAutomations((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handlePauseAutomation = (id: string) => {
    onUpdateAutomations(
      automations.map((automation) =>
        automation.id === id
          ? { ...automation, status: "paused" as const }
          : automation
      )
    );
  };

  const handleResumeAutomation = (id: string) => {
    onUpdateAutomations(
      automations.map((automation) =>
        automation.id === id
          ? { ...automation, status: "running" as const }
          : automation
      )
    );
  };

  const formatSchedule = (schedule: Automation["schedule"]) => {
    if (schedule.type === "manual") return "Manual execution only";
    if (schedule.type === "fixed") return `Fixed time: ${schedule.value}`;
    if (schedule.type === "interval") {
      return `Every ${schedule.interval} ${schedule.unit}`;
    }
    return "Not scheduled";
  };

  const formatLastRun = (lastRun?: Automation["lastRun"]) => {
    if (!lastRun) return "Never run";

    const timeAgo = new Date().getTime() - lastRun.timestamp.getTime();
    const minutes = Math.floor(timeAgo / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeStr = "";
    if (days > 0) timeStr = `${days}d ago`;
    else if (hours > 0) timeStr = `${hours}h ago`;
    else timeStr = `${minutes}m ago`;

    return `${timeStr} (${lastRun.duration ? Math.round(lastRun.duration / 1000) : 0}s)`;
  };

  const getStatusBadge = (status: Automation["status"]) => {
    switch (status) {
      case "running":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Running
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 text-yellow-700"
          >
            Paused
          </Badge>
        );
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  const runningCount = automations.filter((a) => a.status === "running").length;
  const totalAutomations = automations.length;
  const successfulRuns = automations.filter((a) => a.lastRun?.success).length;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalAutomations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Currently Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {runningCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Successful Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{successfulRuns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onCreateAutomation} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Automation
        </Button>
        <Button onClick={handleImportAutomation} variant="outline" size="lg">
          <Upload className="h-5 w-5 mr-2" />
          Import
        </Button>
        <Button onClick={handleImportAll} variant="outline" size="lg">
          <Upload className="h-5 w-5 mr-2" />
          Import All
        </Button>
        <Button onClick={handleExportAll} variant="outline" size="lg" disabled={automations.length === 0}>
          <FileDown className="h-5 w-5 mr-2" />
          Export All
        </Button>
        <Button onClick={onManageCredentials} variant="outline" size="lg">
          <Shield className="h-5 w-5 mr-2" />
          Manage Credentials
        </Button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Automations</h2>
          <p className="text-sm text-muted-foreground">
            {totalAutomations} total
          </p>
        </div>

        {automations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">No automations yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by creating your first automation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {automation.name}
                        </CardTitle>
                        {getStatusBadge(automation.status)}
                      </div>
                      <CardDescription>
                        {automation.description}
                      </CardDescription>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEditAutomation(automation)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => exportAutomation(automation)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {automation.status === "idle" && (
                      <Button
                        onClick={() => handleStartAutomation(automation.id)}
                        size="sm"
                        disabled={executingAutomations.has(automation.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {executingAutomations.has(automation.id)
                          ? "Starting..."
                          : "Start"}
                      </Button>
                    )}

                    {automation.status === "running" && (
                      <>
                        <Button
                          onClick={() => handlePauseAutomation(automation.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                        <Button
                          onClick={() => handleStopAutomation(automation.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      </>
                    )}

                    {automation.status === "paused" && (
                      <>
                        <Button
                          onClick={() => handleResumeAutomation(automation.id)}
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                        <Button
                          onClick={() => handleStopAutomation(automation.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Schedule
                      </div>
                      <p>{formatSchedule(automation.schedule)}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Timer className="h-4 w-4" />
                        Last Run
                      </div>
                      <div className="flex items-center gap-1">
                        {automation.lastRun ? (
                          automation.lastRun.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{formatLastRun(automation.lastRun)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Credentials
                      </div>
                      <p>{automation.linkedCredentials.length} linked</p>
                    </div>
                  </div>

                  {automation.status === "running" && (
                    <Alert>
                      <Play className="h-4 w-4" />
                      <AlertDescription>
                        This automation is currently running. You can pause or
                        stop it using the controls above.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
