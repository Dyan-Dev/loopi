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

const conditions = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
  { value: "contains", label: "Contains" },
  { value: "greaterThan", label: "Greater than" },
  { value: "lessThan", label: "Less than" },
  { value: "truthy", label: "Is truthy" },
  { value: "falsy", label: "Is falsy" },
  { value: "exists", label: "Exists (not null/undefined)" },
];

const needsCompareValue = (c: string) =>
  ["equals", "notEquals", "contains", "greaterThan", "lessThan"].includes(c);

export function FilterArrayStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "filterArray") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Source Array Variable</Label>
        <Input
          value={step.sourceVariable || ""}
          placeholder="e.g. items"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, sourceVariable: e.target.value } })
          }
          className="text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Field (for objects, optional)</Label>
        <Input
          value={step.field || ""}
          placeholder="e.g. name or nested.property"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, field: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">Leave empty to compare items directly</p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Condition</Label>
        <Select
          value={step.condition || "equals"}
          onValueChange={(v) =>
            onUpdate(id, "update", { step: { ...step, condition: v as typeof step.condition } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {needsCompareValue(step.condition) && (
        <div className="space-y-2">
          <Label className="text-xs">Compare Value</Label>
          <Input
            value={step.compareValue || ""}
            placeholder="e.g. active or {{threshold}}"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, compareValue: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. filteredItems"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
