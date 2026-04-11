import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { StepProps } from "../types";
import { DesktopPermissionBanner } from "./DesktopPermissionBanner";

export function DesktopMouseDragStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "desktopMouseDrag") return null;

  return (
    <div className="space-y-3">
      <DesktopPermissionBanner />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Start X</Label>
          <Input
            value={step.startX || ""}
            placeholder="e.g. 100"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, startX: e.target.value } })}
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Start Y</Label>
          <Input
            value={step.startY || ""}
            placeholder="e.g. 100"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, startY: e.target.value } })}
            className="text-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">End X</Label>
          <Input
            value={step.endX || ""}
            placeholder="e.g. 500"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, endX: e.target.value } })}
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">End Y</Label>
          <Input
            value={step.endY || ""}
            placeholder="e.g. 300"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, endY: e.target.value } })}
            className="text-xs"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Speed (pixels/sec, optional)</Label>
        <Input
          value={step.speed || ""}
          placeholder="e.g. 500"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, speed: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
