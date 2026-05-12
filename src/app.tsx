import { AgentsPanel } from "@components/AgentsPanel";
import { AutomationBuilder } from "@components/AutomationBuilder";
import { Chat } from "@components/Chat";
import { Dashboard } from "@components/Dashboard";
import { Settings } from "@components/Settings";
import { Button } from "@components/ui/button";
import { Toaster } from "@components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { WorkflowScheduler } from "@components/WorkflowScheduler";
import { Bot, Grid, MessageSquare, Settings as SettingsIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { toast } from "sonner";
import loopLogo from "../assets/logo.png";
import "./index.css";
import type { StoredAutomation } from "@app-types";

/**
 * App - Root application component
 *
 * Manages:
 * - View routing (Dashboard, Builder, Settings)
 * - Global automation state
 * - Create/Edit/Save automation workflows
 */
export default function App() {
  const [currentView, setCurrentView] = useState<
    "chat" | "agents" | "dashboard" | "builder" | "scheduler" | "settings"
  >("chat");
  const [automations, setAutomations] = useState<StoredAutomation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<StoredAutomation | null>(null);

  useEffect(() => {
    const loadAndApplyTheme = async () => {
      try {
        const settings = await window.electronAPI?.settings.load();
        if (settings) {
          const root = document.documentElement;
          if (settings.theme === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.toggle("dark", isDark);
          } else {
            root.classList.toggle("dark", settings.theme === "dark");
          }
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
        document.documentElement.classList.remove("dark");
      }
    };

    loadAndApplyTheme();
  }, []);

  useEffect(() => {
    const loadSavedTrees = async () => {
      const savedAutomations = await window.electronAPI?.tree.list();
      if (savedAutomations && savedAutomations.length > 0)
        savedAutomations.sort(
          (a: StoredAutomation, b: StoredAutomation) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      setAutomations(savedAutomations || []);
    };

    try {
      loadSavedTrees();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load saved automations");
    }
  }, []);

  useEffect(() => {
    if (automations.length === 0) return;

    const sorted = [...automations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (JSON.stringify(sorted) !== JSON.stringify(automations)) {
      setAutomations(sorted);
    }
  }, [automations]);

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
      setAutomations((prev) => prev.map((a) => (a.id === automation.id ? automation : a)));
    } else {
      setAutomations((prev) => [...prev, automation]);
    }
    try {
      const id = await window.electronAPI?.tree.save(automation);
      if (!id) throw new Error("Failed to retrieve saved file id");

      setSelectedAutomation(null);
      setCurrentView("dashboard");
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save: ${automation.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md -z-10" aria-hidden />
              <img src={loopLogo} alt="Loopi" className="h-8 w-8 relative" />
            </div>
            <h1 className="font-serif text-xl tracking-tight">
              <span className="ink-gradient">Loopi</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Tabs
              value={currentView}
              onValueChange={(value: string) => {
                if (
                  value === "chat" ||
                  value === "agents" ||
                  value === "dashboard" ||
                  value === "builder" ||
                  value === "scheduler" ||
                  value === "settings"
                ) {
                  setCurrentView(
                    value as "chat" | "agents" | "dashboard" | "builder" | "scheduler" | "settings"
                  );
                }
              }}
            >
              <TabsList className="h-10 p-1 rounded-xl bg-muted/60 backdrop-blur">
                <TabsTrigger
                  value="chat"
                  className="rounded-lg px-3 data-[state=active]:bg-card data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_6px_-2px_rgba(42,19,11,0.1)] data-[state=active]:text-primary"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="agents"
                  className="rounded-lg px-3 data-[state=active]:bg-card data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_6px_-2px_rgba(42,19,11,0.1)] data-[state=active]:text-primary"
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Agents
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="rounded-lg px-3 data-[state=active]:bg-card data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_6px_-2px_rgba(42,19,11,0.1)] data-[state=active]:text-primary"
                >
                  <Grid className="h-4 w-4 mr-1.5" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="builder"
                  className="rounded-lg px-3 data-[state=active]:bg-card data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_6px_-2px_rgba(42,19,11,0.1)] data-[state=active]:text-primary"
                >
                  <Bot className="h-4 w-4 mr-1.5" />
                  Builder
                </TabsTrigger>
                <TabsTrigger
                  value="scheduler"
                  className="rounded-lg px-3 data-[state=active]:bg-card data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_6px_-2px_rgba(42,19,11,0.1)] data-[state=active]:text-primary"
                >
                  <SettingsIcon className="h-4 w-4 mr-1.5" />
                  Scheduler
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("settings")}
              className={
                currentView === "settings"
                  ? "bg-accent text-primary rounded-xl"
                  : "rounded-xl hover:text-primary"
              }
              title="Settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === "chat" && <Chat />}

        {currentView === "agents" && <AgentsPanel onOpenWorkflow={handleEditAutomation} />}

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
            automation={selectedAutomation ?? undefined}
            onSave={handleSaveAutomation}
            onCancel={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "scheduler" && <WorkflowScheduler automations={automations} />}

        {currentView === "settings" && <Settings />}
      </main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app")!);
  root.render(<App />);
}

render();
