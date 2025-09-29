import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  Target,
  Zap,
  Pause,
  Square,
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
  const [currentUrl, setCurrentUrl] = useState("https://example.com");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isRecording, setIsRecording] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [showInstructions, setShowInstructions] = useState(true);
  const [browserWindowId, setBrowserWindowId] = useState<string | null>(null);
  const browserRef = useRef<HTMLIFrameElement>(null);

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
        .filter((id, index, arr) => arr.indexOf(id) === index), // Remove duplicates
      lastRun: automation?.lastRun,
    };

    onSave(automationData);
  };

  const openBrowser = async () => {
    try {
      await (window as any).electronAPI.openBrowser(currentUrl);
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

  const navigateToUrl = async (url: string) => {
    setCurrentUrl(url);
    if (isBrowserOpen) {
      await (window as any).electronAPI.navigate(url);
      console.log(`Navigating browser window to: ${url}`);
    }
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

    setIsAutomationRunning(true);
    setCurrentStepIndex(-1);

    try {
      for (let i = 0; i < steps.length; i++) {
        await executeStep(steps[i], i);
        // Small delay between steps for visibility
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

  const testAutomation = () => {
    setIsRecording(true);
    // Mock test execution
    setTimeout(() => {
      setIsRecording(false);
      alert("Test completed successfully!");
    }, 2000);
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
            <Button
              variant="outline"
              onClick={testAutomation}
              disabled={isRecording}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isRecording ? "Testing..." : "Test"}
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Real Browser */}
        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="border-b border-border bg-card p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>

              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Enter URL to navigate to"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigateToUrl(currentUrl);
                    }
                  }}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToUrl(currentUrl)}
                disabled={!isBrowserOpen}
              >
                Navigate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 relative">
            {!isBrowserOpen ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-4">
                  <Globe className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">No Browser Open</h3>
                    <p className="text-sm">
                      Click "Open Browser" to start automation
                    </p>
                  </div>
                  <Button onClick={openBrowser} className="mt-4">
                    <Globe className="h-4 w-4 mr-2" />
                    Open Browser
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full relative">
                {/* Real Browser Window */}
                <iframe
                  ref={browserRef}
                  src={currentUrl}
                  className={`w-full h-full border-0 ${
                    viewMode === "mobile" ? "max-w-sm mx-auto" : ""
                  }`}
                  title="Automation Browser"
                />

                {/* Automation Instructions Overlay */}
                {showInstructions && (
                  <div className="absolute top-4 right-4 w-80 bg-card border border-border rounded-lg shadow-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Automation Instructions
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInstructions(false)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>

                    {isAutomationRunning && (
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertDescription>
                          Automation is running... Step {currentStepIndex + 1}{" "}
                          of {steps.length}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Current Step:
                      </Label>
                      {currentStepIndex >= 0 && steps[currentStepIndex] ? (
                        <div className="bg-muted p-2 rounded text-xs">
                          <div className="font-medium">
                            {steps[currentStepIndex].description}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {steps[currentStepIndex].type === "navigate" &&
                              `URL: ${steps[currentStepIndex].value}`}
                            {steps[currentStepIndex].type === "click" &&
                              `Selector: ${steps[currentStepIndex].selector}`}
                            {steps[currentStepIndex].type === "type" &&
                              `Text: ${steps[currentStepIndex].value}`}
                            {steps[currentStepIndex].type === "wait" &&
                              `Duration: ${steps[currentStepIndex].value}s`}
                            {steps[currentStepIndex].type === "screenshot" &&
                              "Taking screenshot..."}
                            {steps[currentStepIndex].type === "extract" &&
                              `Selector: ${steps[currentStepIndex].selector}`}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No step executing
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Next Steps:</Label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {steps
                          .slice(currentStepIndex + 1, currentStepIndex + 4)
                          .map((step, index) => (
                            <div
                              key={step.id}
                              className="text-xs bg-muted/50 p-2 rounded"
                            >
                              {currentStepIndex + index + 2}. {step.description}
                            </div>
                          ))}
                        {steps.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No steps defined
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Element Highlight Overlay */}
                {isAutomationRunning && currentStepIndex >= 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Step {currentStepIndex + 1}:{" "}
                      {steps[currentStepIndex]?.description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Steps Editor */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          <Tabs defaultValue="steps" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent
              value="steps"
              className="flex-1 overflow-hidden m-4 mt-4"
            >
              <div className="h-full flex flex-col space-y-4">
                {/* Add Step Buttons */}
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
                      disabled={isAutomationRunning}
                    >
                      <stepType.icon className="h-4 w-4" />
                      <span className="text-xs">{stepType.label}</span>
                    </Button>
                  ))}
                </div>

                <Separator />

                {/* Steps List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="space-y-2">
                        <Plus className="h-8 w-8 mx-auto" />
                        <p className="text-sm">No steps yet</p>
                        <p className="text-xs">
                          Add steps to build your automation
                        </p>
                      </div>
                    </div>
                  ) : (
                    steps.map((step, index) => {
                      const stepType = stepTypes.find(
                        (s) => s.value === step.type
                      );
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
                                {stepType && (
                                  <stepType.icon className="h-4 w-4" />
                                )}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStep(step.id)}
                                disabled={isAutomationRunning}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
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
                                  placeholder="https://example.com"
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
                                          <SelectItem
                                            key={cred.id}
                                            value={cred.id}
                                          >
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
                                <Label className="text-xs">
                                  Duration (seconds)
                                </Label>
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
            </TabsContent>

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
