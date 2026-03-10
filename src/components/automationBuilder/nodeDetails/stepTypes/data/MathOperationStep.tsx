import type { MathOp } from "@app-types/steps";
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

const mathOps: { value: MathOp; label: string; needsB: boolean }[] = [
  { value: "add", label: "Add (A + B)", needsB: true },
  { value: "subtract", label: "Subtract (A - B)", needsB: true },
  { value: "multiply", label: "Multiply (A * B)", needsB: true },
  { value: "divide", label: "Divide (A / B)", needsB: true },
  { value: "modulo", label: "Modulo (A % B)", needsB: true },
  { value: "power", label: "Power (A ^ B)", needsB: true },
  { value: "min", label: "Min (A, B)", needsB: true },
  { value: "max", label: "Max (A, B)", needsB: true },
  { value: "abs", label: "Absolute |A|", needsB: false },
  { value: "round", label: "Round A", needsB: false },
  { value: "floor", label: "Floor A", needsB: false },
  { value: "ceil", label: "Ceil A", needsB: false },
  { value: "random", label: "Random (0 to B)", needsB: true },
];

export function MathOperationStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "mathOperation") return null;

  const currentOp = mathOps.find((o) => o.value === step.operation);
  const needsB = currentOp?.needsB ?? true;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "add"}
          onValueChange={(v) =>
            onUpdate(id, "update", { step: { ...step, operation: v as MathOp } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mathOps.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Value A</Label>
        <Input
          value={step.valueA || ""}
          placeholder="e.g. 10 or {{myVar}}"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, valueA: e.target.value } })}
          className="text-xs"
        />
      </div>
      {needsB && (
        <div className="space-y-2">
          <Label className="text-xs">Value B</Label>
          <Input
            value={step.valueB || ""}
            placeholder="e.g. 5 or {{otherVar}}"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, valueB: e.target.value } })}
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
