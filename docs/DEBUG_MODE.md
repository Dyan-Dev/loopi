# Debug Mode Documentation

## Overview

Debug Mode is a comprehensive logging and troubleshooting feature in Loopi that provides detailed insights into automation execution. It helps users identify issues, understand automation flow, and optimize performance.

## Features

### 1. **Detailed Logging**
- Step-by-step execution logs for every automation step
- Variable state tracking throughout execution
- Performance metrics (execution duration for each step)
- Detailed error messages with stack traces
- Conditional evaluation logs with actual vs expected values

### 2. **Log Categories**
Logs are organized by categories for easy filtering:
- **Navigate**: URL navigation events
- **Click**: Element click actions
- **Type**: Text input events
- **Wait**: Delay/wait step execution
- **Screenshot**: Screenshot capture operations
- **Extract**: Data extraction operations
- **Extract with Logic**: Conditional extraction with comparison results
- **API Call**: HTTP request/response logging
- **Scroll**: Page scroll operations
- **Select Option**: Dropdown selection events
- **File Upload**: File upload operations
- **Hover**: Mouse hover events
- **Set Variable**: Variable creation and assignment
- **Modify Variable**: Variable updates (increment, decrement, append)
- **Conditional**: Conditional logic evaluation (element exists, value matches)
- **Step Execution**: Overall step lifecycle events

### 3. **Log Levels**

Four log levels are supported:

- **DEBUG**: Detailed diagnostic information (variables, selectors, data values)
- **INFO**: General informational messages (operation success, stored values)
- **WARN**: Warning messages (invalid regex patterns, missing elements)
- **ERROR**: Error messages (failed API calls, step failures)

## Enabling Debug Mode

### Via Settings UI

1. Open the application
2. Navigate to **Settings** (bottom of left sidebar)
3. Scroll to **Debug Mode** section
4. Toggle **Enable Debug Logging** switch
5. Debug logging is now active and capturing logs

### Programmatically

```typescript
await window.electronAPI?.debug.setDebugMode(true);
```

## Using Debug Mode

### Viewing Logs

1. In Settings → Debug Mode section (when enabled)
2. Click **Show Logs** button to display log terminal
3. Logs are displayed in a formatted terminal-style interface
4. Colors indicate log levels:
   - **Indigo**: DEBUG
   - **Blue**: INFO
   - **Yellow**: WARN
   - **Red**: ERROR

### Log Viewer Features

- **Refresh Logs**: Click to reload the latest logs from main process
- **Show/Hide Logs**: Toggle the log terminal visibility
- **Export Logs**: Download logs as JSON file for analysis
- **Clear Logs**: Remove all current logs from memory
- **Auto-scroll**: Logs automatically scroll to newest entries

### Log Statistics

When logs are loaded, statistics are displayed showing:
- **Total**: Total number of log entries
- **Debug**: Number of DEBUG level logs
- **Warn**: Number of WARN level logs
- **Error**: Number of ERROR level logs

## Understanding Log Output

### Log Entry Format

```
[2025-01-15T10:30:45.123Z] [INFO] [Navigate] Loading URL: https://example.com
```

Components:
- **Timestamp**: ISO 8601 format with milliseconds
- **Level**: Log severity (DEBUG, INFO, WARN, ERROR)
- **Category**: The automation step or operation type
- **Message**: Descriptive message about the operation
- **(Duration)**: Optional execution time in milliseconds
- **Data**: Optional structured data object (expandable in UI)

### Example: Navigate Step

```
[2025-01-15T10:30:45.123Z] [DEBUG] [Navigate] Loading URL: https://example.com
[2025-01-15T10:30:46.456Z] [INFO] [Step Execution] navigate step completed successfully (1333.00ms)
```

### Example: Extract Step with Variable Storage

```
[2025-01-15T10:30:50.789Z] [DEBUG] [Extract] Extracting text from selector: .product-title
[2025-01-15T10:30:50.901Z] [DEBUG] [Extract] Stored extracted value in variable: productName
  Data: {"value": "Premium Widget"}
[2025-01-15T10:30:50.901Z] [INFO] [Step Execution] extract step completed successfully (112.00ms)
```

### Example: API Call with Logging

```
[2025-01-15T10:31:00.123Z] [DEBUG] [API Call] Making POST request to: https://api.example.com/search
[2025-01-15T10:31:00.456Z] [DEBUG] [API Call] Request headers and data
  Data: {"headers": {"Authorization": "Bearer token..."}, "hasBody": true}
[2025-01-15T10:31:02.789Z] [DEBUG] [API Call] Response received
  Data: {"status": 200, "dataLength": 1024}
[2025-01-15T10:31:02.789Z] [DEBUG] [API Call] Stored API response in variable: searchResults
[2025-01-15T10:31:02.789Z] [INFO] [Step Execution] apiCall step completed successfully (2666.00ms)
```

### Example: Conditional Evaluation

```
[2025-01-15T10:31:05.123Z] [DEBUG] [Conditional] Evaluating elementExists condition
  Data: {"selector": ".error-message"}
[2025-01-15T10:31:05.234Z] [DEBUG] [Conditional] Element not found
  Data: {"selector": ".error-message"}
[2025-01-15T10:31:05.345Z] [INFO] [Conditional] Condition evaluated to: false
```

### Example: Error Logging

