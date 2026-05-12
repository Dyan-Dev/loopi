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
      const id = await window.electronAPI!.tree.save(automation);
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
      const exampleData = await window.electronAPI!.tree.loadExample(example.fileName);

      const automationToLoad = {
        ...exampleData,
        id: Date.now().toString(),
        updatedAt: new Date().toLocaleString(),
      };

      const id = await window.electronAPI!.tree.save(automationToLoad);
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
      await window.electronAPI!.tree.delete(automationId);

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

      const id = await window.electronAPI!.tree.save(newAutomation);
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
    <div className="relative p-6 space-y-6">
      {/* Editorial header band */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 sm:p-8 grain">
        <div className="absolute inset-0 mesh-warm opacity-40 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 surface-dotted opacity-20 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary mb-3">
              <span className="w-5 h-px bg-primary/60" />
              Workspace
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.05] tracking-tight mb-2">
              Build what you want.{" "}
              <em className="not-italic ink-gradient">Loopi runs it.</em>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {totalAutomations === 0
                ? "No automations yet. Start from scratch, import a file, or ask the AI copilot to draft one for you."
                : `${totalAutomations} automation${totalAutomations === 1 ? "" : "s"} ready to run. Drop into the builder or schedule them up.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={onCreateAutomation}
              size="lg"
              className="shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Automation
            </Button>
            <Button onClick={handleImportAutomation} variant="outline" size="lg" className="backdrop-blur bg-card/80">
              <Upload className="h-5 w-5 mr-2" />
              Import
            </Button>
            <Button onClick={() => setAiDialogOpen(true)} variant="outline" size="lg" className="backdrop-blur bg-card/80 group">
              <Sparkles className="h-5 w-5 mr-2 text-primary group-hover:rotate-12 transition-transform" />
              AI Generate
            </Button>
          </div>
        </div>
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
