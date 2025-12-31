import { NodeData } from "@app-types";
import { Handle, NodeProps, Position } from "reactflow";

const AutomationNode = ({ id, data, selected = false }: NodeProps<NodeData>) => {
  const isConditional =
    !data.step ||
    data.step.type === "browserConditional" ||
    data.step.type === "variableConditional";
  const isDark = document.documentElement.classList.contains("dark");

  const getNodeLabel = () => {
    if (data.step) {
      if (data.step.type === "browserConditional") return "Browser If";
      if (data.step.type === "variableConditional") return "Variable If";
      return data.step.type;
    }
    return "Conditional";
  };

  const getNodeStyles = () => {
    // Error state - red
    if (data.nodeStatus === "error") {
      return isDark
        ? "border-red-500 bg-red-900 text-white"
        : "border-red-500 bg-red-50 text-gray-900";
    }

    // Success state - green
    if (data.nodeStatus === "success") {
      return isDark
        ? "border-green-500 bg-green-800 text-white"
        : "border-green-500 bg-green-100 text-gray-900";
    }

    // Running state - animated
    if (data.nodeRunning || data.nodeStatus === "running") {
      return isDark
        ? "border-blue-500 bg-blue-900 text-white animate-pulse"
        : "border-blue-500 bg-blue-50 text-gray-900 animate-pulse";
    }

    // Selected state
    if (selected) {
      return isDark
        ? "border-blue-500 bg-blue-900 text-white"
        : "border-blue-500 bg-blue-50 text-gray-900";
    }

    // Default state
    return isDark
      ? "border-gray-600 bg-gray-800 text-gray-100"
      : "border-gray-200 bg-white text-gray-900";
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} style={{ top: -5 }} />
      <div
        className={`w-24 h-12 rounded-full flex items-center justify-center border-2 shadow-sm text-xs font-medium capitalize text-center cursor-pointer ${getNodeStyles()}`}
      >
        {getNodeLabel()}
      </div>
      {isConditional ? (
        <>
          <Handle type="source" position={Position.Left} id="if" />
          <Handle type="source" position={Position.Right} id="else" />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          style={{ left: "50%", bottom: -5, transform: "translateX(-50%)" }}
        />
      )}
    </div>
  );
};

export default AutomationNode;
