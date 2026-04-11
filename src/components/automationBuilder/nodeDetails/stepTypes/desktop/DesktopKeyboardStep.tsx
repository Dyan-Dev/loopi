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
import { DesktopPermissionBanner } from "./DesktopPermissionBanner";

export function DesktopKeyboardStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "desktopKeyboard") return null;

  const action = step.action || "type";

  return (
    <div className="space-y-3">
      <DesktopPermissionBanner />
      <div className="space-y-2">
        <Label className="text-xs">Action</Label>
        <Select
          value={action}
          onValueChange={(v) => onUpdate(id, "update", { step: { ...step, action: v } })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type">Type Text</SelectItem>
            <SelectItem value="press">Press Key</SelectItem>
            <SelectItem value="hotkey">Hotkey Combo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {action === "type" && (
        <div className="space-y-2">
          <Label className="text-xs">Text</Label>
          <Input
            value={step.text || ""}
            placeholder="e.g. Hello World"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, text: e.target.value } })}
            className="text-xs"
          />
          <p className="text-xs text-gray-500">
            Types the text character by character. Supports {"{{variable}}"} substitution.
          </p>
        </div>
      )}

      {action === "press" && (
        <div className="space-y-2">
          <Label className="text-xs">Key</Label>
          <Input
            value={step.key || ""}
            placeholder="e.g. Enter, Tab, Space, Escape, F5"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, key: e.target.value } })}
            className="text-xs font-mono"
          />
          <p className="text-xs text-gray-500">
            Key name from nut-js Key enum (e.g. Enter, Tab, Space, Escape, F1-F12, Up, Down, Left,
            Right).
          </p>
        </div>
      )}

      {action === "hotkey" && (
        <div className="space-y-2">
          <Label className="text-xs">Key Combination</Label>
          <Input
            value={step.keys || ""}
            placeholder="e.g. LeftControl+C or LeftAlt+F4"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, keys: e.target.value } })}
            className="text-xs font-mono"
          />
          <p className="text-xs text-gray-500">
            Keys separated by + (e.g. LeftControl+C, LeftAlt+Tab, LeftShift+A).
          </p>
        </div>
      )}
    </div>
  );
}
