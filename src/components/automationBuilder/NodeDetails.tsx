import { ReactFlowNode, Node } from "../../types/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Trash2, Target } from "lucide-react"; // Added Target icon for the pick button

export default function NodeDetails({
  node,
  onUpdate,
  setBrowserOpen,
  recentUrl,
}: {
  node: ReactFlowNode;
  onUpdate: (
    sourceId: string,
    type: "update" | "delete",
    updates?: Partial<Node["data"]>
  ) => void;
  setBrowserOpen: (isOpen: boolean) => void;
  recentUrl: string;
}) {
  const { data, id } = node;

  // Helper function to handle picking a selector
  const handlePickSelector = async (setter: (selector: string) => void) => {
    if (!(window as any).electronAPI?.pickSelector) {
      alert("Electron API not available. Ensure the browser is set up.");
      return;
    }
    try {
      const selector = await (window as any).electronAPI.pickSelector(
        recentUrl
      );
      if (selector) {
        if(data.step.type === "selectOption") {
          const sel = selector.toString().split("||");
          setter(sel[0]);
          onUpdate(id, "update", {
            step: {
              ...data.step,
              selector: sel[0],
              optionIndex: sel[1] ? parseInt(sel[1]) : undefined,
              optionValue: sel[2] || "",
            },
          });
          console.log("Option selector picked:", selector);
        }else {
          setter(selector);
        }
      }
      // Refocus main window (your React app)
      (window as any).electronAPI.focusMainWindow?.(); // Add this IPC if needed
    } catch (err: any) {
      console.error("Selector pick failed:", err);
      alert(
        err.message ||
          "Failed to pick selector. Ensure the browser is open and try again."
      );
    }
  };

  return (
    <Card className="w-80 max-h-[80vh] overflow-y-auto">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize">
            {data.step ? data.step.type : "Conditional"}
          </span>
          {id !== "1" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onUpdate(id, "delete");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {data.step ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input
                value={data.step.description || ""}
                onChange={(e) => {
                  onUpdate(id, "update", {
                    step: { ...data.step, description: e.target.value },
                  });
                }}
                className="text-xs"
                placeholder="Step description"
              />
            </div>
            {data.step.type === "navigate" && (
              <div className="space-y-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={data.step.value || ""}
                  placeholder="https://google.com"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {(data.step.type === "click" ||
              data.step.type === "type" ||
              data.step.type === "extractWithLogic" ||
              data.step.type === "selectOption") && (
              <div className="space-y-2">
                <Label className="text-xs">CSS Selector</Label>
                <div className="flex gap-2">
                  <Input
                    value={data.step.selector || ""}
                    placeholder="CSS Selector"
                    onChange={(e) => {
                      onUpdate(id, "update", {
                        step: { ...data.step, selector: e.target.value },
                      });
                    }}
                    className="text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setBrowserOpen(true);
                      await handlePickSelector((selector) =>
                        onUpdate(id, "update", {
                          step: { ...data.step, selector },
                        })
                      );
                    }}
                    title="Pick element from browser"
                  >
                    <Target className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            {data.step.type === "type" && (
              <div className="space-y-2">
                <Label className="text-xs">Text to Type</Label>
                <Input
                  value={data.step.value || ""}
                  placeholder="Text to type"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "selectOption" && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Option Value</Label>
                  <Input
                    value={data.step.optionValue || ""}
                    placeholder="Option value to select"
                    onChange={(e) => {
                      onUpdate(id, "update", {
                        step: { ...data.step, optionValue: e.target.value },
                      });
                    }}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Option Index</Label>
                  <Input
                    type="number"
                    value={data.step.optionIndex || ""}
                    placeholder="Option index to select"
                    onChange={(e) => {
                      onUpdate(id, "update", {
                        step: {
                          ...data.step,
                          optionIndex: Number(e.target.value),
                        },
                      });
                    }}
                    className="text-xs"
                  />
                </div>
              </>
            )}
            {data.step.type === "wait" && (
              <div className="space-y-2">
                <Label className="text-xs">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={data.step.value || "1"}
                  placeholder="Milliseconds to wait"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "screenshot" && (
              <div className="space-y-2">
                <Label className="text-xs">Filename</Label>
                <Input
                  type="text"
                  value={data.step.value || ""}
                  placeholder="filename"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Condition Type</Label>
              <Select
                value={data.conditionType || "elementExists"}
                onValueChange={(value) => {
                  onUpdate(id, "update", {
                    conditionType: value as any,
                  });
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementExists">Element Exists</SelectItem>
                  <SelectItem value="valueMatches">Value Matches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Selector</Label>
              <div className="flex gap-2">
                <Input
                  value={data.selector || ""}
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      selector: e.target.value,
                    });
                  }}
                  placeholder="CSS Selector"
                  className="text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePickSelector((selector) =>
                      onUpdate(id, "update", { selector })
                    )
                  }
                  title="Pick element from browser"
                >
                  <Target className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {data.conditionType === "valueMatches" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Condition</Label>
                  <Select
                    value={data.condition || "equals"}
                    onValueChange={(value) => {
                      onUpdate(id, "update", {
                        condition: value as any,
                      });
                    }}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greaterThan">Greater Than</SelectItem>
                      <SelectItem value="lessThan">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expected Value</Label>
                  <Input
                    value={data.expectedValue || ""}
                    onChange={(e) => {
                      onUpdate(id, "update", {
                        expectedValue: e.target.value,
                      });
                    }}
                    placeholder="Expected value"
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
