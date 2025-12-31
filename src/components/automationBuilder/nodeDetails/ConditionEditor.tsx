/**
 * BrowserConditionEditor - Configuration UI for browser conditional nodes (DOM-based)
 *
 * Supports browser condition types:
 * - elementExists: Check if element is present in DOM
 * - valueMatches: Compare element text content against expected value
 */
import type { ReactFlowNode } from "@app-types";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { SelectorButton } from "./customComponents";

export default function BrowserConditionEditor({
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
  const step = data.step as unknown as Record<string, unknown>;
  const browserConditionType = (step?.browserConditionType || "elementExists") as string;
  const selector = (step?.selector || "") as string;
  const condition = (step?.condition || "equals") as string;
  const expectedValue = (step?.expectedValue || "") as string;

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
          value={browserConditionType}
          onValueChange={(value) => updateField("browserConditionType", value)}
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

      {["elementExists", "valueMatches"].includes(browserConditionType) && (
        <div className="space-y-2">
          <Label className="text-xs">Selector</Label>
          <div className="flex gap-2">
            <Input
              value={selector}
              onChange={(e) => updateField("selector", e.target.value)}
              placeholder="Selector"
              className="text-xs flex-1"
            />
            <SelectorButton
              onPick={async (strategy) =>
                onPickWithSetter((sel) => updateField("selector", sel), strategy)
              }
            />
          </div>
        </div>
      )}

      {browserConditionType === "valueMatches" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Condition</Label>
            <Select value={condition} onValueChange={(value) => updateField("condition", value)}>
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
              value={expectedValue}
              onChange={(e) => updateField("expectedValue", e.target.value)}
              placeholder="Expected value"
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Post-process Extracted Text</Label>
            <Select
              value={(step?.transformType || "none") as string}
              onValueChange={(value) => updateField("transformType", value)}
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

            {step?.transformType === "removeChars" && (
              <div className="mt-2">
                <Label className="text-[11px]">Chars to remove</Label>
                <Input
                  value={(step?.transformChars || "") as string}
                  onChange={(e) => updateField("transformChars", e.target.value)}
                  placeholder="e.g. $ ,"
                  className="text-xs"
                />
              </div>
            )}

            {step?.transformType === "regexReplace" && (
              <div className="mt-2 space-y-2">
                <Label className="text-[11px]">Regex pattern</Label>
                <Input
                  value={(step?.transformPattern || "") as string}
                  onChange={(e) => updateField("transformPattern", e.target.value)}
                  placeholder="e.g. ([^0-9.])"
                  className="text-xs"
                />
                <Label className="text-[11px]">Replacement</Label>
                <Input
                  value={(step?.transformReplace || "") as string}
                  onChange={(e) => updateField("transformReplace", e.target.value)}
                  placeholder="e.g. ''"
                  className="text-xs"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={(step?.parseAsNumber || false) as boolean}
                onCheckedChange={(v: boolean) => updateField("parseAsNumber", v)}
              />
              <Label className="text-xs">Parse as number before comparison</Label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
