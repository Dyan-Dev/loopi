/**
 * ConditionEditor - Configuration UI for conditional nodes
 *
 * Supports three condition types:
 * - elementExists: Check if element is present in DOM
 * - valueMatches: Compare element text content against expected value
 */
import type { ReactFlowNode } from "@app-types";
import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { SelectorButton } from "./customComponents";

export default function ConditionEditor({
  node,
  onUpdate,
  onPickWithSetter,
}: {
  node: ReactFlowNode;
  onUpdate: (
    id: string,
    type: "update",
    updates?: import("./stepTypes/types").UpdatePayload
  ) => void;
  onPickWithSetter: (
    setter: (s: string) => void,
    strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"
  ) => Promise<void>;
}) {
  const { data, id } = node;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Condition Type</Label>
        <Select
          value={data.conditionType || "elementExists"}
          onValueChange={(value) => onUpdate(id, "update", { conditionType: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="elementExists">Element Exists</SelectItem>
            <SelectItem value="valueMatches">Value Matches</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {["elementExists", "valueMatches"].includes(data.conditionType || "") && (
        <div className="space-y-2">
          <Label className="text-xs">Selector</Label>
          <div className="flex gap-2">
            <Input
              value={data.selector || ""}
              onChange={(e) => onUpdate(id, "update", { selector: e.target.value })}
              placeholder="Selector"
              className="text-xs flex-1"
            />
            <SelectorButton
              onPick={async (strategy) =>
                onPickWithSetter((selector) => onUpdate(id, "update", { selector }), strategy)
              }
            />
          </div>
        </div>
      )}

      {data.conditionType === "valueMatches" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Condition</Label>
            <Select
              value={data.condition || "equals"}
              onValueChange={(value) => onUpdate(id, "update", { condition: value })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greaterThan">Greater Than</SelectItem>
                <SelectItem value="lessThan">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Expected Value</Label>
            <Input
              value={data.expectedValue || ""}
              onChange={(e) => onUpdate(id, "update", { expectedValue: e.target.value })}
              placeholder="Expected value"
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Post-process Extracted Text</Label>
            <Select
              value={data.transformType || "none"}
              onValueChange={(value) => onUpdate(id, "update", { transformType: value })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="stripCurrency">Strip Currency Symbols (e.g. $ , €)</SelectItem>
                <SelectItem value="stripNonNumeric">Strip Non-numeric Characters</SelectItem>
                <SelectItem value="removeChars">Remove Specific Characters</SelectItem>
                <SelectItem value="regexReplace">Regex Replace</SelectItem>
              </SelectContent>
            </Select>

            {data.transformType === "removeChars" && (
              <div className="mt-2">
                <Label className="text-[11px]">Chars to remove</Label>
                <Input
                  value={data.transformChars || ""}
                  onChange={(e) => onUpdate(id, "update", { transformChars: e.target.value })}
                  placeholder="e.g. $ ,"
                  className="text-xs"
                />
              </div>
            )}

            {data.transformType === "regexReplace" && (
              <div className="mt-2 space-y-2">
                <Label className="text-[11px]">Regex pattern</Label>
                <Input
                  value={data.transformPattern || ""}
                  onChange={(e) => onUpdate(id, "update", { transformPattern: e.target.value })}
                  placeholder="e.g. ([^0-9.])"
                  className="text-xs"
                />
                <Label className="text-[11px]">Replacement</Label>
                <Input
                  value={data.transformReplace || ""}
                  onChange={(e) => onUpdate(id, "update", { transformReplace: e.target.value })}
                  placeholder="e.g. ''"
                  className="text-xs"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={!!data.parseAsNumber}
                onCheckedChange={(v: boolean) => onUpdate(id, "update", { parseAsNumber: v })}
              />
              <Label className="text-xs">Parse as number before comparison</Label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
