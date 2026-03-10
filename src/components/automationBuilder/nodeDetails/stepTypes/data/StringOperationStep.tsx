import type { StringOp } from "@app-types/steps";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { StepProps } from "../types";

const stringOps: { value: StringOp; label: string; p1Label?: string; p2Label?: string }[] = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "trim", label: "Trim whitespace" },
  { value: "replace", label: "Replace", p1Label: "Find", p2Label: "Replace with" },
  { value: "split", label: "Split to array", p1Label: "Delimiter (default: ,)" },
  { value: "join", label: "Join array", p1Label: "Delimiter (default: ,)" },
  { value: "substring", label: "Substring", p1Label: "Start index", p2Label: "End index" },
  { value: "length", label: "Length" },
  { value: "includes", label: "Includes?", p1Label: "Search string" },
  { value: "startsWith", label: "Starts with?", p1Label: "Prefix" },
  { value: "endsWith", label: "Ends with?", p1Label: "Suffix" },
  { value: "padStart", label: "Pad start", p1Label: "Target length", p2Label: "Pad char" },
  { value: "padEnd", label: "Pad end", p1Label: "Target length", p2Label: "Pad char" },
  { value: "repeat", label: "Repeat", p1Label: "Count" },
  { value: "reverse", label: "Reverse" },
];

export function StringOperationStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "stringOperation") return null;

  const currentOp = stringOps.find((o) => o.value === step.operation);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "uppercase"}
          onValueChange={(v) =>
            onUpdate(id, "update", { step: { ...step, operation: v as StringOp } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stringOps.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">
          {step.operation === "join" ? "Array Variable Name" : "Input Value"}
        </Label>
        <Input
          value={step.value || ""}
          placeholder={step.operation === "join" ? "e.g. myArray" : "e.g. Hello World or {{myVar}}"}
          onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
          className="text-xs"
        />
      </div>
      {currentOp?.p1Label && (
        <div className="space-y-2">
          <Label className="text-xs">{currentOp.p1Label}</Label>
          <Input
            value={step.param1 || ""}
            onChange={(e) => onUpdate(id, "update", { step: { ...step, param1: e.target.value } })}
            className="text-xs"
          />
        </div>
      )}
      {currentOp?.p2Label && (
        <div className="space-y-2">
          <Label className="text-xs">{currentOp.p2Label}</Label>
          <Input
            value={step.param2 || ""}
            onChange={(e) => onUpdate(id, "update", { step: { ...step, param2: e.target.value } })}
            className="text-xs"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. result"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
