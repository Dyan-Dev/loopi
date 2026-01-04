import type { Credential } from "@app-types/globals";
import { Key, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function CredentialsManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "twitter" as Credential["type"],
    data: {} as Record<string, string>,
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    const creds = await window.electronAPI?.credentials.list();
    setCredentials(creds || []);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;

    await window.electronAPI?.credentials.add({
      name: formData.name,
      type: formData.type,
      data: formData.data,
    });

    setIsAddDialogOpen(false);
    resetForm();
    loadCredentials();
  };

  const handleEdit = async () => {
    if (!editingCredential) return;

    await window.electronAPI?.credentials.update(editingCredential.id, {
      name: formData.name,
      data: formData.data,
    });

    setIsEditDialogOpen(false);
    setEditingCredential(null);
    resetForm();
    loadCredentials();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      await window.electronAPI?.credentials.delete(id);
      loadCredentials();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "twitter",
      data: {},
    });
  };

  const openEditDialog = (credential: Credential) => {
    setEditingCredential(credential);
    setFormData({
      name: credential.name,
      type: credential.type,
      data: credential.data,
    });
    setIsEditDialogOpen(true);
  };

  const updateFormField = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));
  };

  const getFieldsForType = (type: Credential["type"]) => {
    switch (type) {
      case "twitter":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "apiSecret", label: "API Secret", type: "password" },
          { key: "accessToken", label: "Access Token", type: "password" },
          { key: "accessSecret", label: "Access Token Secret", type: "password" },
        ];
      case "discord":
        return [
          { key: "botToken", label: "Bot Token", type: "password" },
          { key: "clientId", label: "Client ID (optional)", type: "text" },
          { key: "clientSecret", label: "Client Secret (optional)", type: "password" },
        ];
      case "oauth":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "redirectUri", label: "Redirect URI", type: "text" },
        ];
      case "apiKey":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "apiUrl", label: "API URL (optional)", type: "text" },
        ];
      case "basic":
        return [
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" },
        ];
      default:
        return [];
    }
  };

  const renderCredentialForm = () => {
    const fields = getFieldsForType(formData.type);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Credential Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., My Twitter Account"
          />
        </div>

        {!editingCredential && (
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  type: value as Credential["type"],
                  data: {},
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="apiKey">API Key</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type={field.type}
              value={formData.data[field.key] || ""}
              onChange={(e) => updateFormField(field.key, e.target.value)}
              placeholder={field.label}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Credentials</h2>
          <p className="text-sm text-muted-foreground">
            Manage your API keys and authentication credentials
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      {credentials.length === 0 ? (
        <Card className="p-8 text-center">
          <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No credentials yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first credential to use in automations
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred) => (
            <Card key={cred.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{cred.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {cred.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(cred.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2 space-y-1">
                    {Object.keys(cred.data).map((key) => (
                      <div key={key} className="text-xs text-muted-foreground">
                        <span className="font-medium">{key}:</span> ••••••••
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(cred)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cred.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credential</DialogTitle>
            <DialogDescription>Add a new credential to use in your automations</DialogDescription>
          </DialogHeader>
          {renderCredentialForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Credential</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
            <DialogDescription>Update your credential information</DialogDescription>
          </DialogHeader>
          {renderCredentialForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
