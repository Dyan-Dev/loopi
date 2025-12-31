/**
 * Environment Configuration
 * Centralized configuration management for the application
 */

export interface EnvironmentConfig {
  nodeEnv: "development" | "production" | "test";
  debugMode: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  maxLogEntries: number;
  browserHeadless: boolean;
  browserTimeout: number;
}

/**
 * Get configuration value from environment with fallback
 */
function getEnvValue<T>(key: string, defaultValue: T, parser?: (val: string) => T): T {
  const value = process.env[key];
  if (value === undefined) return defaultValue;

  if (parser) return parser(value);

  // Auto-parse common types
  if (typeof defaultValue === "boolean") {
    return (value === "true") as T;
  }
  if (typeof defaultValue === "number") {
    return Number(value) as T;
  }
  return value as T;
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    nodeEnv: getEnvValue("NODE_ENV", "development") as EnvironmentConfig["nodeEnv"],
    debugMode: getEnvValue("DEBUG_MODE", false),
    logLevel: getEnvValue("LOG_LEVEL", "info") as EnvironmentConfig["logLevel"],
    maxLogEntries: getEnvValue("MAX_LOG_ENTRIES", 10000),
    browserHeadless: getEnvValue("BROWSER_HEADLESS", false),
    browserTimeout: getEnvValue("BROWSER_TIMEOUT", 30000),
  };
}

/**
 * Global configuration instance
 */
export const config = loadEnvironmentConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = config.nodeEnv === "development";

/**
 * Check if running in production mode
 */
export const isProduction = config.nodeEnv === "production";

/**
 * Check if running in test mode
 */
export const isTest = config.nodeEnv === "test";
