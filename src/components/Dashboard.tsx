import type { StoredAutomation } from "@app-types";
import { importAutomation } from "@utils/automationIO";
import { BookOpen, History, Plus, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiGeneratorDialog } from "./dashboard/AiGeneratorDialog";
import { EXAMPLES, ExamplesComponent } from "./dashboard/ExamplesComponent";
import { ExecutionHistory } from "./dashboard/ExecutionHistory";
import { YourAutomations } from "./dashboard/YourAutomations";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
  const [activeTab, setActiveTab] = useState("your-automations");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handleImportAutomation = async () => {
    try {
      const automation = await importAutomation();
      const id = await window.electronAPI.tree.save(automation);
      if (id) {
        onUpdateAutomations([...automations, automation]);
      }
    } catch (error) {
      console.error("Failed to import automation:", error);
      toast.error("Failed to import automation. Please check the file format.");
    }
  };

  const handleLoadExample = async (example: (typeof EXAMPLES)[0]) => {
    try {
      // Load example from docs/examples folder via IPC
      const exampleData = await window.electronAPI.tree.loadExample(example.fileName);

      const automationToLoad = {
        ...exampleData,
        id: Date.now().toString(),
        updatedAt: new Date().toLocaleString(),
      };

      const id = await window.electronAPI.tree.save(automationToLoad);
      if (id) {
        onUpdateAutomations([...automations, automationToLoad]);
        setActiveTab("your-automations");
      }
    } catch (error) {
      console.error("Failed to load example:", error);
      toast.error(`Failed to load example: ${example.name}`);
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      // Delete from file system via IPC
      await window.electronAPI.tree.delete(automationId);

      // Update local state
      const updatedAutomations = automations.filter((a) => a.id !== automationId);
      onUpdateAutomations(updatedAutomations);
    } catch (error) {
      console.error("Failed to delete automation:", error);
      toast.error("Failed to delete automation. Please try again.");
    }
  };

  const handleAiWorkflowGenerated = async (data: {
    nodes: unknown[];
    edges: unknown[];
    name: string;
    description: string;
  }) => {
    try {
      const newAutomation: StoredAutomation = {
        id: Date.now().toString(),
        name: data.name || "AI Generated Workflow",
        description: data.description || "",
        updatedAt: new Date().toLocaleString(),
        nodes: data.nodes as StoredAutomation["nodes"],
        edges: data.edges as StoredAutomation["edges"],
        steps: [],
      };

      const id = await window.electronAPI.tree.save(newAutomation);
      if (id) {
        onUpdateAutomations([...automations, newAutomation]);
        onEditAutomation(newAutomation);
      }
    } catch (error) {
      console.error("Failed to save AI-generated workflow:", error);
      toast.error("Failed to save generated workflow.");
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
        <Button onClick={() => setAiDialogOpen(true)} variant="outline" size="lg">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Generate
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="your-automations">Your Automations</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Examples
          </TabsTrigger>
        </TabsList>

        {/* Your Automations Tab */}
        <TabsContent value="your-automations" className="space-y-4">
          <YourAutomations
            automations={automations}
            totalAutomations={totalAutomations}
            onEditAutomation={onEditAutomation}
            onDeleteAutomation={handleDeleteAutomation}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <ExecutionHistory />
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-4">
          <ExamplesComponent automations={automations} onLoadExample={handleLoadExample} />
        </TabsContent>
      </Tabs>

      {/* AI Generator Dialog */}
      <AiGeneratorDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onWorkflowGenerated={handleAiWorkflowGenerated}
      />
    </div>
  );
}
