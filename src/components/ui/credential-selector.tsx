import type { Credential } from "@app-types/globals";
import { Key } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface CredentialSelectorProps {
  value?: string;
  onChange: (credentialId: string) => void;
  type?: Credential["type"];
  label?: string;
}

export function CredentialSelector({
  value,
  onChange,
  type = "twitter",
  label = "Credential",
}: CredentialSelectorProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, [type]);

  const loadCredentials = async () => {
    try {
      const allCreds = await window.electronAPI?.credentials.list();
      const filtered = allCreds?.filter((c) => c.type === type) || [];
      setCredentials(filtered);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange} disabled={loading}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? "Loading..." : "Select credential"} />
          </SelectTrigger>
          <SelectContent>
            {credentials.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No credentials found
              </div>
            ) : (
              credentials.map((cred) => (
                <SelectItem key={cred.id} value={cred.id}>
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3" />
                    {cred.name}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      {credentials.length === 0 && !loading && (
        <p className="text-xs text-muted-foreground">
          No {type} credentials found.
        </p>
      )}
    </div>
  );
}
