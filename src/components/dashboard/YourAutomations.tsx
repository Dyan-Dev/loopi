import { Download, Edit, Plus, Trash2 } from "lucide-react";
import type { StoredAutomation } from "../../types";
import { exportAutomation } from "../../utils/automationIO";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { formatDateTime } from "../ui/utils";

interface YourAutomationsProps {
  automations: StoredAutomation[];
  totalAutomations: number;
  onEditAutomation: (automation: StoredAutomation) => void;
  onDeleteAutomation: (automationId: string) => Promise<void>;
}

export function YourAutomations({
  automations,
  totalAutomations,
  onEditAutomation,
  onDeleteAutomation,
}: YourAutomationsProps) {
  const handleDelete = async (automation: StoredAutomation) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${automation.name}"? This action cannot be undone.`
    );
    if (confirmDelete) {
      await onDeleteAutomation(automation.id);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Automations</h2>
        <p className="text-sm text-muted-foreground">{totalAutomations} total</p>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No automations yet</h3>
                <p className="text-sm text-muted-foreground">
                  Get started by creating your first automation or loading an example
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <Card
              key={automation.id}
              className="relative hover:shadow-lg transition-shadow hover:z-10 hover:bg-accent hover:border-accent"
            >
              <CardHeader className="py-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{automation.name}</CardTitle>
                    </div>

                    <CardDescription>
                      <span className="text-lg">{automation.description}</span>
                      <br />
                      <span className="text-sm mt-2 block">
                        <span className="font-sm">Last Modified:</span>{" "}
                        {formatDateTime(automation.updatedAt, {
                          timeStyle: "short",
                          hour12: true,
                        })}
                      </span>
                    </CardDescription>
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2 self-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAutomation(automation)}
                      title="Edit"
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportAutomation(automation)}
                      title="Export"
                      className="cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(automation)}
                      title="Delete"
                      className="text-destructive hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
