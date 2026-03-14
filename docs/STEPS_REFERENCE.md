# Step Types Reference

Complete reference for all available automation step types.

---

## Browser Steps

### Navigate
Navigate to a URL.
```json
{ "type": "navigate", "value": "https://example.com/{{path}}" }
```

### Click
Click an element.
```json
{ "type": "click", "selector": "button.submit" }
```

### Type
Type text into an input.
```json
{ "type": "type", "selector": "input#email", "value": "{{email}}" }
```

### Select Option
Select a dropdown option by value or index.
```json
{ "type": "selectOption", "selector": "select#country", "optionValue": "US" }
```

### Hover
Hover over an element.
```json
{ "type": "hover", "selector": "div.menu-item" }
```

### File Upload
Upload a file.
```json
{ "type": "fileUpload", "selector": "input[type='file']", "filePath": "/path/to/file.txt" }
```

### Extract
Extract text from an element and store in a variable.
```json
{ "type": "extract", "selector": ".product-price", "storeKey": "price" }
```

### Wait
Wait for a duration (seconds).
```json
{ "type": "wait", "value": "2" }
```

### Screenshot
Take a screenshot.
```json
{ "type": "screenshot", "savePath": "screenshot.png" }
```

### Scroll
Scroll the page by amount or to an element.
```json
{ "type": "scroll", "scrollType": "byAmount", "scrollAmount": 500 }
```
```json
{ "type": "scroll", "scrollType": "toElement", "selector": ".target" }
```

---

## Variable Steps

### Set Variable
Define or update a variable. Values are auto-typed (numbers, booleans, objects, arrays).
```json
{ "type": "setVariable", "variableName": "count", "value": "42" }
```

### Modify Variable
Modify an existing variable. Operations: `set`, `increment`, `decrement`, `append`.
```json
{ "type": "modifyVariable", "variableName": "counter", "operation": "increment", "value": "1" }
```

---

## Logic & Control Flow

### Browser Conditional
Branch based on page element state. Outputs `if` and `else` edges.

Condition types: `elementExists`, `valueMatches` (with `equals`, `contains`, `greaterThan`, `lessThan`).
```json
{ "type": "browserConditional", "conditionType": "elementExists", "selector": "button.next" }
```

### Variable Conditional
Branch based on variable values.
```json
{ "type": "variableConditional", "variableName": "count", "condition": "greaterThan", "expectedValue": "10" }
```

### ForEach
Loop over an array variable. Outputs `loop` (per iteration) and `done` edges.
```json
{ "type": "forEach", "arrayVariable": "users", "iteratorVariable": "user" }
```

---

## Data Transform Steps

### JSON Parse
Parse a JSON string variable into an object.
```json
{ "type": "jsonParse", "sourceVariable": "rawJson", "storeKey": "parsed" }
```

### JSON Stringify
Convert a variable to a JSON string.
```json
{ "type": "jsonStringify", "sourceVariable": "data", "storeKey": "jsonStr", "pretty": true }
```

### Math Operation
Perform math. Operations: `add`, `subtract`, `multiply`, `divide`, `modulo`, `round`, `floor`, `ceil`, `abs`, `min`, `max`, `random`.
```json
{ "type": "mathOperation", "operation": "multiply", "value1": "{{price}}", "value2": "1.1", "storeKey": "total" }
```

### String Operation
Transform strings. Operations: `toUpperCase`, `toLowerCase`, `trim`, `replace`, `split`, `join`, `slice`, `includes`, `startsWith`, `endsWith`, `length`, `padStart`, `padEnd`, `repeat`, `reverse`.
```json
{ "type": "stringOperation", "operation": "replace", "value": "{{text}}", "searchValue": "old", "replaceValue": "new", "storeKey": "result" }
```

### Date/Time
Get or format dates. Operations: `now`, `format`, `parse`, `add`, `subtract`, `diff`.
```json
{ "type": "dateTime", "operation": "now", "format": "YYYY-MM-DD", "storeKey": "today" }
```

### Filter Array
Filter an array by field condition. Supports dot-notation source variables like `apiResponse.data`.
```json
{ "type": "filterArray", "sourceVariable": "users", "field": "active", "condition": "equals", "value": "true", "storeKey": "activeUsers" }
```

### Map Array
Transform each item in an array. Supports dot-notation source variables.
```json
{ "type": "mapArray", "sourceVariable": "apiResponse.data", "expression": "name", "storeKey": "names" }
```

