import React from 'react'
import * as ReactDOM from 'react-dom/client';

import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { CredentialVault } from "./components/CredentialVault";
import { AutomationBuilder } from "./components/AutomationBuilder";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Bot, Shield, Settings, User } from "lucide-react";

// Mock data types
export interface Automation {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "paused";
  schedule: {
    type: "interval" | "fixed" | "manual";
    value?: string;
    interval?: number;
    unit?: "minutes" | "hours" | "days";
  };
  lastRun?: {
    timestamp: Date;
    success: boolean;
    duration?: number;
  };
  steps: AutomationStep[];
  linkedCredentials: string[];
}

export interface AutomationStep {
  id: string;
  type: "navigate" | "click" | "type" | "wait" | "screenshot" | "extract";
  selector?: string;
  value?: string;
  credentialId?: string;
  description: string;
}

export interface Credential {
  id: string;
  name: string;
  type: "username_password" | "api_key" | "oauth_token" | "custom";
  lastUpdated: Date;
  // In real app, values would be encrypted
  encryptedValues: Record<string, string>;
}

export interface ExecutionLog {
  id: string;
  automationId: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  steps: {
    stepId: string;
    success: boolean;
    error?: string;
    screenshot?: string;
  }[];
}

// Mock data
const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Gmail Email Check",
    description: "Check for new emails and extract subject lines",
    status: "idle",
    schedule: {
      type: "interval",
      interval: 30,
      unit: "minutes",
    },
    lastRun: {
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      success: true,
      duration: 12000,
    },
    steps: [
      {
        id: "1",
        type: "navigate",
        value: "https://gmail.com",
        description: "Navigate to Gmail",
      },
      {
        id: "2",
        type: "click",
        selector: "#signin",
        credentialId: "gmail-creds",
        description: "Click sign in and use Gmail credentials",
      },
    ],
    linkedCredentials: ["gmail-creds"],
  },
  {
    id: "2",
    name: "Social Media Monitoring",
    description: "Monitor social media mentions and save screenshots",
    status: "running",
    schedule: {
      type: "interval",
      interval: 2,
      unit: "hours",
    },
    lastRun: {
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      success: false,
      duration: 8000,
    },
    steps: [
      {
        id: "1",
        type: "navigate",
        value: "https://twitter.com",
        description: "Navigate to Twitter",
      },
    ],
    linkedCredentials: ["twitter-creds"],
  },
];

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

export default function App() {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "credentials" | "builder"
  >("dashboard");
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials);
  const [selectedAutomation, setSelectedAutomation] =
    useState<Automation | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login state

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
      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? automation : a))
      );
    } else {
      setAutomations((prev) => [
        ...prev,
        { ...automation, id: Date.now().toString() },
      ]);
    }
    setCurrentView("dashboard");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Automation Platform</h1>
              <p className="text-muted-foreground">
                Sign in to manage your automations
              </p>
            </div>
            <Button onClick={() => setIsLoggedIn(true)} className="w-full">
              Sign In (Mock)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="credentials">
                  <Shield className="h-4 w-4 mr-1" />
                  Credentials
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-1" />
              Profile
            </Button>
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
  root.render(<App/>);
}

render();
