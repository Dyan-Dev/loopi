import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { StepProps } from "../types";
import { DesktopPermissionBanner } from "./DesktopPermissionBanner";

export function DesktopScreenshotStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "desktopScreenshot") return null;

  return (
    <div className="space-y-3">
      <DesktopPermissionBanner />
      <div className="space-y-2">
        <Label className="text-xs">Save Path (optional)</Label>
        <Input
          value={step.savePath || ""}
          placeholder="e.g. /tmp/screenshot.png"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, savePath: e.target.value } })}
          className="text-xs font-mono"
        />
        <p className="text-xs text-gray-500">Leave empty for auto-generated filename.</p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Store Path As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. screenshotPath"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Region (optional — leave empty for full screen)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={step.regionX || ""}
            placeholder="X"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, regionX: e.target.value } })}
            className="text-xs"
          />
          <Input
            value={step.regionY || ""}
            placeholder="Y"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, regionY: e.target.value } })}
            className="text-xs"
          />
          <Input
            value={step.regionWidth || ""}
            placeholder="Width"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, regionWidth: e.target.value } })
            }
            className="text-xs"
          />
          <Input
            value={step.regionHeight || ""}
            placeholder="Height"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, regionHeight: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
