import { Download, Edit, Plus, Upload } from "lucide-react";
import { StoredAutomation } from "../main/treeStore";
import { exportAutomation, importAutomation } from "../utils/automationIO";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { formatDateTime } from "./ui/utils";

interface DashboardProps {
  automations: StoredAutomation[];
  onCreateAutomation: () => void;
  onEditAutomation: (automation: StoredAutomation) => void;
  onUpdateAutomations: (automations: StoredAutomation[]) => void;
}

export function Dashboard({
  automations,
  onCreateAutomation,
  onEditAutomation,
  onUpdateAutomations,
}: DashboardProps) {
  const handleImportAutomation = async () => {
    try {
      const automation = await importAutomation();
      const id = await window.electronAPI.tree.save(automation);
      if (id) {
        onUpdateAutomations([...automations, automation]);
      }
    } catch (error) {
      console.error("Failed to import automation:", error);
      alert("Failed to import automation. Please check the file format.");
    }
  };

  const totalAutomations = automations.length;

  return (
    <div className="p-6 space-y-6">
      {/* Main Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onCreateAutomation} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Automation
        </Button>
        <Button onClick={handleImportAutomation} variant="outline" size="lg">
          <Upload className="h-5 w-5 mr-2" />
          Import
        </Button>
      </div>

      {/* Automations List */}
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
                    Get started by creating your first automation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="relative">
                <CardHeader className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{automation.name}</CardTitle>
                      </div>

                      <CardDescription>
                        <span className="text-xl">{automation.description}</span>
                        <br />
                        <span className="text-md mt-2 block">
                          <span className="font-medium">Last Modified:</span>{" "}
                          {formatDateTime(automation.updatedAt, { relative: true })}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-2 self-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditAutomation(automation)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportAutomation(automation)}
                        title="Export"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
