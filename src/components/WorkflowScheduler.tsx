/**
 * Workflow Scheduler Component
 * Dedicated interface for scheduling workflow executions
 * Allows multiple schedules per workflow with different configurations
 */

import type { ScheduleType, StoredAutomation } from "@app-types/automation";
import type { WorkflowSchedule } from "@app-types/globals";
import { Calendar, Clock, PauseCircle, PlayCircle, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ScheduleConfig } from "./automationBuilder/ScheduleConfig";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface WorkflowSchedulerProps {
  automations: StoredAutomation[];
}

export const WorkflowScheduler: React.FC<WorkflowSchedulerProps> = ({ automations }) => {
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [newSchedule, setNewSchedule] = useState<ScheduleType>({ type: "manual" });
  const [newEnabled, setNewEnabled] = useState(true);
  const [newHeadless, setNewHeadless] = useState(true);

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const savedSchedules = await window.electronAPI?.schedules.list();
      if (savedSchedules) {
        setSchedules(savedSchedules);
      }
    } catch (error) {
      console.error("Failed to load schedules:", error);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedWorkflowId || newSchedule.type === "manual") {
      return;
    }

    const workflow = automations.find((a) => a.id === selectedWorkflowId);
    if (!workflow) return;

    const schedule: WorkflowSchedule = {
      id: `schedule_${Date.now()}`,
      workflowId: selectedWorkflowId,
      workflowName: workflow.name,
      schedule: newSchedule,
      enabled: newEnabled,
      headless: newHeadless,
      createdAt: new Date().toISOString(),
    };

    try {
      await window.electronAPI?.schedules.save(schedule);
      setSchedules([...schedules, schedule]);
      setIsDialogOpen(false);
      setSelectedWorkflowId("");
      setNewSchedule({ type: "manual" });
      setNewEnabled(true);
      setNewHeadless(true);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert("Failed to save schedule");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await window.electronAPI?.schedules.delete(scheduleId);
      setSchedules(schedules.filter((s) => s.id !== scheduleId));
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("Failed to delete schedule");
    }
  };

  const handleToggleEnabled = async (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newEnabled = !schedule.enabled;

    try {
      await window.electronAPI?.schedules.update(scheduleId, { enabled: newEnabled });
      setSchedules(schedules.map((s) => (s.id === scheduleId ? { ...s, enabled: newEnabled } : s)));
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("Failed to update schedule");
    }
  };

  const getScheduleDescription = (schedule: ScheduleType): string => {
    switch (schedule.type) {
      case "interval":
        return `Every ${schedule.intervalMinutes} minutes`;
      case "cron":
        return `Cron: ${schedule.expression}`;
      case "once":
        return `Once at ${new Date(schedule.datetime).toLocaleString()}`;
      case "manual":
        return "Manual";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Scheduler</h1>
          <p className="text-muted-foreground mt-2">
            Schedule workflows to run automatically at specific times or intervals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Select a workflow and configure when it should run automatically
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Workflow Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Workflow</label>
                <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workflow to schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {automations.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No workflows available. Create a workflow first.
                      </div>
                    ) : (
                      automations.map((automation) => (
                        <SelectItem key={automation.id} value={automation.id}>
                          {automation.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Configuration */}
              {selectedWorkflowId && (
                <>
                  <ScheduleConfig
                    schedule={newSchedule}
                    enabled={newEnabled}
                    onScheduleChange={setNewSchedule}
                    onEnabledChange={setNewEnabled}
                  />

                  {/* Headless Mode Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Headless Mode</label>
                      <p className="text-xs text-muted-foreground">
                        Run browser in background (no visible window)
                      </p>
                    </div>
                    <Switch checked={newHeadless} onCheckedChange={setNewHeadless} />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSchedule}
                  disabled={!selectedWorkflowId || newSchedule.type === "manual"}
                >
                  Create Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Schedules Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first schedule to automate workflow execution. You can schedule the same
              workflow multiple times with different configurations.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Schedules</CardTitle>
            <CardDescription>
              {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.workflowName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {getScheduleDescription(schedule.schedule)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.enabled ? "default" : "secondary"}>
                        {schedule.enabled ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{schedule.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEnabled(schedule.id)}
                          title={schedule.enabled ? "Pause schedule" : "Resume schedule"}
                        >
                          {schedule.enabled ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          title="Delete schedule"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowScheduler;
