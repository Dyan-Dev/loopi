import type { ReactFlowNode } from "@app-types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  AiAnthropicStep,
  AiOllamaStep,
  AiOpenAIStep,
  ApiCallStep,
  ClickStep,
  CodeExecuteStep,
  DateTimeStep,
  DesktopKeyboardStep,
  DesktopMouseClickStep,
  DesktopMouseDragStep,
  DesktopMouseMoveStep,
  DesktopMouseScrollStep,
  DesktopScreenshotStep,
  ExtractStep,
  FilterArrayStep,
  ForEachStep,
  IntegrationStepEditor,
  isIntegrationStep,
  JsonParseStep,
  JsonStringifyStep,
  MapArrayStep,
  MathOperationStep,
  ModifyVariableStep,
  NavigateStep,
  ScreenshotStep,
  ScrollStep,
  SelectOptionStep,
  SetVariableStep,
  StringOperationStep,
  SystemCommandStep,
  TypeStep,
  WaitStep,
} from "./stepTypes";

export default function StepEditor({
  node,
  onUpdate,
  onPickWithSetter,
}: {
  node: ReactFlowNode;
  onUpdate: (
    id: string,
    type: "update",
    updates?: import("./stepTypes/types").UpdatePayload
  ) => void;
  onPickWithSetter: (
    setter: (s: string) => void,
    strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"
  ) => Promise<void>;
}) {
  const { data, id } = node;
  const { step } = data;

  if (!step) return null;

  const renderStepType = () => {
    switch (step.type) {
      // ─── Browser steps ────────────────────────────────────────
      case "navigate":
        return <NavigateStep step={step} id={id} onUpdate={onUpdate} />;
      case "click":
        return (
          <ClickStep step={step} id={id} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />
        );
      case "type":
        return (
          <TypeStep step={step} id={id} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />
        );
      case "selectOption":
        return (
          <SelectOptionStep
            step={step}
            id={id}
            onUpdate={onUpdate}
            onPickWithSetter={onPickWithSetter}
          />
        );
      case "extract":
        return (
          <ExtractStep
            step={step}
            id={id}
            onUpdate={onUpdate}
            onPickWithSetter={onPickWithSetter}
          />
        );
      case "wait":
        return <WaitStep step={step} id={id} onUpdate={onUpdate} />;
      case "screenshot":
        return <ScreenshotStep step={step} id={id} onUpdate={onUpdate} />;
      case "scroll":
        return (
          <ScrollStep step={step} id={id} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />
        );

      // ─── API / AI steps ───────────────────────────────────────
      case "apiCall":
        return <ApiCallStep step={step} id={id} onUpdate={onUpdate} />;
      case "aiOpenAI":
        return <AiOpenAIStep step={step} id={id} onUpdate={onUpdate} />;
      case "aiAnthropic":
        return <AiAnthropicStep step={step} id={id} onUpdate={onUpdate} />;
      case "aiOllama":
        return <AiOllamaStep step={step} id={id} onUpdate={onUpdate} />;

      // ─── Variable steps ───────────────────────────────────────
      case "modifyVariable":
        return <ModifyVariableStep step={step} id={id} onUpdate={onUpdate} />;
      case "setVariable":
        return <SetVariableStep step={step} id={id} onUpdate={onUpdate} />;

      // ─── Logic steps ──────────────────────────────────────────
      case "forEach":
        return <ForEachStep step={step} id={id} onUpdate={onUpdate} />;

      // ─── Data steps ───────────────────────────────────────────
      case "jsonParse":
        return <JsonParseStep step={step} id={id} onUpdate={onUpdate} />;
      case "jsonStringify":
        return <JsonStringifyStep step={step} id={id} onUpdate={onUpdate} />;
      case "mathOperation":
        return <MathOperationStep step={step} id={id} onUpdate={onUpdate} />;
      case "stringOperation":
        return <StringOperationStep step={step} id={id} onUpdate={onUpdate} />;
      case "dateTime":
        return <DateTimeStep step={step} id={id} onUpdate={onUpdate} />;
      case "filterArray":
        return <FilterArrayStep step={step} id={id} onUpdate={onUpdate} />;
      case "mapArray":
        return <MapArrayStep step={step} id={id} onUpdate={onUpdate} />;
      case "codeExecute":
        return <CodeExecuteStep step={step} id={id} onUpdate={onUpdate} />;

      // ─── Desktop steps ──────────────────────────────────────
      case "desktopMouseMove":
        return <DesktopMouseMoveStep step={step} id={id} onUpdate={onUpdate} />;
      case "desktopMouseClick":
        return <DesktopMouseClickStep step={step} id={id} onUpdate={onUpdate} />;
      case "desktopMouseDrag":
        return <DesktopMouseDragStep step={step} id={id} onUpdate={onUpdate} />;
      case "desktopMouseScroll":
        return <DesktopMouseScrollStep step={step} id={id} onUpdate={onUpdate} />;
      case "desktopScreenshot":
        return <DesktopScreenshotStep step={step} id={id} onUpdate={onUpdate} />;
      case "desktopKeyboard":
        return <DesktopKeyboardStep step={step} id={id} onUpdate={onUpdate} />;

      // ─── System steps ───────────────────────────────────────
      case "systemCommand":
        return <SystemCommandStep step={step} id={id} onUpdate={onUpdate} />;

      // ─── All integration steps ────────────────────────────────
      default:
        if (isIntegrationStep(step.type)) {
          return <IntegrationStepEditor step={step} id={id} onUpdate={onUpdate} />;
        }
        return null;
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Input
          value={step.description || ""}
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, description: e.target.value } })
          }
          className="text-xs"
          placeholder="Step description"
        />
      </div>

      {renderStepType()}
    </>
  );
}
