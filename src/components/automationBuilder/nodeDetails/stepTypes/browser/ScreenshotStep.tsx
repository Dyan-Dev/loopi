import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function ScreenshotStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "screenshot") return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Save Path</Label>
      <Input
        type="text"
        value={step.savePath || ""}
        placeholder="save/path/filename.png"
        onChange={(e) => onUpdate(id, "update", { step: { ...step, savePath: e.target.value } })}
        className="text-xs"
      />
    </div>
  );
}
