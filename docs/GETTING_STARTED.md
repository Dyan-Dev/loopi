## Getting Started with Loopi

A quick guide to building your first automation.

### Installation

**Prerequisites:**
- Node.js 16+ 
- pnpm (or npm/yarn)

```bash
git clone https://github.com/Dyan-Dev/loopi.git
cd loopi
pnpm install
```

### Starting the Application

```bash
pnpm start
```

This launches the Electron app with hot reload for development.

### Building for Distribution

```bash
pnpm run make          # Package for your platform
pnpm run publish       # Build and publish (requires config)
```

## Your First Automation

### Step 1: Create a New Automation

1. Open Loopi
2. Click "New Automation"
3. Enter name and description
4. Click "Create"

### Step 2: Add a Navigate Step

1. Click "+ Add Step" on the canvas
2. Select "Navigate"
3. Enter URL: `https://example.com`
4. Click "Add Step"

### Step 3: Add an Extract Step

1. Click "+ Add Step"
2. Select "Extract"
3. Click "Pick Element" to select an element on the page
4. Enter "Store As": `result`
5. Click "Add Step"

### Step 4: Add a Screenshot Step

1. Click "+ Add Step"
2. Select "Screenshot"
3. Click "Add Step"

### Step 5: Run Your Automation

1. Click "Run Automation" button
2. Watch it execute in the browser window
3. Check the execution log for results

## Building More Complex Automations

### Using Variables

**Set a variable:**
1. Add "Set Variable" step
2. Name: `username`
3. Value: `john_doe`
4. Click "Add Step"

**Use the variable:**
1. In any step field, use: `{{username}}`
2. Example in Navigate: `https://example.com/user/{{username}}`

### Working with APIs

**Fetch data from API:**
1. Add "API Call" step
2. Method: `GET`
3. URL: `https://api.github.com/users/torvalds`
4. Store As: `userdata`
5. Click "Add Step"

**Access API response:**
1. In Navigate step, use: `https://github.com/{{userdata.login}}`
2. In Type step, use: `{{userdata.name}}`

### Creating Loops with Variables

**Loop example - extract 5 items:**

```
Step 1: Set Variable
  name: index
  value: 1

Step 2: Click
  selector: .item-{{index}}

Step 3: Extract
  selector: .title
  storeKey: item_{{index}}

Step 4: Modify Variable
  name: index
  operation: increment
  value: 1

Step 5: Condition
  if index ≤ 5: go back to Step 2
  else: go to Step 6

Step 6: Screenshot
```

### Using Conditional Branches

**Extract and decide:**

1. Add "Extract With Logic" step
2. Selector: `.price`
3. Condition: `greaterThan`
4. Expected Value: `100`
5. Click "Add Step"

6. From condition node, draw two edges:
   - "if" branch → navigate to premium page
   - "else" branch → navigate to regular page

## Common Patterns

### Form Submission
```
1. Navigate to form page
2. Type email ({{email}})
3. Type password ({{password}})
4. Click submit button
5. Wait 2 seconds
6. Extract confirmation message
7. Screenshot
```

### Multi-page Scraping
```
1. Navigate to page 1
2. Extract data, store in variables
3. Navigate to page 2
4. Extract data, store in variables
5. Compare and process
6. Screenshot results
```

### API-driven Workflow
```
1. API Call to get user list
2. Set index = 0
3. Navigate to user[0] profile
4. Extract user details
5. API Call to update profile
6. Increment index
7. Loop back if more users
```

### Data Validation
```
1. API Call to fetch data
2. Extract With Logic to validate
3. If valid: proceed
4. If invalid: alert/screenshot
```

## Tips for Success

1. **Test incrementally** - Add steps one at a time and test
2. **Use variables** - Store common values, reuse everywhere
3. **Watch execution** - Keep the browser window visible while testing
4. **Inspect API responses** - Check logs to understand data structure
5. **Use element picker** - Click to select elements instead of typing selectors
6. **Add screenshots** - Capture key points for verification
7. **Handle timing** - Add Wait steps between dynamic page changes
8. **Test conditions** - Use Extract With Logic for robust comparisons

## Exporting & Sharing

**Export your automation:**
1. Click "Export" button
2. Save JSON file
3. Share with team

**Import automation:**
1. Click "Import" button
2. Select JSON file
3. Automation loads in editor

## Troubleshooting

**Selector not working:**
- Use element picker tool (Click button)
- Verify selector exists: open DevTools in preview

**Variable not substituting:**
- Check spelling: `{{variableName}}`
- Verify variable is set before use
- Check quotation marks in JSON

**API call failing:**
- Verify URL is correct
- Check authentication headers if needed
- Test URL in browser first

**Condition not branching:**
- Verify extracted value matches condition
- Check parsing options (strip currency, etc.)
- Test with Extract step first

## Next Steps

- Read [Variables & Data Types](./VARIABLES.md) for advanced variable usage
- Check [Steps Reference](./STEPS_REFERENCE.md) for detailed step documentation
- Browse [Examples](./examples/) for real-world automations
- See [Architecture](./ARCHITECTURE.md) for technical details
