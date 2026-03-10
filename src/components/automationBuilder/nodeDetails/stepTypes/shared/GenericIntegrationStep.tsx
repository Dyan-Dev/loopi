import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import type { StepProps } from "../types";
import { SharedCredentialFields } from "./SharedCredentialFields";

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: "input" | "textarea" | "select" | "checkbox";
  options?: { value: string; label: string }[];
}

export interface IntegrationOperationDef {
  stepType: string;
  fields: FieldDef[];
  hasStoreKey?: boolean;
}

interface GenericIntegrationStepProps extends StepProps {
  serviceName: string;
  operations: IntegrationOperationDef[];
}

export function GenericIntegrationStep({
  step,
  id,
  onUpdate,
  serviceName,
  operations,
}: GenericIntegrationStepProps) {
  const opDef = operations.find((o) => o.stepType === step.type);
  if (!opDef) return null;

  const renderField = (field: FieldDef) => {
    const value = ((step as unknown as Record<string, unknown>)[field.key] as string) || "";

    if (field.type === "textarea") {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="text-xs">
            {field.label}
            {field.required ? " *" : ""}
          </Label>
          <Textarea
            value={value}
            placeholder={field.placeholder}
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, [field.key]: e.target.value } })
            }
            className="text-xs min-h-20"
          />
          {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
        </div>
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="text-xs">
            {field.label}
            {field.required ? " *" : ""}
          </Label>
          <Select
            value={value || field.options[0]?.value}
            onValueChange={(v) => onUpdate(id, "update", { step: { ...step, [field.key]: v } })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div key={field.key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean((step as unknown as Record<string, unknown>)[field.key])}
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, [field.key]: e.target.checked } })
            }
            className="h-3 w-3"
          />
          <Label className="text-xs">{field.label}</Label>
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label className="text-xs">
          {field.label}
          {field.required ? " *" : ""}
        </Label>
        <Input
          value={value}
          placeholder={field.placeholder}
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, [field.key]: e.target.value } })
          }
          className="text-xs"
        />
        {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {opDef.fields.map(renderField)}
      <SharedCredentialFields
        step={step}
        id={id}
        onUpdate={onUpdate}
        serviceName={serviceName}
        hasStoreKey={opDef.hasStoreKey !== false}
      />
    </div>
  );
}
