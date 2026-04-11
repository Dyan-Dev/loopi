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

export function DesktopMouseClickStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "desktopMouseClick") return null;

  return (
    <div className="space-y-3">
      <DesktopPermissionBanner />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">X Position (optional)</Label>
          <Input
            value={step.x || ""}
            placeholder="Current position"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, x: e.target.value } })}
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Y Position (optional)</Label>
          <Input
            value={step.y || ""}
            placeholder="Current position"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, y: e.target.value } })}
            className="text-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Button</Label>
          <Select
            value={step.button || "left"}
            onValueChange={(v) => onUpdate(id, "update", { step: { ...step, button: v } })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Click Type</Label>
          <Select
            value={step.clickType || "single"}
            onValueChange={(v) => onUpdate(id, "update", { step: { ...step, clickType: v } })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Click</SelectItem>
              <SelectItem value="double">Double Click</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Leave X/Y empty to click at the current cursor position.
      </p>
    </div>
  );
}
