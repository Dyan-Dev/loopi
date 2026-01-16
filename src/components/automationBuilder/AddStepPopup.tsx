import { AutomationStep, stepCategories } from "@app-types";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@components/ui/collapsible";
import { ScrollArea } from "@components/ui/scroll-area";
import { GitBranch, Variable } from "lucide-react";
import { useState } from "react";

interface AddStepPopupProps {
  onAdd: (type: AutomationStep["type"]) => void;
}

const AddStepPopup: React.FC<AddStepPopupProps> = ({ onAdd }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([]));

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  return (
    <Card className="w-56">
      <CardHeader className="p-3">
        <h3 className="text-sm font-medium">Add Step</h3>
      </CardHeader>
      <ScrollArea className="h-[70vh] max-h-[600px]">
        <CardContent className="p-3 space-y-2">
          {stepCategories.map((categoryData) => (
            <Collapsible
              key={categoryData.category}
              open={expandedCategories.has(categoryData.category)}
              onOpenChange={() => toggleCategory(categoryData.category)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-left justify-between text-xs py-1 px-2 h-auto font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {categoryData.icon && <categoryData.icon className="h-4 w-4" />}
                    {categoryData.category}
                  </div>
                  <span className="text-xs">
                    {expandedCategories.has(categoryData.category) ? "−" : "+"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-2 pt-1">
                {categoryData.steps.map((stepType) => (
                  <Button
                    key={stepType.value}
                    variant="ghost"
                    className="w-full text-left justify-start text-xs py-1 px-2 hover:bg-gray-100"
                    onClick={() => {
                      onAdd(stepType.value as AutomationStep["type"]);
                    }}
                  >
                    <stepType.icon className="h-4 w-4 mr-2" />
                    {stepType.label}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Conditionals section */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1">Conditionals</div>
            <Button
              variant="outline"
              className="w-full text-left justify-start text-xs py-1 px-2 h-auto"
              onClick={() => {
                onAdd("browserConditional");
              }}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Browser Conditional
            </Button>
            <Button
              variant="outline"
              className="w-full text-left justify-start text-xs py-1 px-2 h-auto"
              onClick={() => {
                onAdd("variableConditional");
              }}
            >
              <Variable className="h-4 w-4 mr-2" />
              Variable Conditional
            </Button>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default AddStepPopup;