### Code Execute
Run custom JavaScript code.
```json
{ "type": "codeExecute", "code": "return variables.items.filter(i => i.price > 50)", "storeKey": "expensive" }
```

---

## API Steps

### API Call
Make HTTP requests (GET, POST, PUT, DELETE, PATCH).
```json
{
  "type": "apiCall",
  "method": "POST",
  "url": "https://api.example.com/submit",
  "headers": { "Authorization": "Bearer {{token}}" },
  "body": "{\"name\": \"{{name}}\"}",
  "storeKey": "response"
}
```

Access response data: `{{response.data}}`, `{{response.users[0].email}}`

### AI Steps
Generate text using AI models. Supports `aiOpenAI`, `aiAnthropic`, and `aiOllama` (local).
```json
{ "type": "aiOpenAI", "prompt": "Summarize: {{text}}", "model": "gpt-4o-mini", "storeKey": "summary", "credentialId": "..." }
```
```json
{ "type": "aiOllama", "prompt": "{{input}}", "model": "llama3", "storeKey": "result" }
```

---

## Integration Steps

All integration steps support credential selection via dropdown. Store API keys in **Settings > Credentials**.

### Communication

| Step Type | Description |
|-----------|-------------|
| `slackSendMessage` | Send a message to a Slack channel |
| `slackUpdateMessage` | Update an existing message |
| `slackDeleteMessage` | Delete a message |
| `slackCreateChannel` | Create a new channel |
| `slackListChannels` | List channels |
| `slackGetHistory` | Get channel message history |
| `slackAddReaction` | Add emoji reaction |
| `slackUploadFile` | Upload a file |
| `discordSendMessage` | Send a Discord message |
| `discordSendWebhook` | Send via webhook |
| `discordReactMessage` | Add reaction |
| `discordListMessages` | List channel messages |
| `discordDeleteMessage` | Delete a message |
| `telegramSendMessage` | Send a Telegram message |
| `telegramSendPhoto` | Send a photo |
| `telegramSendDocument` | Send a document |
| `telegramSendLocation` | Send a location |
| `telegramEditMessage` | Edit a message |
| `telegramDeleteMessage` | Delete a message |
| `telegramGetUpdates` | Get recent updates |
| `whatsappSendMessage` | Send a WhatsApp message (Twilio) |
| `mattermostSendMessage` | Send a Mattermost message |

### Email

| Step Type | Description |
|-----------|-------------|
| `sendgridSendEmail` | Send email via SendGrid |
| `sendgridSendTemplate` | Send templated email |
| `sendgridGetContacts` | Get contact list |
| `gmailSendEmail` | Send email via Gmail API |
| `mailchimpAddSubscriber` | Add subscriber to list |
| `convertkitAddSubscriber` | Add subscriber |
| `activecampaignCreateContact` | Create a contact |

### Dev & Project Management

| Step Type | Description |
|-----------|-------------|
| `githubCreateIssue` | Create a GitHub issue |
| `githubListIssues` | List repository issues |
| `githubGetIssue` | Get issue details |
| `githubCreateComment` | Comment on an issue |
| `githubGetRepo` | Get repository info |
| `githubListRepos` | List repositories |
| `githubCreateRelease` | Create a release |
| `gitlabCreateIssue` | Create a GitLab issue |
| `jiraCreateIssue` | Create a Jira issue |
| `jiraGetIssue` | Get Jira issue details |
| `linearCreateIssue` | Create a Linear issue |
| `asanaCreateTask` | Create an Asana task |
| `trelloCreateCard` | Create a Trello card |
| `clickupCreateTask` | Create a ClickUp task |
| `mondayCreateItem` | Create a Monday.com item |
| `todoistCreateTask` | Create a Todoist task |

### Databases

| Step Type | Description |
|-----------|-------------|
| `postgresSelect` | Run a SELECT query |
| `postgresInsert` | Insert rows |
| `postgresUpdate` | Update rows |
| `postgresQuery` | Run raw SQL |
| `mongodbFind` | Find documents |
| `mongodbInsert` | Insert documents |
| `mysqlQuery` | Run a MySQL query |
| `redisGet` | Get a Redis key |
| `redisSet` | Set a Redis key |
| `elasticsearchSearch` | Search an index |
| `supabaseSelect` | Query Supabase |
| `supabaseInsert` | Insert into Supabase |
| `nocodbListRecords` | List NocoDB records |
| `baserowListRows` | List Baserow rows |

