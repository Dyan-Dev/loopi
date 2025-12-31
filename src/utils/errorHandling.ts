/**
 * Error Handling Utilities
 * Provides consistent error handling across the application
 */

import { createLogger } from "./logger";

const logger = createLogger("ErrorHandler");

/**
 * Standardized error types
 */
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  NETWORK = "NETWORK_ERROR",
  FILE_SYSTEM = "FILE_SYSTEM_ERROR",
  BROWSER = "BROWSER_ERROR",
  AUTOMATION = "AUTOMATION_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  type: ErrorType;
  context?: Record<string, unknown>;
  originalError?: Error;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.context = context;
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Safely execute an async function with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  errorType: ErrorType = ErrorType.UNKNOWN
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const appError = new AppError(
      errorMessage,
      errorType,
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    logger.error(errorMessage, appError);
    return { success: false, error: appError };
  }
}

/**
 * Safely execute a synchronous function with error handling
 */
export function safeSync<T>(
  fn: () => T,
  errorMessage: string,
  errorType: ErrorType = ErrorType.UNKNOWN
): { success: true; data: T } | { success: false; error: AppError } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const appError = new AppError(
      errorMessage,
      errorType,
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    logger.error(errorMessage, appError);
    return { success: false, error: appError };
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: Error | AppError | unknown): string {
  if (error instanceof AppError) {
    return `${error.message}${error.originalError ? `: ${error.originalError.message}` : ""}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if error is of a specific type
 */
export function isErrorType(error: unknown, type: ErrorType): boolean {
  return error instanceof AppError && error.type === type;
}
