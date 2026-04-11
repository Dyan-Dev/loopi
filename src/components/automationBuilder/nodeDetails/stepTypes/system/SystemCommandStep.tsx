import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { StepProps } from "../types";

export function SystemCommandStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "systemCommand") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Command</Label>
        <Textarea
          value={step.command || ""}
          placeholder={`e.g. ls -la\nor: git status\nor: echo "{{myVar}}"`}
          onChange={(e) => onUpdate(id, "update", { step: { ...step, command: e.target.value } })}
          className="text-xs min-h-20 font-mono"
        />
        <p className="text-xs text-gray-500">
          Shell command to execute. Supports {"{{variable}}"} substitution.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Working Directory (optional)</Label>
        <Input
          value={step.cwd || ""}
          placeholder="e.g. /home/user/project"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, cwd: e.target.value } })}
          className="text-xs font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Timeout (ms)</Label>
          <Input
            type="number"
            value={step.timeout ?? 30000}
            placeholder="30000"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, timeout: Number(e.target.value) } })
            }
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Shell (optional)</Label>
          <Input
            value={step.shell || ""}
            placeholder="e.g. /bin/bash"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, shell: e.target.value } })}
            className="text-xs font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Store stdout As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. output"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Store stderr As</Label>
          <Input
            value={step.storeStderrKey || ""}
            placeholder="e.g. errors"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, storeStderrKey: e.target.value } })
            }
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Store Exit Code As</Label>
          <Input
            value={step.storeExitCodeKey || ""}
            placeholder="e.g. exitCode"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, storeExitCodeKey: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${id}-failOnNonZero`}
          checked={step.failOnNonZero !== false}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, failOnNonZero: !!checked } })
          }
        />
        <Label htmlFor={`${id}-failOnNonZero`} className="text-xs">
          Fail step on non-zero exit code
        </Label>
      </div>

      <div className="bg-amber-50 p-3 rounded border border-amber-200">
        <p className="text-xs font-semibold mb-1">Security Warning</p>
        <p className="text-xs text-amber-700">
          This step executes shell commands with full system access. Only run workflows from trusted
          sources.
        </p>
      </div>
    </div>
  );
}
