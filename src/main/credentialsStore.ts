import crypto from "crypto";
import { app } from "electron";
import fs from "fs";
import path from "path";

export interface Credential {
  id: string;
  name: string;
  type: "twitter" | "discord" | "oauth" | "apiKey" | "basic" | "custom";
  createdAt: string;
  updatedAt: string;
  data: Record<string, string>;
}

const ENCRYPTION_KEY =
  process.env.LOOPI_ENCRYPTION_KEY || "loopi-default-key-change-this-in-production";
const ALGORITHM = "aes-256-cbc";

const credentialsPath = path.join(app.getPath("userData"), "credentials.json");

/**
 * Encrypt sensitive data
 */
function encrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
function decrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Load all credentials from storage
 */
export function loadCredentials(): Credential[] {
  try {
    if (fs.existsSync(credentialsPath)) {
      const data = fs.readFileSync(credentialsPath, "utf-8");
      const encrypted = JSON.parse(data) as { credentials: string };
      if (encrypted.credentials) {
        const decrypted = decrypt(encrypted.credentials);
        return JSON.parse(decrypted) as Credential[];
      }
    }
  } catch (error) {
    console.error("Failed to load credentials:", error);
  }
  return [];
}

/**
 * Save credentials to storage (encrypted)
 */
function saveCredentials(credentials: Credential[]): boolean {
  try {
    const serialized = JSON.stringify(credentials);
    const encrypted = encrypt(serialized);
    const data = JSON.stringify({ credentials: encrypted }, null, 2);
    fs.writeFileSync(credentialsPath, data, "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save credentials:", error);
    return false;
  }
}

/**
 * Add a new credential
 */
export function addCredential(
  credential: Omit<Credential, "id" | "createdAt" | "updatedAt">
): Credential {
  const credentials = loadCredentials();
  const newCredential: Credential = {
    ...credential,
    id: crypto.randomBytes(16).toString("hex"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  credentials.push(newCredential);
  saveCredentials(credentials);
  return newCredential;
}

/**
 * Update an existing credential
 */
export function updateCredential(
  id: string,
  updates: Partial<Omit<Credential, "id" | "createdAt">>
): boolean {
  const credentials = loadCredentials();
  const index = credentials.findIndex((c) => c.id === id);
  if (index === -1) return false;

  credentials[index] = {
    ...credentials[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return saveCredentials(credentials);
}

/**
 * Delete a credential
 */
export function deleteCredential(id: string): boolean {
  const credentials = loadCredentials();
  const filtered = credentials.filter((c) => c.id !== id);
  if (filtered.length === credentials.length) return false;
  return saveCredentials(filtered);
}

/**
 * Get a single credential by ID
 */
export function getCredential(id: string): Credential | null {
  const credentials = loadCredentials();
  return credentials.find((c) => c.id === id) || null;
}

/**
 * Get credentials by type
 */
export function getCredentialsByType(type: string): Credential[] {
  const credentials = loadCredentials();
  return credentials.filter((c) => c.type === type);
}
