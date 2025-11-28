import { Download, Edit, Plus, Upload } from "lucide-react";
import type { Automation } from "../types";
import { exportAutomation, importAutomation } from "../utils/automationIO";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface DashboardProps {
  automations: Automation[];
  onCreateAutomation: () => void;
  onEditAutomation: (automation: Automation) => void;
  onUpdateAutomations: (automations: Automation[]) => void;
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
      onUpdateAutomations([...automations, automation]);
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{automation.name}</CardTitle>
                      </div>
                      <CardDescription>{automation.description}</CardDescription>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-2">
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
