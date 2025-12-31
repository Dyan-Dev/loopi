import { Node, ReactFlowNode } from "@app-types";
import { Card, CardContent, CardHeader } from "../../ui/card";
import BrowserConditionEditor from "./ConditionEditor";
import NodeHeader from "./NodeHeader";
import StepEditor from "./StepEditor";
import VariableConditionEditor from "./VariableConditionEditor";

/**
 * NodeDetails - Displays and manages properties for automation steps and conditional nodes
 *
 * Provides a detail panel for editing node properties, including:
 * - Step configuration (URL, selectors, values, etc.)
 * - Browser conditional logic settings (DOM-based)
 * - Variable conditional logic settings (variable-based)
 * - Interactive selector picking via Electron IPC
 */
export default function NodeDetails({
  node,
  onUpdate,
  setBrowserOpen,
  recentUrl,
}: {
  node: ReactFlowNode;
  onUpdate: (sourceId: string, type: "update" | "delete", updates?: Partial<Node["data"]>) => void;
  setBrowserOpen: (arg?: boolean | string) => void;
  recentUrl: string;
}) {
  const { data, id } = node;

  /**
   * Initiates interactive element selector picking in the browser window
   * Special handling for select elements to capture option data
   */
  const handlePickSelector = async (
    setter: (selector: string) => void,
    strategy: "css" | "xpath" | "dataAttr" | "id" | "aria" = "css"
  ) => {
    if (!window.electronAPI?.pickSelector) {
      alert("Electron API not available. Ensure the browser is set up.");
      return;
    }

    try {
      const urlToOpen = recentUrl || "https://";
      const selector = await window.electronAPI.pickSelector(urlToOpen, { strategy });

      if (selector) {
        // Parse select element data: "selector||optionIndex||optionValue"
        if (data.step?.type === "selectOption") {
          const [selectorStr, optionIndex, optionValue] = selector.toString().split("||");
          setter(selectorStr);
          onUpdate(id, "update", {
            step: {
              ...data.step,
              selector: selectorStr,
              optionIndex: optionIndex ? parseInt(optionIndex) : undefined,
              optionValue: optionValue || "",
            },
          });
        } else {
          setter(selector);
        }
      }

      window.electronAPI?.focusMainWindow?.();
    } catch (err: unknown) {
      console.error("Selector pick failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Failed to pick selector. Ensure the browser is open and try again.");
    }
  };

  const getNodeTitle = () => {
    if (data.step) {
      if (data.step.type === "browserConditional") return "Browser Conditional";
      if (data.step.type === "variableConditional") return "Variable Conditional";
      return data.step.type;
    }
    return "Conditional";
  };

  return (
    <Card className="w-80 max-h-[80vh] overflow-y-auto">
      <CardHeader className="p-3">
        <NodeHeader
          title={getNodeTitle()}
          id={id}
          onDelete={(nodeId) => onUpdate(nodeId, "delete")}
        />
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {data.step && data.step.type === "browserConditional" ? (
          <BrowserConditionEditor
            node={node}
            onUpdate={onUpdate}
            onPickWithSetter={handlePickSelector}
          />
        ) : data.step && data.step.type === "variableConditional" ? (
          <VariableConditionEditor node={node} onUpdate={onUpdate} />
        ) : data.step ? (
          <StepEditor node={node} onUpdate={onUpdate} onPickWithSetter={handlePickSelector} />
        ) : (
          <p className="text-sm text-muted-foreground">No step data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
