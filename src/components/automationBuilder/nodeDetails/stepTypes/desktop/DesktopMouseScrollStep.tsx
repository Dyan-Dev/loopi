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

export function DesktopMouseScrollStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "desktopMouseScroll") return null;

  return (
    <div className="space-y-3">
      <DesktopPermissionBanner />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Direction</Label>
          <Select
            value={step.direction || "down"}
            onValueChange={(v) => onUpdate(id, "update", { step: { ...step, direction: v } })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="up">Up</SelectItem>
              <SelectItem value="down">Down</SelectItem>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Amount (scroll units)</Label>
          <Input
            value={step.amount || ""}
            placeholder="e.g. 3"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, amount: e.target.value } })}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
