import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { SelectorButton } from "./customComponents";

/**
 * ConditionEditor - Configuration UI for conditional nodes
 * 
 * Supports three condition types:
 * - elementExists: Check if element is present in DOM
 * - valueMatches: Compare element text content against expected value
 * - loopUntilFalse: Dynamic iteration with ${index} template variable
 */
export default function ConditionEditor({
  node,
  onUpdate,
  onPickWithSetter,
}: {
  node: any;
  onUpdate: (id: string, type: "update", updates?: any) => void;
  onPickWithSetter: (setter: (s: string) => void) => Promise<void>;
}) {
  const { data, id } = node;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Condition Type</Label>
        <Select value={data.conditionType || "elementExists"} onValueChange={(value) => onUpdate(id, "update", { conditionType: value })}>
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="elementExists">Element Exists</SelectItem>
            <SelectItem value="valueMatches">Value Matches</SelectItem>
            <SelectItem value="loopUntilFalse">Loop Until False (Dynamic Index)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(["elementExists", "valueMatches"].includes(data.conditionType || "")) && (
        <div className="space-y-2">
          <Label className="text-xs">CSS Selector</Label>
          <div className="flex gap-2">
            <Input
              value={data.selector || ""}
              onChange={(e) => onUpdate(id, "update", { selector: e.target.value })}
              placeholder="CSS Selector"
              className="text-xs flex-1"
            />
            <SelectorButton onPick={async () => onPickWithSetter((selector) => onUpdate(id, "update", { selector }))} />
          </div>
        </div>
      )}

      {(["loopUntilFalse"].includes(data.conditionType || "")) && (
        <div className="space-y-2">
          <Label className="text-xs">Selector (use {"${index}"} for dynamic position)</Label>
          <div className="flex gap-2">
            <Input
              value={data.selector || ""}
              onChange={(e) => onUpdate(id, "update", { selector: e.target.value })}
              placeholder="e.g., .inventory_list > div:nth-of-type(${index})"
              className="text-xs flex-1"
            />
            <SelectorButton onPick={async () => onPickWithSetter((selector) => onUpdate(id, "update", { selector }))} />
          </div>
          <p className="text-xs text-muted-foreground">Picker generates static path; manually add {"${index}"} for looping.</p>
        </div>
      )}

      {(["valueMatches", "loopUntilFalse"].includes(data.conditionType || "")) && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Condition</Label>
            <Select value={data.condition || "equals"} onValueChange={(value) => onUpdate(id, "update", { condition: value })}>
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
            <Input value={data.expectedValue || ""} onChange={(e) => onUpdate(id, "update", { expectedValue: e.target.value })} placeholder="Expected value" className="text-xs" />
          </div>
        </div>
      )}

      {data.conditionType === "loopUntilFalse" && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs">Loop Settings</Label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Start Index</Label>
              <Input type="number" value={data.startIndex || 1} onChange={(e) => onUpdate(id, "update", { startIndex: parseInt(e.target.value) || 1 })} min={0} className="text-xs h-6" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Increment</Label>
              <Input type="number" value={data.increment || 1} onChange={(e) => onUpdate(id, "update", { increment: parseInt(e.target.value) || 1 })} min={1} className="text-xs h-6" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Max Iterations</Label>
              <Input type="number" value={data.maxIterations || 100} onChange={(e) => onUpdate(id, "update", { maxIterations: parseInt(e.target.value) || 100 })} min={1} className="text-xs h-6" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">Loops while condition true; connect "if" to actions, edge back here. "Else" for exit.</p>
        </div>
      )}
    </>
  );
}
