import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackUploadFileStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackUploadFile") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Channel ID</Label>
        <Input
          value={step.channelId || ""}
          placeholder="Channel ID (e.g., C123456)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, channelId: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">File Path</Label>
        <Input
          value={step.filePath || ""}
          placeholder="Path to file or URL to download from"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, filePath: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">File Name (optional)</Label>
        <Input
          value={step.fileName || ""}
          placeholder="Filename (e.g., report.txt)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, fileName: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Title (optional)</Label>
        <Input
          value={step.title || ""}
          placeholder="Display title for the file"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, title: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Initial Comment (optional)</Label>
        <Input
          value={step.initialComment || ""}
          placeholder="Comment to add with the file"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, initialComment: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      <SlackCredentialField
        credentialId={step.credentialId}
        apiToken={step.apiToken}
        botToken={step.botToken}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />

      <div className="space-y-2">
        <Label className="text-xs">Store Response (optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
