import { Node, ReactFlowNode } from "@app-types";
import { Card, CardContent, CardHeader } from "../../ui/card";
import ConditionEditor from "./ConditionEditor";
import NodeHeader from "./NodeHeader";
import StepEditor from "./StepEditor";

/**
 * NodeDetails - Displays and manages properties for automation steps and conditional nodes
 *
 * Provides a detail panel for editing node properties, including:
 * - Step configuration (URL, selectors, values, etc.)
 * - Conditional logic settings
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

  return (
    <Card className="w-80 max-h-[80vh] overflow-y-auto">
      <CardHeader className="p-3">
        <NodeHeader
          title={data.step ? data.step.type : "Conditional"}
          id={id}
          onDelete={(nodeId) => onUpdate(nodeId, "delete")}
        />
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {data.step ? (
          <StepEditor node={node} onUpdate={onUpdate} onPickWithSetter={handlePickSelector} />
        ) : (
          <ConditionEditor node={node} onUpdate={onUpdate} onPickWithSetter={handlePickSelector} />
        )}
      </CardContent>
    </Card>
  );
}
