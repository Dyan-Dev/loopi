/**
 * Debug Logger - Provides detailed logging for troubleshooting automation execution
 * Supports different log levels and formatted output
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  duration?: number;
}

/**
 * DebugLogger class for structured logging with categories and timestamps
 */
export class DebugLogger {
  private logs: LogEntry[] = [];
  private isEnabled: boolean = false;
  private maxLogs: number = 10000; // Prevent memory leaks

  /**
   * Enable or disable debug logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled && this.logs.length === 0) {
      this.log(LogLevel.INFO, "Debug Mode", "Debug logging enabled");
    }
  }

  /**
   * Check if debug logging is enabled
   */
  isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Internal logging method
   */
  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: unknown,
    duration?: number
  ): void {
    if (!this.isEnabled && level === LogLevel.DEBUG) {
      return; // Skip DEBUG logs when disabled
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      duration,
    };

    this.logs.push(entry);

    // Maintain max log size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console for immediate visibility
    this.printToConsole(entry);
  }

  /**
   * Format and print log entry to console
   */
  private printToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.category}]`;
    const style = this.getLevelStyle(entry.level);

    let message = `${prefix} ${entry.message}`;

    if (entry.duration !== undefined) {
      message += ` (${entry.duration.toFixed(2)}ms)`;
    }

    if (entry.data !== undefined) {
      console.log(`%c${message}`, style, entry.data);
    } else {
      console.log(`%c${message}`, style);
    }
  }

  /**
   * Get console style for log level
   */
  private getLevelStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: "color: #6366f1; font-weight: bold;",
      [LogLevel.INFO]: "color: #3b82f6; font-weight: bold;",
      [LogLevel.WARN]: "color: #f59e0b; font-weight: bold;",
      [LogLevel.ERROR]: "color: #ef4444; font-weight: bold;",
    };
    return styles[level];
  }

  /**
   * Log DEBUG level message
   */
  debug(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Log INFO level message
   */
  info(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Log WARN level message
   */
  warn(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * Log ERROR level message
   */
  error(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  /**
   * Log operation with duration tracking
   */
  logOperation(category: string, message: string, duration: number, data?: unknown): void {
    this.log(LogLevel.INFO, category, message, data, duration);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs filtered by category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get formatted logs as string
   */
  formatLogs(limit?: number): string {
    const logsToFormat = limit ? this.logs.slice(-limit) : this.logs;

    return logsToFormat
      .map((entry) => {
        let line = `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}`;
        if (entry.duration !== undefined) {
          line += ` (${entry.duration.toFixed(2)}ms)`;
        }
        if (entry.data !== undefined) {
          line += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
        }
        return line;
      })
      .join("\n");
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get logs statistics
   */
  getStatistics(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.logs.length,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };

    for (const log of this.logs) {
      stats[log.level.toLowerCase()] = (stats[log.level.toLowerCase()] || 0) + 1;
    }

    return stats;
  }
}

// Global instance
export const debugLogger = new DebugLogger();
