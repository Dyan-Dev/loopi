import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function ForEachStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "forEach") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Array Variable</Label>
        <Input
          value={step.arrayVariable || ""}
          placeholder="e.g. apiResponse.items"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, arrayVariable: e.target.value } })
          }
          className="text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Name of the variable holding the array to iterate over
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Item Variable Name</Label>
        <Input
          value={step.itemVariable || "currentItem"}
          placeholder="currentItem"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, itemVariable: e.target.value } })
          }
          className="text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Access current item in loop body via {"{{currentItem}}"}
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Index Variable Name</Label>
        <Input
          value={step.indexVariable || "loopIndex"}
          placeholder="loopIndex"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, indexVariable: e.target.value } })
          }
          className="text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Access current index in loop body via {"{{loopIndex}}"}
        </p>
      </div>
    </div>
  );
}
