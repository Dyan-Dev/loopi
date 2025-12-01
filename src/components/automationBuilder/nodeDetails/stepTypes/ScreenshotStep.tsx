import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { StepProps } from "./types";

export function ScreenshotStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "screenshot") return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Filename</Label>
      <Input
        type="text"
        value={step.savePath || ""}
        placeholder="filename"
        onChange={(e) => onUpdate(id, "update", { step: { ...step, savePath: e.target.value } })}
        className="text-xs"
      />
    </div>
  );
}
