import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  Globe,
  Mouse,
  Type,
  Clock,
  Camera,
  Download,
  GripVertical,
  Shield,
  Eye,
  EyeOff,
  Target,
  Zap,
  Pause,
  Square,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { Automation, AutomationStep, Credential } from "../app";

interface AutomationBuilderProps {
  automation: Automation | null;
  credentials: Credential[];
  onSave: (automation: Automation) => void;
  onCancel: () => void;
}

export function AutomationBuilder({
  automation,
  credentials,
  onSave,
  onCancel,
}: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [schedule, setSchedule] = useState({
    type: "manual" as "interval" | "fixed" | "manual",
    interval: 30,
    unit: "minutes" as "minutes" | "hours" | "days",
    value: "09:00",
  });
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description);
      setSteps(automation.steps);
      if (automation.schedule.type !== "manual") {
        setSchedule({
          type: automation.schedule.type,
          interval: automation.schedule.interval || 30,
          unit: automation.schedule.unit || "minutes",
          value: automation.schedule.value || "09:00",
        });
      }
    }
  }, [automation]);

  const stepTypes = [
    {
      value: "navigate",
      label: "Navigate",
      icon: Globe,
      description: "Go to a URL",
    },
    {
      value: "click",
      label: "Click",
      icon: Mouse,
      description: "Click an element",
    },
    { value: "type", label: "Type", icon: Type, description: "Enter text" },
    {
      value: "wait",
      label: "Wait",
      icon: Clock,
      description: "Wait for a duration",
    },
    {
      value: "screenshot",
      label: "Screenshot",
      icon: Camera,
      description: "Take a screenshot",
    },
    {
      value: "extract",
      label: "Extract",
      icon: Download,
      description: "Extract data",
    },
  ];

  const addStep = (type: AutomationStep["type"]) => {
    const newStep: AutomationStep = {
      id: Date.now().toString(),
      type,
      description: `${stepTypes.find((s) => s.value === type)?.label} step`,
      selector: type === "navigate" ? "" : "body",
      value: type === "navigate" ? "https://" : "",
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<AutomationStep>) => {
    setSteps(
      steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const index = steps.findIndex((step) => step.id === stepId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];
    setSteps(newSteps);
  };

  const handleSave = () => {
    const automationData: Automation = {
      id: automation?.id || Date.now().toString(),
      name,
      description,
      status: "idle",
      steps,
      schedule:
        schedule.type === "manual"
          ? { type: "manual" }
          : schedule.type === "fixed"
            ? { type: "fixed", value: schedule.value }
            : {
                type: "interval",
                interval: schedule.interval,
                unit: schedule.unit,
              },
      linkedCredentials: steps
        .filter((step) => step.credentialId)
        .map((step) => step.credentialId!)
        .filter((id, index, arr) => arr.indexOf(id) === index),
      lastRun: automation?.lastRun,
    };

    onSave(automationData);
  };

  const openBrowser = async () => {
    try {
      await (window as any).electronAPI.openBrowser("https://google.com");
      setIsBrowserOpen(true);
      console.log("Browser opened via Electron");
    } catch (err) {
      console.error("Failed to open browser", err);
    }
  };

  const closeBrowser = async () => {
    await (window as any).electronAPI.closeBrowser();
    setIsBrowserOpen(false);
    setIsAutomationRunning(false);
    setCurrentStepIndex(-1);
    console.log("Browser closed");
  };

  const executeStep = async (step: AutomationStep, index: number) => {
    setCurrentStepIndex(index);
    try {
      await (window as any).electronAPI.runStep(step);
    } catch (err) {
      console.error("Step execution failed:", err);
    }
  };

  const runAutomation = async () => {
    if (steps.length === 0) {
      alert("No steps to execute");
      return;
    }

    if (!isBrowserOpen) {
      await openBrowser();
    }

    setIsAutomationRunning(true);
    setCurrentStepIndex(-1);

    try {
      for (let i = 0; i < steps.length; i++) {
        await executeStep(steps[i], i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      alert("Automation completed successfully!");
    } catch (error) {
      console.error("Automation failed:", error);
      alert("Automation failed. Check console for details.");
    } finally {
      setIsAutomationRunning(false);
      setCurrentStepIndex(-1);
    }
  };

  const pauseAutomation = () => {
    setIsAutomationRunning(false);
    console.log("Automation paused");
  };

  const stopAutomation = () => {
    setIsAutomationRunning(false);
    setCurrentStepIndex(-1);
    console.log("Automation stopped");
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {automation ? "Edit Automation" : "Create Automation"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Design and test your browser automation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isBrowserOpen ? (
              <Button variant="outline" onClick={openBrowser}>
                <Globe className="h-4 w-4 mr-2" />
                Open Browser
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeBrowser}>
                  <Square className="h-4 w-4 mr-2" />
                  Close Browser
                </Button>
                {!isAutomationRunning ? (
                  <Button
                    variant="default"
                    onClick={runAutomation}
                    disabled={steps.length === 0}
                  >
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
            <Button onClick={handleSave} disabled={!name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Steps List */}
        <div className="flex-1 flex flex-col bg-muted/30 p-4">
          <div className="flex-1 overflow-y-auto space-y-3">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="space-y-2">
                  <Plus className="h-8 w-8 mx-auto" />
                  <p className="text-sm">No steps yet</p>
                  <p className="text-xs">Add steps to build your automation</p>
                </div>
              </div>
            ) : (
              steps.map((step, index) => {
                const stepType = stepTypes.find((s) => s.value === step.type);
                const isCurrentStep = currentStepIndex === index;
                const isCompleted = currentStepIndex > index;
                return (
                  <Card
                    key={step.id}
                    className={`relative ${
                      isCurrentStep
                        ? "ring-2 ring-primary bg-primary/5"
                        : isCompleted
                          ? "bg-green-50 border-green-200"
                          : ""
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge
                            variant={
                              isCurrentStep
                                ? "default"
                                : isCompleted
                                  ? "secondary"
                                  : "outline"
                            }
                            className={`text-xs ${
                              isCurrentStep
                                ? "bg-primary"
                                : isCompleted
                                  ? "bg-green-100 text-green-800"
                                  : ""
                            }`}
                          >
                            {index + 1}
                          </Badge>
                          {stepType && <stepType.icon className="h-4 w-4" />}
                          <span className="text-sm font-medium">
                            {stepType?.label}
                          </span>
                          {isCurrentStep && isAutomationRunning && (
                            <Badge
                              variant="default"
                              className="bg-blue-100 text-blue-800 text-xs"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Running
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 text-xs"
                            >
                              ✓ Done
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, "up")}
                            disabled={
                              index === 0 || index === 1 || isAutomationRunning
                            }
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, "down")}
                            disabled={
                              index === steps.length - 1 ||
                              isAutomationRunning ||
                              index === 0
                            }
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                            disabled={isAutomationRunning || index === 0}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={step.description}
                          onChange={(e) =>
                            updateStep(step.id, {
                              description: e.target.value,
                            })
                          }
                          className="text-xs"
                          placeholder="Step description"
                          disabled={isAutomationRunning}
                        />
                      </div>
                      {step.type === "navigate" && (
                        <div className="space-y-2">
                          <Label className="text-xs">URL</Label>
                          <Input
                            value={step.value || ""}
                            onChange={(e) =>
                              updateStep(step.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="https://google.com"
                            className="text-xs"
                            disabled={isAutomationRunning}
                          />
                        </div>
                      )}
                      {(step.type === "click" ||
                        step.type === "type" ||
                        step.type === "extract") && (
                        <div className="space-y-2">
                          <Label className="text-xs">CSS Selector</Label>
                          <Input
                            value={step.selector || ""}
                            onChange={(e) =>
                              updateStep(step.id, {
                                selector: e.target.value,
                              })
                            }
                            placeholder="button, .class, #id"
                            className="text-xs"
                            disabled={isAutomationRunning}
                          />
                        </div>
                      )}
                      {step.type === "type" && (
                        <div className="space-y-2">
                          <Label className="text-xs">Text to Type</Label>
                          <Input
                            value={step.value || ""}
                            onChange={(e) =>
                              updateStep(step.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Text to enter"
                            className="text-xs"
                            disabled={isAutomationRunning}
                          />
                          {credentials.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs">
                                Or use credential
                              </Label>
                              <Select
                                value={step.credentialId || ""}
                                onValueChange={(value) =>
                                  updateStep(step.id, {
                                    credentialId: value || undefined,
                                  })
                                }
                                disabled={isAutomationRunning}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Select credential" />
                                </SelectTrigger>
                                <SelectContent>
                                  {credentials.map((cred) => (
                                    <SelectItem key={cred.id} value={cred.id}>
                                      <div className="flex items-center gap-2">
                                        <Shield className="h-3 w-3" />
                                        {cred.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                      {step.type === "wait" && (
                        <div className="space-y-2">
                          <Label className="text-xs">Duration (seconds)</Label>
                          <Input
                            type="number"
                            value={step.value || "1"}
                            onChange={(e) =>
                              updateStep(step.id, {
                                value: e.target.value,
                              })
                            }
                            className="text-xs"
                            min="1"
                            disabled={isAutomationRunning}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Steps Editor and Instructions */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          <Tabs
            defaultValue="steps"
            className="flex-1 flex flex-col"
            value={isAutomationRunning ? "instructions" : undefined}
          >
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Steps Tab */}
            <TabsContent
              value="steps"
              className="flex-1 overflow-hidden m-4 mt-4"
            >
              <div className="h-full flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {stepTypes.map((stepType) => (
                    <Button
                      key={stepType.value}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addStep(stepType.value as AutomationStep["type"])
                      }
                      className="h-auto p-2 flex flex-col items-center gap-1"
                      disabled={
                        isAutomationRunning ||
                        (steps.length === 0 && stepType.value !== "navigate")
                      }
                    >
                      <stepType.icon className="h-4 w-4" />
                      <span className="text-xs">{stepType.label}</span>
                    </Button>
                  ))}
                </div>
                <Separator />
              </div>
            </TabsContent>

            {/* Instructions Tab */}
            <TabsContent
              value="instructions"
              className="flex-1 overflow-hidden m-4 mt-4"
            >
              <div className="h-full flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Automation Instructions
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructions(!showInstructions)}
                  ></Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {isAutomationRunning && (
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        Automation is running... Step {currentStepIndex + 1} of{" "}
                        {steps.length}
                      </AlertDescription>
                    </Alert>
                  )}
                  {steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No steps defined</p>
                    </div>
                  ) : (
                    <div role="list">
                      {steps.map((step, index) => {
                        const stepType = stepTypes.find(
                          (s) => s.value === step.type
                        );
                        const isCurrentStep = currentStepIndex === index;
                        const isCompleted = currentStepIndex > index;
                        return (
                          <div
                            key={step.id}
                            role="listitem"
                            className={`p-3 my-2 rounded-lg border ${
                              isCurrentStep
                                ? "ring-2 ring-primary bg-primary/5"
                                : isCompleted
                                  ? "bg-green-50 border-green-200"
                                  : "bg-muted/50 border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    isCurrentStep
                                      ? "default"
                                      : isCompleted
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className={`text-xs ${
                                    isCurrentStep
                                      ? "bg-primary"
                                      : isCompleted
                                        ? "bg-green-100 text-green-800"
                                        : ""
                                  }`}
                                >
                                  {index + 1}
                                </Badge>
                                {stepType && (
                                  <stepType.icon className="h-4 w-4" />
                                )}
                                <span className="text-sm font-medium">
                                  {step.description}
                                </span>
                                {isCurrentStep && isAutomationRunning && (
                                  <Badge
                                    variant="default"
                                    className="bg-blue-100 text-blue-800 text-xs"
                                  >
                                    <Zap className="h-3 w-3 mr-1" />
                                    Running
                                  </Badge>
                                )}
                                {isCompleted && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 text-xs"
                                  >
                                    ✓ Done
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {step.type === "navigate" && `URL: ${step.value}`}
                              {step.type === "click" &&
                                `Selector: ${step.selector}`}
                              {step.type === "type" && `Text: ${step.value}`}
                              {step.type === "wait" &&
                                `Duration: ${step.value}s`}
                              {step.type === "screenshot" &&
                                "Taking screenshot..."}
                              {step.type === "extract" &&
                                `Selector: ${step.selector}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent
              value="settings"
              className="flex-1 overflow-y-auto m-4 mt-4"
            >
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
                <Separator />
                <div className="space-y-4">
                  <Label>Schedule</Label>
                  <Select
                    value={schedule.type}
                    onValueChange={(value) =>
                      setSchedule((prev) => ({
                        ...prev,
                        type: value as typeof schedule.type,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual only</SelectItem>
                      <SelectItem value="interval">Repeat interval</SelectItem>
                      <SelectItem value="fixed">Fixed time</SelectItem>
                    </SelectContent>
                  </Select>
                  {schedule.type === "interval" && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={schedule.interval}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            interval: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="flex-1"
                        min="1"
                      />
                      <Select
                        value={schedule.unit}
                        onValueChange={(value) =>
                          setSchedule((prev) => ({
                            ...prev,
                            unit: value as typeof schedule.unit,
                          }))
                        }
                      >
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
                    <Input
                      type="time"
                      value={schedule.value}
                      onChange={(e) =>
                        setSchedule((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
