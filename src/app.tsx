import * as ReactDOM from "react-dom/client";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { CredentialVault } from "./components/CredentialVault";
import { AutomationBuilder } from "./components/AutomationBuilder";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Bot, Shield, Grid } from "lucide-react";
import { Automation, Credential } from "./types";
import "./index.css";

/**
 * Mock credentials for demonstration
 * In production, these would be stored securely and encrypted
 */
const mockCredentials: Credential[] = [
  {
    id: "gmail-creds",
    name: "Gmail Login",
    type: "username_password",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    encryptedValues: {
      username: "••••••••@gmail.com",
      password: "••••••••",
    },
  },
  {
    id: "twitter-creds",
    name: "Twitter API",
    type: "api_key",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    encryptedValues: {
      apiKey: "••••••••••••••••",
      apiSecret: "••••••••••••••••",
    },
  },
];

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
  const [currentView, setCurrentView] = useState<
    "dashboard" | "credentials" | "builder"
  >("dashboard");
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials);
  const [selectedAutomation, setSelectedAutomation] =
    useState<Automation | null>(null);

  const handleCreateAutomation = () => {
    setSelectedAutomation(null);
    setCurrentView("builder");
  };

  const handleEditAutomation = (automation: Automation) => {
    setSelectedAutomation(automation);
    setCurrentView("builder");
  };

  const handleSaveAutomation = (automation: Automation) => {
    if (selectedAutomation) {
      // Update existing automation
      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? automation : a))
      );
    } else {
      // Add new automation
      setAutomations((prev) => [...prev, automation]);
    }
    setSelectedAutomation(null);
    setCurrentView("dashboard");
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
              onValueChange={(value) => setCurrentView(value as any)}
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
                <TabsTrigger value="credentials">
                  <Shield className="h-4 w-4 mr-1" />
                  Credentials
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
            onManageCredentials={() => setCurrentView("credentials")}
            onUpdateAutomations={setAutomations}
          />
        )}

        {currentView === "credentials" && (
          <CredentialVault
            credentials={credentials}
            onUpdateCredentials={setCredentials}
            onBack={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "builder" && (
          <AutomationBuilder
            automation={selectedAutomation}
            credentials={credentials}
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
