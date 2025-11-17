import { Handle, type NodeProps, Position } from "reactflow";
import type { NodeData } from "../../types/types";

const AutomationNode = ({ id, data, selected = false }: NodeProps<NodeData>) => {
  const isConditional = !data.step;

  return (
    <div className="relative">
      {id !== "1" && <Handle type="target" position={Position.Top} style={{ top: -4 }} />}
      <div
        className={`w-24 h-12 rounded-full flex items-center justify-center border-2 shadow-sm text-xs font-medium capitalize text-center cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"} ${data.nodeRunning ? "animate-pulse border-green-500 bg-green-50" : ""}`}
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
