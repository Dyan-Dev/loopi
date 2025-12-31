/**
 * VariableConditionEditor - Configuration UI for variable conditional nodes
 *
 * Supports variable condition types:
 * - variableEquals: Check if variable equals a value
 * - variableContains: Check if variable contains a substring
 * - variableGreaterThan: Check if variable is greater than a value
 * - variableLessThan: Check if variable is less than a value
 * - variableExists: Check if variable exists
 */
import type { ReactFlowNode } from "@app-types";
import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";

export default function VariableConditionEditor({
  node,
  onUpdate,
}: {
  node: ReactFlowNode;
  onUpdate: (
    id: string,
    type: "update",
    updates?: import("./stepTypes/types").UpdatePayload
  ) => void;
}) {
  const { data, id } = node;
  const step = data.step as unknown as Record<string, unknown>;
  const variableConditionType = (step?.variableConditionType || "variableEquals") as string;
  const variableName = (step?.variableName || "") as string;
  const expectedValue = (step?.expectedValue || "") as string;
  const parseAsNumber = (step?.parseAsNumber || false) as boolean;

  const updateField = (field: string, value: unknown) => {
    if (data.step) {
      onUpdate(id, "update", { step: { ...step, [field]: value } });
    } else {
      onUpdate(id, "update", { [field]: value });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Condition Type</Label>
        <Select
          value={variableConditionType}
          onValueChange={(value) => updateField("variableConditionType", value)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="variableExists">Variable Exists</SelectItem>
            <SelectItem value="variableEquals">Variable Equals</SelectItem>
            <SelectItem value="variableContains">Variable Contains</SelectItem>
            <SelectItem value="variableGreaterThan">Variable Greater Than</SelectItem>
            <SelectItem value="variableLessThan">Variable Less Than</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Variable Name</Label>
        <Input
          value={variableName}
          onChange={(e) => updateField("variableName", e.target.value)}
          placeholder="Variable name (supports {{var}} syntax)"
          className="text-xs"
        />
      </div>

      {variableConditionType !== "variableExists" && (
        <div className="space-y-2">
          <Label className="text-xs">Expected Value</Label>
          <Input
            value={expectedValue}
            onChange={(e) => updateField("expectedValue", e.target.value)}
            placeholder="Expected value (supports {{var}} syntax)"
            className="text-xs"
          />
        </div>
      )}

      {["variableGreaterThan", "variableLessThan"].includes(variableConditionType) && (
        <div className="flex items-center gap-2 mt-2">
          <Switch
            checked={parseAsNumber}
            onCheckedChange={(v: boolean) => updateField("parseAsNumber", v)}
          />
          <Label className="text-xs">Parse as number before comparison</Label>
        </div>
      )}
    </>
  );
}