```
[2025-01-15T10:31:10.123Z] [DEBUG] [API Call] Making GET request to: https://api.example.com/invalid
[2025-01-15T10:31:11.456Z] [ERROR] [API Call] API call failed
  Data: {"message": "404 Not Found", "status": 404}
[2025-01-15T10:31:11.456Z] [ERROR] [Step Execution] apiCall step failed after 1333.00ms
```

## Exporting Logs

### Export Process

1. Enable Debug Mode
2. Run your automation
3. Click **Export** button in Debug Mode section
4. A JSON file is downloaded with format: `loopi-debug-logs-{timestamp}.json`

### JSON Structure

```json
[
  {
    "timestamp": "2025-01-15T10:30:45.123Z",
    "level": "INFO",
    "category": "Navigate",
    "message": "Loading URL: https://example.com",
    "data": null,
    "duration": null
  },
  {
    "timestamp": "2025-01-15T10:30:50.789Z",
    "level": "DEBUG",
    "category": "Extract",
    "message": "Stored extracted value in variable: productName",
    "data": {
      "value": "Premium Widget"
    },
    "duration": null
  }
]
```

## Performance Monitoring

Debug logs include duration metrics for performance analysis:

- **Step Duration**: Time taken to execute each step (shown in parentheses)
- **Performance Analysis**: Compare step durations to identify bottlenecks
- **Timeout Diagnosis**: Long durations may indicate network/element loading issues

Example:
```
[INFO] [Step Execution] navigate step completed successfully (1333.00ms)
[INFO] [Step Execution] click step completed successfully (245.00ms)
[INFO] [Step Execution] apiCall step completed successfully (2666.00ms)
```

## Troubleshooting with Debug Logs

### Issue: Element not found

**Log Indicators:**
```
[DEBUG] [Click] Clicking element with selector: .submit-button
[DEBUG] [Step Execution] click step failed
[ERROR] [Step Execution] click step failed after 50.00ms
```

**Resolution:**
- Check the selector is correct
- Ensure element is visible/loaded
- Use inspector tool to verify selector

### Issue: Variable not substituting

**Log Indicators:**
```
[DEBUG] [Navigate] Loading URL: https://example.com/{{userId}}
[DEBUG] [Set Variable] Variable 'userId' set
  Data: {"value": "12345"}
```

**Resolution:**
- Verify variable name matches exactly
- Check variable is set before use
- Ensure proper {{variableName}} syntax

### Issue: API call timeout

**Log Indicators:**
```
[DEBUG] [API Call] Making POST request to: https://api.example.com/data
[INFO] [Step Execution] apiCall step completed successfully (15000.00ms)
```

**Resolution:**
- Check network connectivity
- Verify API endpoint availability
- Consider adding wait steps before API calls

### Issue: Conditional not evaluating as expected

**Log Indicators:**
```
[DEBUG] [Conditional] Evaluating valueMatches condition
  Data: {"rawValue": "$99.99", "transformed": "9999", "expected": "99.99", "operator": "equals"}
[DEBUG] [Conditional] Condition evaluated to: false
```

**Resolution:**
- Check transformation logic (currency stripping, etc.)
- Verify expected value format
- Use appropriate comparison operator

## Best Practices

1. **Enable Only When Needed**: Debug mode increases CPU usage slightly. Disable when not troubleshooting.

2. **Regular Export**: Periodically export logs for analysis or archival.

3. **Clear Logs**: Clear logs between test runs to reduce memory usage.

4. **Monitor Statistics**: Check error and warning counts regularly.

5. **Correlate with UI**: Use log timestamps to correlate with UI events.

6. **Save Complex Logs**: For complex automations, export and save logs for reference.

## API Reference

### IPC Handlers

All debug operations are accessible via IPC:

```typescript
// Enable/disable debug mode
await window.electronAPI?.debug.setDebugMode(true);

// Get all logs
const logs = await window.electronAPI?.debug.getLogs();

// Clear all logs
await window.electronAPI?.debug.clearLogs();

// Export logs as JSON string
const logsJson = await window.electronAPI?.debug.exportLogs();

// Get log statistics
const stats = await window.electronAPI?.debug.getStatistics();
// Returns: { total: number, debug: number, info: number, warn: number, error: number }
```

### Log Entry Interface

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 format
  level: string;          // "DEBUG", "INFO", "WARN", "ERROR"
  category: string;       // Operation category
  message: string;        // Log message
  data?: unknown;         // Optional structured data
  duration?: number;      // Optional execution duration in milliseconds
}
```

## Keyboard Shortcuts

No dedicated shortcuts for debug mode, but you can:
- Use browser DevTools (F12) for even deeper debugging
- Export logs for command-line analysis

## Memory Management

- Maximum 10,000 log entries in memory
- Oldest logs are automatically removed when limit is exceeded
- Clear logs regularly to maintain performance
- Export logs before clearing if you need to keep them

## Limitations

- Logs are not persisted between sessions (they're cleared on app restart)
- Very large log volumes (>10k entries) may slow down the log viewer
- Sensitive data (API keys, passwords) may be logged - review before sharing logs

## Support and Feedback

For issues with Debug Mode or suggestions for improvements:
- Check the [GitHub Issues](https://github.com/Dyan-Dev/loopi/issues)
- Review existing documentation
- Export logs when reporting bugs

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Component Guide](./COMPONENT_GUIDE.md)
- [Development Workflows](./DEVELOPMENT_WORKFLOWS.md)
- [Quick Reference](./QUICK_REFERENCE.md)
