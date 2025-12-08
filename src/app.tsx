import { Bot, Grid } from "lucide-react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { AutomationBuilder } from "./components/AutomationBuilder";
import { Dashboard } from "./components/Dashboard";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import "./index.css";
import { StoredAutomation } from "./main/treeStore";

/**
 * App - Root application component
 *
 * Manages:
 * - View routing (Dashboard, Builder, Credentials)
 * - Global automation state
 * - Credential management
 * - Create/Edit/Save automation workflows
 */
export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "builder">("dashboard");
  const [automations, setAutomations] = useState<StoredAutomation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<StoredAutomation | null>(null);

  useEffect(() => {
    const loadSavedTrees = async () => {
      const savedAutomations = await window.electronAPI.tree.list();
      if (savedAutomations && savedAutomations.length > 0)
        savedAutomations.sort(
          (a: StoredAutomation, b: StoredAutomation) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      setAutomations(savedAutomations);
    };

    try {
      loadSavedTrees();
    } catch (err) {
      console.error(err);
      alert("Failed to load saved automations");
    }
  }, []);

  const handleCreateAutomation = () => {
    setSelectedAutomation(null);
    setCurrentView("builder");
  };

  const handleEditAutomation = (automation: StoredAutomation) => {
    setSelectedAutomation(automation);
    setCurrentView("builder");
  };

  const handleSaveAutomation = async (automation: StoredAutomation) => {
    if (selectedAutomation) {
      // Update existing automation
      setAutomations((prev) => prev.map((a) => (a.id === automation.id ? automation : a)));
    } else {
      // Add new automation
      setAutomations((prev) => [...prev, automation]);
    }
    try {
      const id = await window.electronAPI.tree.save(automation);
      if (!id) throw new Error("Failed to retrieve saved file id");

      setSelectedAutomation(null);
      setCurrentView("dashboard");
    } catch (err) {
      console.error(err);
      alert(`Failed to save: ${automation.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">Automation Platform</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Tabs
              value={currentView}
              onValueChange={(value: string) => {
                if (value === "dashboard" || value === "builder") setCurrentView(value);
              }}
            >
              <TabsList>
                <TabsTrigger value="dashboard">
                  <Grid className="h-4 w-4 mr-1" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="builder">
                  <Bot className="h-4 w-4 mr-1" />
                  Builder
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === "dashboard" && (
          <Dashboard
            automations={automations}
            onCreateAutomation={handleCreateAutomation}
            onEditAutomation={handleEditAutomation}
            onUpdateAutomations={setAutomations}
          />
        )}

        {currentView === "builder" && (
          <AutomationBuilder
            automation={selectedAutomation}
            onSave={handleSaveAutomation}
            onCancel={() => setCurrentView("dashboard")}
          />
        )}
      </main>
    </div>
  );
}

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
