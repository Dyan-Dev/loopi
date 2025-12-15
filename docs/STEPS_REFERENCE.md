## Step Types Reference

Complete reference for all available automation step types.

### Navigation Steps

#### Navigate
Navigate to a URL.
```json
{
  "type": "navigate",
  "value": "https://example.com"
}
```
**With variables:**
```json
{
  "type": "navigate",
  "value": "https://example.com/user/{{userId}}"
}
```

### Interaction Steps

#### Click
Click an element on the page.
```json
{
  "type": "click",
  "selector": "button.submit"
}
```

#### Type
Type text into an input element.
```json
{
  "type": "type",
  "selector": "input#email",
  "value": "user@example.com"
}
```
**With variables:**
```json
{
  "type": "type",
  "selector": "input#search",
  "value": "{{searchQuery}}"
}
```

#### Select Option
Select an option from a dropdown.
```json
{
  "type": "selectOption",
  "selector": "select#country",
  "optionValue": "US"
}
```
Or by index:
```json
{
  "type": "selectOption",
  "selector": "select#category",
  "optionIndex": 2
}
```

#### Hover
Hover over an element.
```json
{
  "type": "hover",
  "selector": "div.menu-item"
}
```

#### File Upload
Upload a file to an input.
```json
{
  "type": "fileUpload",
  "selector": "input[type='file']",
  "filePath": "/path/to/file.txt"
}
```

### Extraction Steps

#### Extract
Extract text from an element and store in variable.
```json
{
  "type": "extract",
  "selector": ".product-price",
  "storeKey": "price"
}
```

#### Extract With Logic
Extract text and apply conditional logic.
```json
{
  "type": "conditional",
  "selector": ".item-price",
  "condition": "greaterThan",
  "expectedValue": "100"
}
```

**Conditions:**
- `equals` - Exact match
- `contains` - Substring match
- `greaterThan` - Numeric comparison
- `lessThan` - Numeric comparison

**Post-processing options:**
- `stripCurrency` - Remove $, €, £, etc.
- `stripNonNumeric` - Keep only numbers and decimal point
- `removeChars` - Remove specific characters
- `regexReplace` - Use regex pattern replacement
- `parseAsNumber` - Force numeric comparison

### API Steps

#### API Call
Make HTTP requests (GET/POST).
```json
{
  "type": "apiCall",
  "method": "GET",
  "url": "https://api.example.com/users",
  "storeKey": "users"
}
```

**POST with headers and body:**
```json
{
  "type": "apiCall",
  "method": "POST",
  "url": "https://api.example.com/submit",
  "headers": {
    "Authorization": "Bearer {{token}}",
    "Content-Type": "application/json"
  },
  "body": "{\"email\":\"{{email}}\",\"name\":\"{{fullName}}\"}",
  "storeKey": "response"
}
```

**Response stored as typed object:**
- Access properties: `{{response.field}}`
- Access arrays: `{{response[0]}}`
- Mixed access: `{{response.users[0].email}}`

### Page Control Steps

#### Wait
Wait for a specified duration (in seconds).
```json
{
  "type": "wait",
  "value": "2"
}
```
**With variables:**
```json
{
  "type": "wait",
  "value": "{{delaySeconds}}"
}
```

#### Screenshot
Take a screenshot of the page.
```json
{
  "type": "screenshot",
  "savePath": "screenshot.png"
}
```
**Auto-named with timestamp:**
```json
{
  "type": "screenshot"
}
// Saves as: screenshot_20231215120530.png
```

#### Scroll
Scroll the page.
```json
{
  "type": "scroll",
  "scrollType": "byAmount",
  "scrollAmount": 500
}
```
**Scroll to element:**
```json
{
  "type": "scroll",
  "scrollType": "toElement",
  "selector": ".target-element"
}
```

### Variable Steps

#### Set Variable
Define or update a variable.
```json
{
  "type": "setVariable",
  "variableName": "username",
  "value": "john_doe"
}
```

**Auto-typed values:**
```json
{
  "type": "setVariable",
  "variableName": "count",
  "value": "42"           // Type: number
}
```

#### Modify Variable
Modify an existing variable.
```json
{
  "type": "modifyVariable",
  "variableName": "counter",
  "operation": "increment",
  "value": "1"
}
```

**Operations:**
- `set` - Replace value (auto-typed)
- `increment` - Add to number
- `decrement` - Subtract from number
- `append` - Concatenate to string

### Conditional Steps

#### Conditional Node (Advanced)
Creates branching logic in automation flow.
- **if branch**: Executes when condition is true
- **else branch**: Executes when condition is false

**Element existence:**
```
Condition Type: elementExists
Selector: button.next-page
→ if exists: follow "if" edge
→ if missing: follow "else" edge
```

**Value comparison:**
```
Condition Type: valueMatches
Selector: .price
Condition: greaterThan
Expected Value: 100
→ if {{extracted}} > 100: follow "if" edge
→ else: follow "else" edge
```

## Step Field Reference

### Common Fields

**selector** - CSS selector to find elements
```
.class-name
#id-name
div[data-attr="value"]
```

**value** - Text/value input (supports variables)
```
"plain text"
"{{variableName}}"
"https://example.com/{{path}}"
```

**storeKey** - Variable name to store result
```
"price"
"users"
"apiResponse"
```

**variableName** - Name of variable to manipulate
```
"counter"
"email"
"threshold"
```

## Tips

- **Variables support dot notation**: `{{object.nested.property}}`
- **Arrays can be indexed**: `{{array[0].name}}`
- **API responses are objects**: Use `{{response.field}}` to access
- **Types are preserved**: Numbers stay numbers, not strings
- **Substitution is global**: `{{varName}}` works in any string field
