import type { Credential } from "@app-types/globals";
import { CredentialSelector } from "@components/ui/credential-selector";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import type { StepProps } from "../types";

interface SharedCredentialFieldsProps {
  step: StepProps["step"];
  id: string;
  onUpdate: StepProps["onUpdate"];
  serviceName: string;
  hasStoreKey?: boolean;
  credentialType?: Credential["type"];
}

export function SharedCredentialFields({
  step,
  id,
  onUpdate,
  serviceName,
  hasStoreKey = true,
  credentialType,
}: SharedCredentialFieldsProps) {
  // Resolve the credential type from the service name if not explicitly provided
  const resolvedType = credentialType || serviceNameToCredentialType(serviceName);

  return (
    <>
      <div className="space-y-2">
        <CredentialSelector
          value={"credentialId" in step ? (step.credentialId as string) || undefined : undefined}
          onChange={(credId) => onUpdate(id, "update", { step: { ...step, credentialId: credId } })}
          type={resolvedType}
          label={`${serviceName} Credential`}
        />
      </div>
      {hasStoreKey && (
        <div className="space-y-2">
          <Label className="text-xs">Store Response As Variable</Label>
          <Input
            value={"storeKey" in step ? (step.storeKey as string) || "" : ""}
            placeholder={`${serviceName.toLowerCase()}Response`}
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })
            }
            className="text-xs"
          />
          <p className="text-xs text-gray-500">
            Leave empty to skip. Response available as {"{{variableName}}"} in next steps.
          </p>
        </div>
      )}
    </>
  );
}

/** Map display service name to credential type */
function serviceNameToCredentialType(serviceName: string): Credential["type"] {
  const map: Record<string, Credential["type"]> = {
    Discord: "discord",
    Slack: "slack",
    Twitter: "twitter",
    Telegram: "telegram",
    GitHub: "github",
    Notion: "notion",
    SendGrid: "sendgrid",
    Stripe: "stripe",
    PostgreSQL: "postgres",
    "Google Sheets": "googleSheets",
    Airtable: "airtable",
    Jira: "jira",
    HubSpot: "hubspot",
    Twilio: "twilio",
    Mailchimp: "mailchimp",
    Zoom: "zoom",
    Supabase: "supabase",
    Salesforce: "salesforce",
    Trello: "trello",
    "Google Calendar": "googleCalendar",
    "Google Drive": "googleDrive",
    Gmail: "gmail",
    MongoDB: "mongodb",
    MySQL: "mysql",
    Redis: "redis",
    "AWS S3": "awsS3",
    Shopify: "shopify",
    Asana: "asana",
    Linear: "linear",
    ClickUp: "clickup",
    "Monday.com": "monday",
    Dropbox: "dropbox",
    Box: "box",
    GitLab: "gitlab",
    PayPal: "paypal",
    Typeform: "typeform",
    Calendly: "calendly",
    WhatsApp: "whatsapp",
    Intercom: "intercom",
    Zendesk: "zendesk",
    Freshdesk: "freshdesk",
    WooCommerce: "woocommerce",
    ActiveCampaign: "activecampaign",
    Bitly: "bitly",
    CircleCI: "circleci",
    Jenkins: "jenkins",
    Cloudflare: "cloudflare",
    ConvertKit: "convertkit",
    Contentful: "contentful",
    Mattermost: "mattermost",
    PagerDuty: "pagerduty",
    Sentry: "sentry",
    Todoist: "todoist",
    NocoDB: "nocodb",
    Snowflake: "snowflake",
    GraphQL: "graphql",
    Crypto: "apiKey",
    Baserow: "baserow",
    Elasticsearch: "elasticsearch",
    Grafana: "grafana",
    Netlify: "netlify",
    WordPress: "wordpress",
    Xero: "xero",
    QuickBooks: "quickbooks",
    Pipedrive: "pipedrive",
    "Help Scout": "helpscout",
    Reddit: "reddit",
    Spotify: "spotify",
    ServiceNow: "servicenow",
    Ghost: "ghost",
    Webflow: "webflow",
    Coda: "coda",
  };
  return map[serviceName] || "apiKey";
}
