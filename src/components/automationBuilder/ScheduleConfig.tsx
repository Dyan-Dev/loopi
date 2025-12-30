/**
 * Scheduling Configuration Component
 * UI for configuring workflow schedules in the desktop app
 */

import type { ScheduleType } from "@app-types/automation";
import { Clock, PlayCircle, StopCircle } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ScheduleConfigProps {
  schedule?: ScheduleType;
  enabled?: boolean;
  onScheduleChange: (schedule: ScheduleType) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export const ScheduleConfig: React.FC<ScheduleConfigProps> = ({
  schedule,
  enabled = false,
  onScheduleChange,
  onEnabledChange,
}) => {
  const [scheduleType, setScheduleType] = useState<string>(schedule?.type || "manual");
  const [intervalMinutes, setIntervalMinutes] = useState<number>(
    schedule?.type === "interval" ? schedule.intervalMinutes : 60
  );
  const [cronExpression, setCronExpression] = useState<string>(
    schedule?.type === "cron" ? schedule.expression : "0 9 * * *"
  );
  const [onceDateTime, setOnceDateTime] = useState<string>(
    schedule?.type === "once" ? schedule.datetime : ""
  );

  const handleScheduleTypeChange = (type: string) => {
    setScheduleType(type);

    let newSchedule: ScheduleType;

    switch (type) {
      case "manual":
        newSchedule = { type: "manual" };
        break;
      case "interval":
        newSchedule = { type: "interval", intervalMinutes };
        break;
      case "cron":
        newSchedule = { type: "cron", expression: cronExpression };
        break;
      case "once":
        newSchedule = { type: "once", datetime: onceDateTime || new Date().toISOString() };
        break;
      default:
        newSchedule = { type: "manual" };
    }

    onScheduleChange(newSchedule);
  };

  const handleIntervalChange = (value: number) => {
    setIntervalMinutes(value);
    if (scheduleType === "interval") {
      onScheduleChange({ type: "interval", intervalMinutes: value });
    }
  };

  const handleCronChange = (value: string) => {
    setCronExpression(value);
    if (scheduleType === "cron") {
      onScheduleChange({ type: "cron", expression: value });
    }
  };

  const handleOnceChange = (value: string) => {
    setOnceDateTime(value);
    if (scheduleType === "once") {
      onScheduleChange({ type: "once", datetime: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Workflow Schedule
        </CardTitle>
        <CardDescription>Configure when this workflow should run automatically</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schedule Type Selector */}
        <div className="space-y-2">
          <Label>Schedule Type</Label>
          <Select value={scheduleType} onValueChange={handleScheduleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select schedule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual (No Schedule)</SelectItem>
              <SelectItem value="interval">Interval (Every X minutes)</SelectItem>
              <SelectItem value="cron">Cron Expression</SelectItem>
              <SelectItem value="once">Once (Specific date/time)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interval Configuration */}
        {scheduleType === "interval" && (
          <div className="space-y-2">
            <Label>Interval (minutes)</Label>
            <Input
              type="number"
              min={1}
              value={intervalMinutes}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 60)}
              placeholder="60"
            />
            <p className="text-xs text-muted-foreground">
              Workflow will run every {intervalMinutes} minutes
            </p>
          </div>
        )}

        {/* Cron Configuration */}
        {scheduleType === "cron" && (
          <div className="space-y-2">
            <Label>Cron Expression</Label>
            <Input
              value={cronExpression}
              onChange={(e) => handleCronChange(e.target.value)}
              placeholder="0 9 * * *"
            />
            <p className="text-xs text-muted-foreground">
              Example: "0 9 * * *" = Every day at 9:00 AM
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Common patterns:</div>
              <div className="ml-2">
                <div>• "*/15 * * * *" - Every 15 minutes</div>
                <div>• "0 * * * *" - Every hour</div>
                <div>• "0 0 * * *" - Every day at midnight</div>
                <div>• "0 9 * * 1-5" - Weekdays at 9 AM</div>
              </div>
            </div>
          </div>
        )}

        {/* Once Configuration */}
        {scheduleType === "once" && (
          <div className="space-y-2">
            <Label>Date and Time</Label>
            <Input
              type="datetime-local"
              value={onceDateTime ? new Date(onceDateTime).toISOString().slice(0, 16) : ""}
              onChange={(e) => handleOnceChange(new Date(e.target.value).toISOString())}
            />
            <p className="text-xs text-muted-foreground">
              Workflow will run once at the specified time
            </p>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        {scheduleType !== "manual" && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <Label>Schedule Status</Label>
              <p className="text-xs text-muted-foreground">
                {enabled ? "Schedule is active" : "Schedule is paused"}
              </p>
            </div>
            <Button
              variant={enabled ? "destructive" : "default"}
              size="sm"
              onClick={() => onEnabledChange(!enabled)}
            >
              {enabled ? (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
          </div>
        )}

        {/* Current Schedule Summary */}
        {scheduleType !== "manual" && (
          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="font-medium mb-1">Current Schedule:</div>
            <div className="text-muted-foreground">
              {scheduleType === "interval" && `Runs every ${intervalMinutes} minutes`}
              {scheduleType === "cron" && `Cron: ${cronExpression}`}
              {scheduleType === "once" &&
                onceDateTime &&
                `Runs once at ${new Date(onceDateTime).toLocaleString()}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Status: {enabled ? "✓ Active" : "○ Paused"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
