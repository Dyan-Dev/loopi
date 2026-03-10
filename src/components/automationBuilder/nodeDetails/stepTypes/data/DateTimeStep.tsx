import type { DateTimeOp } from "@app-types/steps";
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

const dateOps: {
  value: DateTimeOp;
  label: string;
  needsValue: boolean;
  needsAmount: boolean;
  needsFormat: boolean;
}[] = [
  {
    value: "now",
    label: "Current date/time (ISO)",
    needsValue: false,
    needsAmount: false,
    needsFormat: false,
  },
  {
    value: "timestamp",
    label: "Current timestamp (ms)",
    needsValue: false,
    needsAmount: false,
    needsFormat: false,
  },
  {
    value: "parse",
    label: "Parse date string",
    needsValue: true,
    needsAmount: false,
    needsFormat: false,
  },
  {
    value: "format",
    label: "Format date",
    needsValue: true,
    needsAmount: false,
    needsFormat: true,
  },
  { value: "add", label: "Add time", needsValue: true, needsAmount: true, needsFormat: false },
  {
    value: "subtract",
    label: "Subtract time",
    needsValue: true,
    needsAmount: true,
    needsFormat: false,
  },
  {
    value: "diff",
    label: "Difference between dates",
    needsValue: true,
    needsAmount: false,
    needsFormat: true,
  },
  {
    value: "dayOfWeek",
    label: "Day of week",
    needsValue: true,
    needsAmount: false,
    needsFormat: false,
  },
  {
    value: "startOf",
    label: "Start of period",
    needsValue: true,
    needsAmount: false,
    needsFormat: false,
  },
  {
    value: "endOf",
    label: "End of period",
    needsValue: true,
    needsAmount: false,
    needsFormat: false,
  },
];

const timeUnits = [
  "milliseconds",
  "seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
  "years",
];
const formatOptions = ["iso", "locale", "date", "time", "unix", "unixMs"];

export function DateTimeStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "dateTime") return null;

  const currentOp = dateOps.find((o) => o.value === step.operation);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "now"}
          onValueChange={(v) =>
            onUpdate(id, "update", { step: { ...step, operation: v as DateTimeOp } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateOps.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentOp?.needsValue && (
        <div className="space-y-2">
          <Label className="text-xs">
            {step.operation === "diff" ? "Start Date" : "Date Value"}
          </Label>
          <Input
            value={step.value || ""}
            placeholder="e.g. 2024-01-15 or {{dateVar}}"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
            className="text-xs"
          />
        </div>
      )}

      {step.operation === "diff" && (
        <div className="space-y-2">
          <Label className="text-xs">End Date (leave empty for now)</Label>
          <Input
            value={step.format || ""}
            placeholder="e.g. 2024-12-31 or {{endDate}}"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, format: e.target.value } })}
            className="text-xs"
          />
        </div>
      )}

      {step.operation === "format" && (
        <div className="space-y-2">
          <Label className="text-xs">Output Format</Label>
          <Select
            value={step.format || "iso"}
            onValueChange={(v) => onUpdate(id, "update", { step: { ...step, format: v } })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {currentOp?.needsAmount && (
        <div className="space-y-2">
          <Label className="text-xs">Amount</Label>
          <Input
            type="number"
            value={step.amount ?? 1}
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, amount: Number(e.target.value) } })
            }
            className="text-xs"
          />
        </div>
      )}

      {(currentOp?.needsAmount ||
        step.operation === "diff" ||
        step.operation === "startOf" ||
        step.operation === "endOf") && (
        <div className="space-y-2">
          <Label className="text-xs">Unit</Label>
          <Select
            value={step.unit || "days"}
            onValueChange={(v) =>
              onUpdate(id, "update", { step: { ...step, unit: v as typeof step.unit } })
            }
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeUnits.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. currentDate"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