### CRM & Sales

| Step Type | Description |
|-----------|-------------|
| `salesforceQuery` | Run a SOQL query |
| `hubspotCreateContact` | Create a HubSpot contact |
| `hubspotGetContact` | Get contact details |
| `pipedriveCreateDeal` | Create a Pipedrive deal |

### Payments

| Step Type | Description |
|-----------|-------------|
| `stripeCreateCharge` | Create a charge |
| `stripeCreateCustomer` | Create a customer |
| `stripeGetBalance` | Get account balance |
| `stripeListCharges` | List recent charges |
| `stripeCreatePaymentIntent` | Create a payment intent |
| `paypalCreateOrder` | Create a PayPal order |
| `xeroCreateInvoice` | Create a Xero invoice |
| `quickbooksCreateInvoice` | Create a QuickBooks invoice |

### E-Commerce

| Step Type | Description |
|-----------|-------------|
| `shopifyListProducts` | List Shopify products |
| `shopifyCreateProduct` | Create a product |
| `woocommerceListProducts` | List WooCommerce products |

### Content & CMS

| Step Type | Description |
|-----------|-------------|
| `notionCreatePage` | Create a Notion page |
| `notionQueryDatabase` | Query a Notion database |
| `notionUpdatePage` | Update a page |
| `notionSearch` | Search Notion |
| `googleSheetsReadRows` | Read rows from a sheet |
| `googleSheetsAppendRow` | Append a row |
| `googleSheetsUpdateRow` | Update a row |
| `googleSheetsClear` | Clear a range |
| `airtableListRecords` | List Airtable records |
| `airtableCreateRecord` | Create a record |
| `contentfulGetEntries` | Get Contentful entries |
| `wordpressCreatePost` | Create a WordPress post |
| `ghostCreatePost` | Create a Ghost post |
| `webflowListItems` | List Webflow CMS items |
| `codaListRows` | List rows in a Coda table |

### Cloud & Storage

| Step Type | Description |
|-----------|-------------|
| `awsS3ListObjects` | List S3 objects |
| `awsS3PutObject` | Upload to S3 |
| `dropboxListFiles` | List Dropbox files |
| `dropboxUploadFile` | Upload to Dropbox |
| `boxListFiles` | List Box files |
| `googleDriveListFiles` | List Google Drive files |

### DevOps & Monitoring

| Step Type | Description |
|-----------|-------------|
| `circleCiTriggerPipeline` | Trigger a CircleCI pipeline |
| `jenkinsTriggerBuild` | Trigger a Jenkins build |
| `sentryListIssues` | List Sentry issues |
| `pagerdutyCreateIncident` | Create a PagerDuty incident |
| `grafanaQueryDatasource` | Query a Grafana datasource |
| `cloudflareListZones` | List Cloudflare zones |
| `netlifyListSites` | List Netlify sites |

### Other

| Step Type | Description |
|-----------|-------------|
| `twilioSendSMS` | Send an SMS via Twilio |
| `zoomCreateMeeting` | Create a Zoom meeting |
| `calendlyListEvents` | List Calendly events |
| `typeformGetResponses` | Get Typeform responses |
| `bitlyCreateShortLink` | Create a short link |
| `graphqlQuery` | Run a GraphQL query |
| `redditGetPosts` | Get Reddit posts |
| `spotifySearch` | Search Spotify |
| `googleCalendarCreateEvent` | Create a calendar event |

---

## Common Fields

| Field | Description | Example |
|-------|-------------|---------|
| `selector` | CSS selector | `.class`, `#id`, `div[data-x="y"]` |
| `value` | Text input (supports `{{vars}}`) | `"Hello {{name}}"` |
| `storeKey` | Variable name to store result | `"apiResponse"` |
| `credentialId` | ID of stored credential | Selected via dropdown |
| `sourceVariable` | Variable to read from (supports dot notation) | `"apiResponse.data"` |

## Tips

- Variables support dot notation: `{{object.nested.property}}`
- Arrays can be indexed: `{{array[0].name}}`
- API responses are auto-typed objects
- `sourceVariable` fields support dot notation: `apiResponse.data`, `items[0]`
- All integration steps support credential selection via the dropdown in the step editor
