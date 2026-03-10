import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { StepProps } from "../types";

export function CodeExecuteStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "codeExecute") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">JavaScript Expression</Label>
        <Textarea
          value={step.code || ""}
          placeholder={`e.g. Math.round(price * 100) / 100\nor: items.length > 0 ? items[0].name : "empty"`}
          onChange={(e) => onUpdate(id, "update", { step: { ...step, code: e.target.value } })}
          className="text-xs min-h-24 font-mono"
        />
        <p className="text-xs text-gray-500">
          All workflow variables are available by name. Supports Math, Date, JSON, String, Array,
          Object built-ins. Use {"{{varName}}"} syntax or reference variables directly.
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. result"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
      <div className="bg-amber-50 p-3 rounded border border-amber-200">
        <p className="text-xs font-semibold mb-1">Security Note</p>
        <p className="text-xs text-amber-700">
          Code runs in a sandboxed environment. Node.js APIs (require, fs, process) are blocked.
        </p>
      </div>
    </div>
  );
}
