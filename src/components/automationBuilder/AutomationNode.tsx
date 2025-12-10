import { Handle, NodeProps, Position } from "reactflow";
import { NodeData } from "../../types";

const AutomationNode = ({ id, data, selected = false }: NodeProps<NodeData>) => {
  const isConditional = !data.step;
  const isDark = document.documentElement.classList.contains("dark");

  const getNodeStyles = () => {
    if (data.nodeRunning) {
      return isDark
        ? "border-green-500 bg-green-900 text-white animate-pulse"
        : "border-green-500 bg-green-50 text-gray-900";
    }

    if (selected) {
      return isDark
        ? "border-blue-500 bg-blue-900 text-white"
        : "border-blue-500 bg-blue-50 text-gray-900";
    }

    return isDark
      ? "border-gray-600 bg-gray-800 text-gray-100"
      : "border-gray-200 bg-white text-gray-900";
  };

  return (
    <div className="relative">
      {id !== "1" && <Handle type="target" position={Position.Top} style={{ top: -4 }} />}
      <div
        className={`w-24 h-12 rounded-full flex items-center justify-center border-2 shadow-sm text-xs font-medium capitalize text-center cursor-pointer ${getNodeStyles()}`}
      >
        {data.step ? data.step.type : "Conditional"}
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
