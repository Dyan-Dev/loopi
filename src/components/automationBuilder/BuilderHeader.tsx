import { StoredAutomation } from "@app-types";
import { exportAutomation } from "@utils/automationIO";
import {
  ArrowLeft,
  Bug,
  Download,
  EyeOff,
  Globe,
  Pause,
  Play,
  Save,
  Settings,
  Square,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface BuilderHeaderProps {
  name: string;
  isSaving: boolean;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isBrowserOpen: boolean;
  openBrowser: (url?: string) => Promise<void>;
  closeBrowser: () => Promise<void>;
  isAutomationRunning: boolean;
  runAutomation: (headless?: boolean) => Promise<void>;
  pauseAutomation: () => void;
  stopAutomation: () => void;
  handleSave: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: () => void;
  nodesLength: number;
  currentAutomation?: StoredAutomation;
  isDebugEnabled: boolean;
  setIsDebugEnabled: (v: boolean) => void;
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
  isSaving,
  description,
  setDescription,
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
  isDebugEnabled,
  setIsDebugEnabled,
}) => {
  const [headlessMode, setHeadlessMode] = useState(false);

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
          <Button
            variant={isDebugEnabled ? "default" : "outline"}
            onClick={() => setIsDebugEnabled(!isDebugEnabled)}
            title="Toggle debug mode (Ctrl+Shift+D)"
          >
            <Bug className="h-4 w-4 mr-2" />
            {isDebugEnabled ? "Debug: ON" : "Debug: OFF"}
          </Button>
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
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter automation name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this automation does"
                    rows={3}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {!isBrowserOpen ? (
            <Button variant="outline" onClick={() => openBrowser()}>
              <Globe className="h-4 w-4 mr-2" />
              Open Browser
            </Button>
          ) : (
            <Button variant="outline" onClick={() => closeBrowser()}>
              <Square className="h-4 w-4 mr-2" />
              Close Browser
            </Button>
          )}

          {/* Run Automation Controls with Headless Toggle */}
          {!isAutomationRunning ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                <Label
                  htmlFor="headless-mode"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  {headlessMode && <EyeOff className="h-4 w-4" />}
                  Headless
                </Label>
                <Switch
                  id="headless-mode"
                  checked={headlessMode}
                  onCheckedChange={setHeadlessMode}
                />
              </div>
              <Button
                variant="default"
                onClick={() => runAutomation(headlessMode)}
                disabled={nodesLength === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Run Automation
              </Button>
            </div>
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
          {currentAutomation && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BuilderHeader;
