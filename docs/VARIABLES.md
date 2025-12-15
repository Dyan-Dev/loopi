## Variables & Data Types

Loopi features an intelligent **auto-typed variable system** where variables automatically adapt to their input.

### Automatic Type Detection

Variables are automatically typed based on their input value:

```
"42"              → number (42)
"3.14"            → number (3.14)
"true"            → boolean (true)
"false"           → boolean (false)
'{"name":"John"}' → object {name: "John"}
'[1,2,3]'         → array [1,2,3]
"hello"           → string ("hello")
```

### Variable Access Syntax

**Simple variables:**
```
{{username}}
{{count}}
{{isActive}}
```

**Nested properties (objects):**
```
{{user.name}}
{{user.profile.email}}
{{config.database.host}}
```

**Deeply nested:**
```
{{response.data.user.profile.name}}
{{api.metadata.created_at}}
{{config.server.connection.timeout}}
```

**Array indexing:**
```
{{users[0]}}           // First element
{{products[1]}         // Second element
{{items[0].name}}      // Property of array element
{{data[0].user.email}} // Mixed access
{{matrix[0][1]}}       // Multi-dimensional arrays
```

**Combined access patterns:**
```
{{users[0].profile.settings.theme}}
{{response.data[0].meta.created_at}}
{{items[index].properties[0].value}}
```

### API Response Storage

When an API Call step stores a response, it preserves the full object/array structure:

```json
{
  "type": "apiCall",
  "method": "GET",
  "url": "https://api.github.com/users/{{username}}",
  "storeKey": "userinfo"
}
```

**Response stored as object** - Access properties directly:
```
{{userinfo}}                  // Entire object
{{userinfo.name}}            // "Linus Torvalds"
{{userinfo.followers}}       // 262478 (as number, not string!)
{{userinfo.company}}         // "Linux Foundation"
{{userinfo.location}}        // "Portland, OR"
{{userinfo.created_at}}      // "2011-09-03T15:26:22Z"
```

### Variable Operations

#### Set Variable
Auto-detects type from input:
```json
{
  "type": "setVariable",
  "variableName": "count",
  "value": "42"        // Stored as number
}
```

#### Modify Variable
- **increment** - Add to numeric variable (maintains number type)
- **decrement** - Subtract from numeric variable
- **append** - Concatenate to string
- **set** - Replace with new value (auto-typed)

```json
{
  "type": "modifyVariable",
  "variableName": "count",
  "operation": "increment",
  "value": "5"
}
```

#### Extract
Stores extracted text as string:
```json
{
  "type": "extract",
  "selector": ".product-price",
  "storeKey": "price"  // Stored as string
}
```

### Example Workflow

**Step 1: Set threshold (number)**
```json
{
  "type": "setVariable",
  "variableName": "threshold",
  "value": "100"       // Type: number
}
```

**Step 2: Fetch users (array of objects)**
```json
{
  "type": "apiCall",
  "url": "https://api.example.com/users",
  "storeKey": "users"  // Type: array
}
```

**Step 3: Access array element property**
```json
{
  "type": "navigate",
  "value": "https://example.com/user/{{users[0].id}}"
}
```

**Step 4: Type-safe comparison**
```json
{
  "type": "conditional",
  "condition": "greaterThan",
  "expectedValue": "{{threshold}}",
  "parseAsNumber": true  // Numeric comparison (not string!)
}
```

### Type-Safe Operations

**Numeric operations preserve types:**
```json
{
  "type": "modifyVariable",
  "variableName": "count",
  "operation": "increment",
  "value": "10"
}
// Result: 52 (number), not "5210" (string)
```

**Boolean comparisons work properly:**
```
{{isActive}}           // true (boolean)
{{isActive}} > 0       // Works with proper type checking
```

**Object/Array preservation:**
```
API response: {users: [{id: 1, name: "John"}]}
{{response.users[0].name}} // "John"
// Type information preserved throughout
```

### Tips & Best Practices

1. **API responses are objects** - Use dot notation to access properties
2. **Numbers stay numbers** - Comparisons are numeric, not string-based
3. **Arrays preserve order** - Index with `[0]`, `[1]`, etc.
4. **Mixed access works** - Combine dots and brackets freely
5. **Type detection is automatic** - No explicit casting needed
6. **Empty/missing values return ""** - Safe fallback for missing properties

### Common Use Cases

**Extract and compare prices:**
```
API returns: {items: [{price: 29.99}, {price: 49.99}]}
Access: {{items[0].price}}
Compare: "{{items[0].price}}" > "{{maxPrice}}"
```

**Multi-page data collection:**
```
Set Variable: page = 1
API Call: /api/data?page={{page}}
Store: results (array)
Access: {{results[0].id}}, {{results[1].id}}, etc.
```

**Nested user data:**
```
API: /api/users/123
Response: {user: {profile: {email: "user@example.com"}}}
Access: {{userData.user.profile.email}}
```
