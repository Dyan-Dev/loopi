import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ArrowLeft, Save, Play, Globe, Pause, Square, Settings, Download } from "lucide-react";
import { exportAutomation } from "../../utils/automationIO";
import type { Automation } from "../../types";

interface BuilderHeaderProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  schedule: any;
  setSchedule: (updater: any) => void;
  isBrowserOpen: boolean;
  openBrowser: () => Promise<void>;
  closeBrowser: () => Promise<void>;
  isAutomationRunning: boolean;
  runAutomation: () => Promise<void>;
  pauseAutomation: () => void;
  stopAutomation: () => void;
  handleSave: () => void;
  onCancel: () => void;
  nodesLength: number;
  currentAutomation?: Automation;
}

/**
 * BuilderHeader - Top toolbar for automation builder
 * 
 * Provides:
 * - Navigation (back to dashboard)
 * - Automation metadata (name, description, schedule)
 * - Browser controls (open/close)
 * - Execution controls (run/pause/stop)
 * - Save and export functionality
 */
export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  name,
  setName,
  description,
  setDescription,
  schedule,
  setSchedule,
  isBrowserOpen,
  openBrowser,
  closeBrowser,
  isAutomationRunning,
  runAutomation,
  pauseAutomation,
  stopAutomation,
  handleSave,
  onCancel,
  nodesLength,
  currentAutomation,
}) => {
  const handleExport = () => {
    if (currentAutomation) {
      exportAutomation(currentAutomation);
    }
  };
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Create Automation</h1>
            <p className="text-sm text-muted-foreground">Design and test your browser automation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Automation Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Automation Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter automation name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this automation does" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select value={schedule.type} onValueChange={(value) => setSchedule((prev: any) => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual only</SelectItem>
                      <SelectItem value="interval">Repeat interval</SelectItem>
                      <SelectItem value="fixed">Fixed time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {schedule.type === "interval" && (
                  <div className="flex gap-2">
                    <Input type="number" value={schedule.interval} onChange={(e) => setSchedule((prev: any) => ({ ...prev, interval: parseInt(e.target.value) || 1 }))} className="flex-1" min="1" />
                    <Select value={schedule.unit} onValueChange={(value) => setSchedule((prev: any) => ({ ...prev, unit: value }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">min</SelectItem>
                        <SelectItem value="hours">hrs</SelectItem>
                        <SelectItem value="days">days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {schedule.type === "fixed" && (
                  <Input type="time" value={schedule.value} onChange={(e) => setSchedule((prev: any) => ({ ...prev, value: e.target.value }))} />
                )}
              </div>
            </DialogContent>
          </Dialog>
          {!isBrowserOpen ? (
            <Button variant="outline" onClick={() => openBrowser()}>
              <Globe className="h-4 w-4 mr-2" />
              Open Browser
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => closeBrowser()}>
                <Square className="h-4 w-4 mr-2" />
                Close Browser
              </Button>
              {!isAutomationRunning ? (
                <Button variant="default" onClick={runAutomation} disabled={nodesLength === 0}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Automation
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={pauseAutomation}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button variant="destructive" onClick={stopAutomation}>
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </>
          )}
          {currentAutomation && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BuilderHeader;
