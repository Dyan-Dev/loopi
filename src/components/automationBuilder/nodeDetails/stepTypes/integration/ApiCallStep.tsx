import { Button } from "@components/ui/button";
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
import { Trash2 } from "lucide-react";
import { StepProps } from "../types";

export function ApiCallStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "apiCall") return null;

  const handleAddHeader = () => {
    const newHeaders = { ...(step.headers || {}) };
    newHeaders["X-New-Header"] = "value";
    onUpdate(id, "update", { step: { ...step, headers: newHeaders } });
  };

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...(step.headers || {}) };
    delete newHeaders[key];
    onUpdate(id, "update", { step: { ...step, headers: newHeaders } });
  };

  const handleHeaderChange = (oldKey: string, newKey: string, newValue: string) => {
    const newHeaders = { ...(step.headers || {}) };
    if (oldKey !== newKey && oldKey in newHeaders) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = newValue;
    onUpdate(id, "update", { step: { ...step, headers: newHeaders } });
  };

  return (
    <div className="space-y-4">
      {/* Method Selection */}
      <div className="space-y-2">
        <Label className="text-xs">HTTP Method</Label>
        <Select
          value={step.method || "GET"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, method: value as "GET" | "POST" } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label className="text-xs">URL</Label>
        <Input
          value={step.url || ""}
          placeholder="https://api.example.com/endpoint"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, url: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variable syntax like: url/endpoint?id={"{"}productId{"}"}
        </p>
      </div>

      {/* Body (for POST) */}
      {step.method === "POST" && (
        <div className="space-y-2">
          <Label className="text-xs">Request Body (JSON)</Label>
          <Textarea
            value={step.body || ""}
            placeholder='{"key": "value"}'
            onChange={(e) => onUpdate(id, "update", { step: { ...step, body: e.target.value } })}
            className="text-xs min-h-24 font-mono"
          />
          <p className="text-xs text-gray-500">
            JSON or plain text. Supports variable syntax like: {"{"}varName{"}"}
          </p>
        </div>
      )}

      {/* Headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Headers</Label>
          <Button size="sm" variant="outline" onClick={handleAddHeader} className="text-xs h-6">
            + Add Header
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(step.headers || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center">
              <Input
                value={key}
                placeholder="Header name"
                onChange={(e) => handleHeaderChange(key, e.target.value, value)}
                className="text-xs flex-1"
              />
              <Input
                value={value}
                placeholder="Header value"
                onChange={(e) => handleHeaderChange(key, key, e.target.value)}
                className="text-xs flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveHeader(key)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Optional. Header values support variable syntax like: Bearer {"{"}token{"}"}
        </p>
      </div>

      {/* Store Response */}
      <div className="space-y-2">
        <Label className="text-xs">Store Response As Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="response (optional)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Leave empty to skip. Response will be available as {"{"}response{"}"} in next steps
        </p>
      </div>

      {/* Example */}
      <div className="bg-slate-50 p-3 rounded border border-slate-200">
        <p className="text-xs font-semibold mb-2">Example</p>
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-words">
          {`GET: https://api.example.com/price?id={{productId}}\n\nPOST: https://api.example.com/submit\nBody: {"email": "{{userEmail}}", "name": "John"}\nHeaders: {"Authorization": "Bearer {{token}}"}`}
        </pre>
      </div>
    </div>
  );
}
