import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { StepProps } from "../types";
import { DesktopPermissionBanner } from "./DesktopPermissionBanner";

export function DesktopMouseMoveStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "desktopMouseMove") return null;

  return (
    <div className="space-y-3">
      <DesktopPermissionBanner />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">X Position</Label>
          <Input
            value={step.x || ""}
            placeholder="e.g. 500"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, x: e.target.value } })}
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Y Position</Label>
          <Input
            value={step.y || ""}
            placeholder="e.g. 300"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, y: e.target.value } })}
            className="text-xs"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Speed (pixels/sec, optional)</Label>
        <Input
          value={step.speed || ""}
          placeholder="e.g. 1000"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, speed: e.target.value } })}
          className="text-xs"
        />
      </div>
      <p className="text-xs text-gray-500">
        Coordinates are absolute screen positions. Supports {"{{variable}}"} substitution.
      </p>
    </div>
  );
}
