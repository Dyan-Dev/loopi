import { Plus } from "lucide-react";
import { type AutomationStep, stepTypes } from "../../types/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

interface AddStepPopupProps {
  onAdd: (type: AutomationStep["type"] | "conditional") => void;
}

const AddStepPopup: React.FC<AddStepPopupProps> = ({ onAdd }) => {
  return (
    <Card className="w-48">
      <CardHeader className="p-3">
        <h3 className="text-sm font-medium">Add Next Step</h3>
      </CardHeader>
      <CardContent className="p-3 space-y-1">
        {stepTypes.map((stepType) => (
          <Button
            key={stepType.value}
            variant="ghost"
            className="w-full text-left justify-start text-xs py-1 px-2"
            onClick={() => {
              onAdd(stepType.value as AutomationStep["type"]);
            }}
          >
            <stepType.icon className="h-4 w-4 mr-2" />
            {stepType.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="w-full text-left justify-start text-xs py-1 px-2"
          onClick={() => {
            onAdd("conditional");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Conditional
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddStepPopup;
