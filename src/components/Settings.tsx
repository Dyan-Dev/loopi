import type { AppSettings } from "@app-types/globals";
import { FolderOpen, Key, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CredentialsManager } from "./CredentialsManager";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const applyTheme = (theme: "light" | "dark" | "system") => {
  const root = document.documentElement;
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", isDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
};

const getCurrentTheme = (): "light" | "dark" | "system" => {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: getCurrentTheme() as "light" | "dark" | "system",
    enableNotifications: true,
    downloadPath: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electronAPI?.settings.load();
        if (savedSettings) {
          setSettings(savedSettings);
          applyTheme(savedSettings.theme);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    if (!loading) {
      window.electronAPI?.settings.save(settings).catch((error) => {
        console.error("Failed to auto-save settings:", error);
      });
    }
  }, [settings, loading]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Credentials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Sun className="h-5 w-5 mr-2" />
                Appearance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme" className="text-base">
                    Theme
                  </Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: "light" | "dark" | "system") => {
                      setSettings({ ...settings, theme: value });
                    }}
                  >
                    <SelectTrigger id="theme" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Downloads</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="downloadPath" className="text-base mb-2 block">
                    Download Location
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="downloadPath"
                      type="text"
                      value={settings.downloadPath || ""}
                      onChange={(e) => {
                        setSettings({ ...settings, downloadPath: e.target.value });
                      }}
                      placeholder="Enter download directory path"
                      className="flex-1"
                    />
                    <Button
                      onClick={async () => {
                        try {
                          const path = await window.electronAPI?.selectFolder?.();
                          if (path) {
                            setSettings({ ...settings, downloadPath: path });
                          }
                        } catch (error) {
                          console.error("Failed to select folder:", error);
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    All downloads will be saved to this directory
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-base">
                    Enable Notifications
                  </Label>
                  <Switch
                    id="notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, enableNotifications: checked });
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for automation execution status and errors
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">About</h2>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">App Name:</span> Loopi
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Version:</span> 1.4.0
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Platform:</span> Workflow Automation
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Developed by:</span> Loopi Team
                  <span className="text-xs text-muted-foreground ml-2">(c) 2025</span>
                  <span className="text-xs text-muted-foreground ml-2">All rights reserved.</span>
                </p>

                <p className="text-sm">
                  Loopi is an open-source project. Visit our GitHub repository at{" "}
                  <span className="text-primary font-medium">
                    https://github.com/Dyan-Dev/loopi
                  </span>{" "}
                  to contribute or report issues.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="credentials">
            <CredentialsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
