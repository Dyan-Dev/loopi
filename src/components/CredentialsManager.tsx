import type { Credential } from "@app-types/globals";
import { Key, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    {
      await window.electronAPI?.credentials.delete(id);
      toast.success("Credential deleted");
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
      case "slack":
        return [
          { key: "apiToken", label: "API Token (Bot or User)", type: "password" },
          { key: "botToken", label: "Bot Token (optional)", type: "password" },
        ];
      case "openai":
        return [{ key: "apiKey", label: "OpenAI API Key", type: "password" }];
      case "anthropic":
        return [{ key: "apiKey", label: "Anthropic API Key", type: "password" }];
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
      // ─── Integration credentials ──────────────────────────────
      case "telegram":
        return [{ key: "botToken", label: "Bot Token", type: "password" }];
      case "github":
        return [{ key: "accessToken", label: "Personal Access Token", type: "password" }];
      case "notion":
        return [{ key: "apiKey", label: "Integration Token", type: "password" }];
      case "sendgrid":
        return [{ key: "apiKey", label: "API Key", type: "password" }];
      case "stripe":
        return [{ key: "secretKey", label: "Secret Key", type: "password" }];
      case "postgres":
        return [
          { key: "host", label: "Host", type: "text" },
          { key: "port", label: "Port", type: "text" },
          { key: "user", label: "User", type: "text" },
          { key: "password", label: "Password", type: "password" },
          { key: "database", label: "Database", type: "text" },
        ];
      case "mysql":
        return [
          { key: "host", label: "Host", type: "text" },
          { key: "port", label: "Port", type: "text" },
          { key: "user", label: "User", type: "text" },
          { key: "password", label: "Password", type: "password" },
          { key: "database", label: "Database", type: "text" },
        ];
      case "mongodb":
        return [{ key: "connectionString", label: "Connection String", type: "password" }];
      case "redis":
        return [
          { key: "host", label: "Host", type: "text" },
          { key: "port", label: "Port", type: "text" },
          { key: "password", label: "Password (optional)", type: "password" },
        ];
      case "googleSheets":
      case "googleCalendar":
      case "googleDrive":
      case "gmail":
        return [
          { key: "apiKey", label: "API Key / Service Account Key", type: "password" },
          { key: "accessToken", label: "OAuth Access Token (optional)", type: "password" },
        ];
      case "airtable":
        return [{ key: "apiKey", label: "API Key / Personal Access Token", type: "password" }];
      case "jira":
        return [
          { key: "email", label: "Email", type: "text" },
          { key: "apiToken", label: "API Token", type: "password" },
        ];
      case "hubspot":
        return [{ key: "accessToken", label: "Access Token", type: "password" }];
      case "twilio":
        return [
          { key: "accountSid", label: "Account SID", type: "text" },
          { key: "authToken", label: "Auth Token", type: "password" },
        ];
      case "mailchimp":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "server", label: "Server Prefix (e.g. us1)", type: "text" },
        ];
      case "zoom":
        return [{ key: "accessToken", label: "OAuth Access Token", type: "password" }];
      case "supabase":
        return [{ key: "apiKey", label: "Service Role Key", type: "password" }];
      case "salesforce":
        return [{ key: "accessToken", label: "Access Token", type: "password" }];
      case "trello":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "apiToken", label: "API Token", type: "password" },
        ];
      case "awsS3":
        return [
          { key: "accessKeyId", label: "Access Key ID", type: "text" },
          { key: "secretAccessKey", label: "Secret Access Key", type: "password" },
          { key: "region", label: "Region", type: "text" },
        ];
      case "shopify":
        return [{ key: "accessToken", label: "Admin API Access Token", type: "password" }];
      case "asana":
      case "linear":
      case "clickup":
      case "monday":
      case "todoist":
      case "baserow":
      case "nocodb":
      case "coda":
        return [{ key: "apiKey", label: "API Key / Token", type: "password" }];
      case "dropbox":
      case "box":
        return [{ key: "accessToken", label: "Access Token", type: "password" }];
      case "gitlab":
        return [{ key: "accessToken", label: "Personal Access Token", type: "password" }];
      case "paypal":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "sandbox", label: "Sandbox Mode (true/false)", type: "text" },
        ];
      case "typeform":
        return [{ key: "accessToken", label: "Personal Access Token", type: "password" }];
      case "calendly":
        return [{ key: "accessToken", label: "Personal Access Token", type: "password" }];
      case "whatsapp":
        return [
          { key: "accessToken", label: "Access Token", type: "password" },
          { key: "phoneNumberId", label: "Phone Number ID", type: "text" },
        ];
      case "intercom":
        return [{ key: "accessToken", label: "Access Token", type: "password" }];
      case "zendesk":
        return [
          { key: "email", label: "Email", type: "text" },
          { key: "apiToken", label: "API Token", type: "password" },
          { key: "subdomain", label: "Subdomain", type: "text" },
        ];
      case "freshdesk":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "domain", label: "Domain (e.g. yourcompany)", type: "text" },
        ];
      case "woocommerce":
        return [
          { key: "consumerKey", label: "Consumer Key", type: "password" },
          { key: "consumerSecret", label: "Consumer Secret", type: "password" },
          { key: "siteUrl", label: "Site URL", type: "text" },
        ];
      case "activecampaign":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "baseUrl", label: "Account URL", type: "text" },
        ];
      case "bitly":
        return [{ key: "accessToken", label: "Access Token", type: "password" }];
      case "circleci":
        return [{ key: "apiToken", label: "API Token", type: "password" }];
      case "jenkins":
        return [
          { key: "username", label: "Username", type: "text" },
          { key: "apiToken", label: "API Token", type: "password" },
          { key: "baseUrl", label: "Jenkins URL", type: "text" },
        ];
      case "cloudflare":
        return [
          { key: "apiToken", label: "API Token", type: "password" },
          { key: "accountId", label: "Account ID (optional)", type: "text" },
        ];
      case "convertkit":
        return [{ key: "apiSecret", label: "API Secret", type: "password" }];
      case "contentful":
        return [
          { key: "accessToken", label: "Content Management Token", type: "password" },
          { key: "spaceId", label: "Space ID", type: "text" },
        ];
      case "mattermost":
        return [
          { key: "accessToken", label: "Personal Access Token", type: "password" },
          { key: "baseUrl", label: "Server URL", type: "text" },
        ];
      case "pagerduty":
        return [{ key: "apiKey", label: "API Key", type: "password" }];
      case "sentry":
        return [
          { key: "authToken", label: "Auth Token", type: "password" },
          { key: "organization", label: "Organization Slug", type: "text" },
        ];
      case "snowflake":
        return [
          { key: "account", label: "Account", type: "text" },
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" },
          { key: "warehouse", label: "Warehouse", type: "text" },
          { key: "database", label: "Database", type: "text" },
        ];
      case "graphql":
        return [
          { key: "apiKey", label: "API Key / Bearer Token", type: "password" },
          { key: "endpoint", label: "GraphQL Endpoint URL", type: "text" },
        ];
      case "elasticsearch":
        return [
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" },
          { key: "baseUrl", label: "Cluster URL", type: "text" },
        ];
      case "grafana":
        return [
          { key: "apiKey", label: "API Key", type: "password" },
          { key: "baseUrl", label: "Grafana URL", type: "text" },
        ];
      case "netlify":
        return [{ key: "accessToken", label: "Personal Access Token", type: "password" }];
      case "wordpress":
        return [
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Application Password", type: "password" },
          { key: "siteUrl", label: "Site URL", type: "text" },
        ];
      case "xero":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "accessToken", label: "Access Token", type: "password" },
          { key: "tenantId", label: "Tenant ID", type: "text" },
        ];
      case "quickbooks":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "accessToken", label: "Access Token", type: "password" },
          { key: "realmId", label: "Realm ID", type: "text" },
        ];
      case "pipedrive":
        return [{ key: "apiToken", label: "API Token", type: "password" }];
      case "helpscout":
        return [
          { key: "appId", label: "App ID", type: "text" },
          { key: "appSecret", label: "App Secret", type: "password" },
        ];
      case "reddit":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" },
        ];
      case "spotify":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "accessToken", label: "Access Token (optional)", type: "password" },
        ];
      case "servicenow":
        return [
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" },
          { key: "instanceUrl", label: "Instance URL", type: "text" },
        ];
      case "ghost":
        return [
          { key: "apiKey", label: "Admin API Key", type: "password" },
          { key: "apiUrl", label: "API URL", type: "text" },
        ];
      case "webflow":
        return [{ key: "accessToken", label: "API Token", type: "password" }];
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
              <SelectContent className="max-h-64 overflow-y-auto">
                {/* General */}
                <SelectItem value="apiKey">API Key</SelectItem>
                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                {/* AI */}
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                {/* Communication */}
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="mattermost">Mattermost</SelectItem>
                {/* Email */}
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailchimp">Mailchimp</SelectItem>
                <SelectItem value="convertkit">ConvertKit</SelectItem>
                {/* Dev / Project */}
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="asana">Asana</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="clickup">ClickUp</SelectItem>
                <SelectItem value="monday">Monday.com</SelectItem>
                <SelectItem value="trello">Trello</SelectItem>
                <SelectItem value="todoist">Todoist</SelectItem>
                {/* Cloud / Storage */}
                <SelectItem value="awsS3">AWS S3</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="googleDrive">Google Drive</SelectItem>
                {/* Google */}
                <SelectItem value="googleSheets">Google Sheets</SelectItem>
                <SelectItem value="googleCalendar">Google Calendar</SelectItem>
                {/* Databases */}
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="mongodb">MongoDB</SelectItem>
                <SelectItem value="redis">Redis</SelectItem>
                <SelectItem value="supabase">Supabase</SelectItem>
                <SelectItem value="snowflake">Snowflake</SelectItem>
                <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                {/* CRM / Sales */}
                <SelectItem value="hubspot">HubSpot</SelectItem>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="pipedrive">Pipedrive</SelectItem>
                {/* Payments */}
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="xero">Xero</SelectItem>
                <SelectItem value="quickbooks">QuickBooks</SelectItem>
                {/* E-Commerce */}
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="woocommerce">WooCommerce</SelectItem>
                {/* Support */}
                <SelectItem value="zendesk">Zendesk</SelectItem>
                <SelectItem value="freshdesk">Freshdesk</SelectItem>
                <SelectItem value="intercom">Intercom</SelectItem>
                <SelectItem value="helpscout">Help Scout</SelectItem>
                {/* CMS / Content */}
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="contentful">Contentful</SelectItem>
                <SelectItem value="wordpress">WordPress</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="webflow">Webflow</SelectItem>
                <SelectItem value="coda">Coda</SelectItem>
                <SelectItem value="airtable">Airtable</SelectItem>
                <SelectItem value="baserow">Baserow</SelectItem>
                <SelectItem value="nocodb">NocoDB</SelectItem>
                {/* Phone / SMS */}
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="calendly">Calendly</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="typeform">Typeform</SelectItem>
                {/* DevOps / Infra */}
                <SelectItem value="circleci">CircleCI</SelectItem>
                <SelectItem value="jenkins">Jenkins</SelectItem>
                <SelectItem value="cloudflare">Cloudflare</SelectItem>
                <SelectItem value="netlify">Netlify</SelectItem>
                <SelectItem value="grafana">Grafana</SelectItem>
                <SelectItem value="sentry">Sentry</SelectItem>
                <SelectItem value="pagerduty">PagerDuty</SelectItem>
                <SelectItem value="servicenow">ServiceNow</SelectItem>
                {/* Marketing */}
                <SelectItem value="activecampaign">ActiveCampaign</SelectItem>
                <SelectItem value="bitly">Bitly</SelectItem>
                {/* Other */}
                <SelectItem value="graphql">GraphQL</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="spotify">Spotify</SelectItem>
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
