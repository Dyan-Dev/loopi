import type { StepBase } from "./steps";

// ─── Airtable ────────────────────────────────────────────────────────

export interface StepAirtableCreateRecord extends StepBase {
  type: "airtableCreateRecord";
  baseId: string;
  tableName: string;
  fields: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepAirtableGetRecord extends StepBase {
  type: "airtableGetRecord";
  baseId: string;
  tableName: string;
  recordId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepAirtableListRecords extends StepBase {
  type: "airtableListRecords";
  baseId: string;
  tableName: string;
  maxRecords?: string;
  filterFormula?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepAirtableUpdateRecord extends StepBase {
  type: "airtableUpdateRecord";
  baseId: string;
  tableName: string;
  recordId: string;
  fields: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepAirtableDeleteRecord extends StepBase {
  type: "airtableDeleteRecord";
  baseId: string;
  tableName: string;
  recordId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Jira ────────────────────────────────────────────────────────────

export interface StepJiraCreateIssue extends StepBase {
  type: "jiraCreateIssue";
  domain: string;
  projectKey: string;
  issueType: string;
  summary: string;
  priority?: string;
  assignee?: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepJiraGetIssue extends StepBase {
  type: "jiraGetIssue";
  domain: string;
  issueKey: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepJiraUpdateIssue extends StepBase {
  type: "jiraUpdateIssue";
  domain: string;
  issueKey: string;
  fields: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepJiraAddComment extends StepBase {
  type: "jiraAddComment";
  domain: string;
  issueKey: string;
  body: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepJiraListIssues extends StepBase {
  type: "jiraListIssues";
  domain: string;
  jql?: string;
  maxResults?: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

// ─── HubSpot ─────────────────────────────────────────────────────────

export interface StepHubspotCreateContact extends StepBase {
  type: "hubspotCreateContact";
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepHubspotGetContact extends StepBase {
  type: "hubspotGetContact";
  contactId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepHubspotUpdateContact extends StepBase {
  type: "hubspotUpdateContact";
  contactId: string;
  properties: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepHubspotCreateDeal extends StepBase {
  type: "hubspotCreateDeal";
  dealName: string;
  amount?: string;
  pipeline?: string;
  stage?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepHubspotGetDeal extends StepBase {
  type: "hubspotGetDeal";
  dealId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Twilio ──────────────────────────────────────────────────────────

export interface StepTwilioSendSms extends StepBase {
  type: "twilioSendSms";
  to: string;
  from: string;
  body: string;
  credentialId?: string;
  accountSid?: string;
  authToken?: string;
  storeKey?: string;
}

export interface StepTwilioMakeCall extends StepBase {
  type: "twilioMakeCall";
  to: string;
  from: string;
  url: string;
  credentialId?: string;
  accountSid?: string;
  authToken?: string;
  storeKey?: string;
}

export interface StepTwilioSendWhatsApp extends StepBase {
  type: "twilioSendWhatsApp";
  to: string;
  from: string;
  body: string;
  credentialId?: string;
  accountSid?: string;
  authToken?: string;
  storeKey?: string;
}

// ─── Mailchimp ───────────────────────────────────────────────────────

export interface StepMailchimpAddSubscriber extends StepBase {
  type: "mailchimpAddSubscriber";
  listId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepMailchimpGetSubscriber extends StepBase {
  type: "mailchimpGetSubscriber";
  listId: string;
  subscriberHash: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepMailchimpCreateCampaign extends StepBase {
  type: "mailchimpCreateCampaign";
  campaignType?: string;
  listId: string;
  subject: string;
  fromName: string;
  replyTo: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepMailchimpListCampaigns extends StepBase {
  type: "mailchimpListCampaigns";
  count?: string;
  offset?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Zoom ────────────────────────────────────────────────────────────

export interface StepZoomCreateMeeting extends StepBase {
  type: "zoomCreateMeeting";
  topic: string;
  startTime?: string;
  duration?: string;
  timezone?: string;
  meetingType?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepZoomGetMeeting extends StepBase {
  type: "zoomGetMeeting";
  meetingId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepZoomListMeetings extends StepBase {
  type: "zoomListMeetings";
  userId?: string;
  pageSize?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Supabase ────────────────────────────────────────────────────────

export interface StepSupabaseSelect extends StepBase {
  type: "supabaseSelect";
  projectUrl: string;
  table: string;
  columns?: string;
  filter?: string;
  order?: string;
  limit?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepSupabaseInsert extends StepBase {
  type: "supabaseInsert";
  projectUrl: string;
  table: string;
  data: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepSupabaseUpdate extends StepBase {
  type: "supabaseUpdate";
  projectUrl: string;
  table: string;
  data: string;
  filter: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepSupabaseDelete extends StepBase {
  type: "supabaseDelete";
  projectUrl: string;
  table: string;
  filter: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Salesforce ──────────────────────────────────────────────────────

export interface StepSalesforceCreateRecord extends StepBase {
  type: "salesforceCreateRecord";
  instanceUrl: string;
  objectType: string;
  fields: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepSalesforceGetRecord extends StepBase {
  type: "salesforceGetRecord";
  instanceUrl: string;
  objectType: string;
  recordId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepSalesforceUpdateRecord extends StepBase {
  type: "salesforceUpdateRecord";
  instanceUrl: string;
  objectType: string;
  recordId: string;
  fields: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepSalesforceQuery extends StepBase {
  type: "salesforceQuery";
  instanceUrl: string;
  soql: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Trello ──────────────────────────────────────────────────────────

export interface StepTrelloCreateCard extends StepBase {
  type: "trelloCreateCard";
  listId: string;
  name: string;
  credentialId?: string;
  apiKey?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepTrelloGetCard extends StepBase {
  type: "trelloGetCard";
  cardId: string;
  credentialId?: string;
  apiKey?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepTrelloMoveCard extends StepBase {
  type: "trelloMoveCard";
  cardId: string;
  listId: string;
  credentialId?: string;
  apiKey?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepTrelloListCards extends StepBase {
  type: "trelloListCards";
  listId: string;
  credentialId?: string;
  apiKey?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepTrelloListBoards extends StepBase {
  type: "trelloListBoards";
  memberId?: string;
  credentialId?: string;
  apiKey?: string;
  apiToken?: string;
  storeKey?: string;
}

// ─── Google Calendar ─────────────────────────────────────────────────

export interface StepGoogleCalendarCreateEvent extends StepBase {
  type: "googleCalendarCreateEvent";
  calendarId?: string;
  summary: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  location?: string;
  attendees?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGoogleCalendarGetEvents extends StepBase {
  type: "googleCalendarGetEvents";
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: string;
  q?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGoogleCalendarUpdateEvent extends StepBase {
  type: "googleCalendarUpdateEvent";
  calendarId?: string;
  eventId: string;
  summary?: string;
  startDateTime?: string;
  endDateTime?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGoogleCalendarDeleteEvent extends StepBase {
  type: "googleCalendarDeleteEvent";
  calendarId?: string;
  eventId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Google Drive ────────────────────────────────────────────────────

export interface StepGoogleDriveUploadFile extends StepBase {
  type: "googleDriveUploadFile";
  fileName: string;
  mimeType: string;
  content: string;
  folderId?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGoogleDriveListFiles extends StepBase {
  type: "googleDriveListFiles";
  query?: string;
  pageSize?: string;
  folderId?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGoogleDriveCreateFolder extends StepBase {
  type: "googleDriveCreateFolder";
  name: string;
  parentId?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGoogleDriveDeleteFile extends StepBase {
  type: "googleDriveDeleteFile";
  fileId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Gmail ───────────────────────────────────────────────────────────

export interface StepGmailSendEmail extends StepBase {
  type: "gmailSendEmail";
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string;
  bcc?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGmailGetEmails extends StepBase {
  type: "gmailGetEmails";
  query?: string;
  maxResults?: string;
  labelIds?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGmailGetEmail extends StepBase {
  type: "gmailGetEmail";
  messageId: string;
  format?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── MongoDB ─────────────────────────────────────────────────────────

export interface StepMongodbFind extends StepBase {
  type: "mongodbFind";
  connectionString: string;
  database: string;
  collection: string;
  filter?: string;
  projection?: string;
  sort?: string;
  limit?: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMongodbInsertOne extends StepBase {
  type: "mongodbInsertOne";
  connectionString: string;
  database: string;
  collection: string;
  document: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMongodbUpdateOne extends StepBase {
  type: "mongodbUpdateOne";
  connectionString: string;
  database: string;
  collection: string;
  filter: string;
  update: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMongodbDeleteOne extends StepBase {
  type: "mongodbDeleteOne";
  connectionString: string;
  database: string;
  collection: string;
  filter: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMongodbAggregate extends StepBase {
  type: "mongodbAggregate";
  connectionString: string;
  database: string;
  collection: string;
  pipeline: string;
  credentialId?: string;
  storeKey?: string;
}

// ─── MySQL ───────────────────────────────────────────────────────────

export interface StepMysqlQuery extends StepBase {
  type: "mysqlQuery";
  host: string;
  port?: string;
  database: string;
  user: string;
  password: string;
  query: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMysqlInsert extends StepBase {
  type: "mysqlInsert";
  host: string;
  port?: string;
  database: string;
  user: string;
  password: string;
  table: string;
  columns: string;
  values: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMysqlSelect extends StepBase {
  type: "mysqlSelect";
  host: string;
  port?: string;
  database: string;
  user: string;
  password: string;
  table: string;
  columns?: string;
  where?: string;
  orderBy?: string;
  limit?: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepMysqlUpdate extends StepBase {
  type: "mysqlUpdate";
  host: string;
  port?: string;
  database: string;
  user: string;
  password: string;
  table: string;
  set: string;
  where: string;
  credentialId?: string;
  storeKey?: string;
}

// ─── Redis ───────────────────────────────────────────────────────────

export interface StepRedisGet extends StepBase {
  type: "redisGet";
  host?: string;
  port?: string;
  password?: string;
  redisDatabase?: string;
  key: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepRedisSet extends StepBase {
  type: "redisSet";
  host?: string;
  port?: string;
  password?: string;
  redisDatabase?: string;
  key: string;
  value: string;
  ttl?: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepRedisDelete extends StepBase {
  type: "redisDelete";
  host?: string;
  port?: string;
  password?: string;
  redisDatabase?: string;
  key: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepRedisKeys extends StepBase {
  type: "redisKeys";
  host?: string;
  port?: string;
  password?: string;
  redisDatabase?: string;
  pattern?: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepRedisHget extends StepBase {
  type: "redisHget";
  host?: string;
  port?: string;
  password?: string;
  redisDatabase?: string;
  key: string;
  field: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepRedisHset extends StepBase {
  type: "redisHset";
  host?: string;
  port?: string;
  password?: string;
  redisDatabase?: string;
  key: string;
  field: string;
  value: string;
  credentialId?: string;
  storeKey?: string;
}

// ─── AWS S3 ──────────────────────────────────────────────────────────

export interface StepS3PutObject extends StepBase {
  type: "s3PutObject";
  region: string;
  bucket: string;
  key: string;
  body: string;
  contentType?: string;
  credentialId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  storeKey?: string;
}

export interface StepS3GetObject extends StepBase {
  type: "s3GetObject";
  region: string;
  bucket: string;
  key: string;
  credentialId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  storeKey?: string;
}

export interface StepS3ListObjects extends StepBase {
  type: "s3ListObjects";
  region: string;
  bucket: string;
  prefix?: string;
  maxKeys?: string;
  credentialId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  storeKey?: string;
}

export interface StepS3DeleteObject extends StepBase {
  type: "s3DeleteObject";
  region: string;
  bucket: string;
  key: string;
  credentialId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  storeKey?: string;
}

// ─── Shopify ─────────────────────────────────────────────────────────

export interface StepShopifyCreateProduct extends StepBase {
  type: "shopifyCreateProduct";
  shop: string;
  title: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepShopifyGetProduct extends StepBase {
  type: "shopifyGetProduct";
  shop: string;
  productId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepShopifyListProducts extends StepBase {
  type: "shopifyListProducts";
  shop: string;
  limit?: string;
  title?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepShopifyCreateOrder extends StepBase {
  type: "shopifyCreateOrder";
  shop: string;
  lineItems: string;
  customer?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepShopifyGetOrder extends StepBase {
  type: "shopifyGetOrder";
  shop: string;
  orderId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepShopifyListOrders extends StepBase {
  type: "shopifyListOrders";
  shop: string;
  status?: string;
  limit?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Asana ───────────────────────────────────────────────────────────

export interface StepAsanaCreateTask extends StepBase {
  type: "asanaCreateTask";
  workspace: string;
  projectId?: string;
  name: string;
  notes?: string;
  assignee?: string;
  dueOn?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepAsanaGetTask extends StepBase {
  type: "asanaGetTask";
  taskId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepAsanaUpdateTask extends StepBase {
  type: "asanaUpdateTask";
  taskId: string;
  name?: string;
  notes?: string;
  completed?: string;
  dueOn?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepAsanaListTasks extends StepBase {
  type: "asanaListTasks";
  projectId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Linear ──────────────────────────────────────────────────────────

export interface StepLinearCreateIssue extends StepBase {
  type: "linearCreateIssue";
  teamId: string;
  title: string;
  priority?: string;
  assigneeId?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepLinearGetIssue extends StepBase {
  type: "linearGetIssue";
  issueId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepLinearUpdateIssue extends StepBase {
  type: "linearUpdateIssue";
  issueId: string;
  title?: string;
  stateId?: string;
  priority?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepLinearListIssues extends StepBase {
  type: "linearListIssues";
  teamId?: string;
  first?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── ClickUp ─────────────────────────────────────────────────────────

export interface StepClickupCreateTask extends StepBase {
  type: "clickupCreateTask";
  listId: string;
  name: string;
  priority?: string;
  assignees?: string;
  dueDate?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepClickupGetTask extends StepBase {
  type: "clickupGetTask";
  taskId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepClickupUpdateTask extends StepBase {
  type: "clickupUpdateTask";
  taskId: string;
  name?: string;
  status?: string;
  priority?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepClickupListTasks extends StepBase {
  type: "clickupListTasks";
  listId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Monday.com ──────────────────────────────────────────────────────

export interface StepMondayCreateItem extends StepBase {
  type: "mondayCreateItem";
  boardId: string;
  itemName: string;
  columnValues?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepMondayGetItem extends StepBase {
  type: "mondayGetItem";
  itemId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepMondayUpdateItem extends StepBase {
  type: "mondayUpdateItem";
  boardId: string;
  itemId: string;
  columnValues: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepMondayListItems extends StepBase {
  type: "mondayListItems";
  boardId: string;
  limit?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Dropbox ─────────────────────────────────────────────────────────

export interface StepDropboxUploadFile extends StepBase {
  type: "dropboxUploadFile";
  path: string;
  content: string;
  mode?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepDropboxListFiles extends StepBase {
  type: "dropboxListFiles";
  path?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepDropboxDownloadFile extends StepBase {
  type: "dropboxDownloadFile";
  path: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepDropboxDeleteFile extends StepBase {
  type: "dropboxDeleteFile";
  path: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Box ─────────────────────────────────────────────────────────────

export interface StepBoxUploadFile extends StepBase {
  type: "boxUploadFile";
  folderId: string;
  fileName: string;
  content: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepBoxListFiles extends StepBase {
  type: "boxListFiles";
  folderId?: string;
  limit?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepBoxGetFile extends StepBase {
  type: "boxGetFile";
  fileId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepBoxDeleteFile extends StepBase {
  type: "boxDeleteFile";
  fileId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── GitLab ──────────────────────────────────────────────────────────

export interface StepGitlabCreateIssue extends StepBase {
  type: "gitlabCreateIssue";
  baseUrl?: string;
  projectId: string;
  title: string;
  labels?: string;
  assigneeIds?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGitlabGetIssue extends StepBase {
  type: "gitlabGetIssue";
  baseUrl?: string;
  projectId: string;
  issueIid: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGitlabListIssues extends StepBase {
  type: "gitlabListIssues";
  baseUrl?: string;
  projectId: string;
  state?: string;
  labels?: string;
  perPage?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepGitlabCreateMergeRequest extends StepBase {
  type: "gitlabCreateMergeRequest";
  baseUrl?: string;
  projectId: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── PayPal ──────────────────────────────────────────────────────────

export interface StepPaypalCreateOrder extends StepBase {
  type: "paypalCreateOrder";
  baseUrl?: string;
  intent?: string;
  amount: string;
  currencyCode?: string;
  credentialId?: string;
  clientId?: string;
  clientSecret?: string;
  storeKey?: string;
}

export interface StepPaypalGetOrder extends StepBase {
  type: "paypalGetOrder";
  baseUrl?: string;
  orderId: string;
  credentialId?: string;
  clientId?: string;
  clientSecret?: string;
  storeKey?: string;
}

export interface StepPaypalCaptureOrder extends StepBase {
  type: "paypalCaptureOrder";
  baseUrl?: string;
  orderId: string;
  credentialId?: string;
  clientId?: string;
  clientSecret?: string;
  storeKey?: string;
}

export interface StepPaypalListTransactions extends StepBase {
  type: "paypalListTransactions";
  baseUrl?: string;
  startDate: string;
  endDate: string;
  credentialId?: string;
  clientId?: string;
  clientSecret?: string;
  storeKey?: string;
}

// ─── Typeform ────────────────────────────────────────────────────────

export interface StepTypeformGetForm extends StepBase {
  type: "typeformGetForm";
  formId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepTypeformListForms extends StepBase {
  type: "typeformListForms";
  pageSize?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepTypeformGetResponses extends StepBase {
  type: "typeformGetResponses";
  formId: string;
  pageSize?: string;
  since?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Calendly ────────────────────────────────────────────────────────

export interface StepCalendlyGetUser extends StepBase {
  type: "calendlyGetUser";
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepCalendlyListEvents extends StepBase {
  type: "calendlyListEvents";
  userUri: string;
  minStartTime?: string;
  maxStartTime?: string;
  count?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepCalendlyListEventTypes extends StepBase {
  type: "calendlyListEventTypes";
  userUri: string;
  count?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── WhatsApp ────────────────────────────────────────────────────────

export interface StepWhatsappSendMessage extends StepBase {
  type: "whatsappSendMessage";
  phoneNumberId: string;
  to: string;
  messageType: string;
  text?: string;
  mediaUrl?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepWhatsappSendTemplate extends StepBase {
  type: "whatsappSendTemplate";
  phoneNumberId: string;
  to: string;
  templateName: string;
  languageCode: string;
  components?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepWhatsappGetMedia extends StepBase {
  type: "whatsappGetMedia";
  mediaId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Intercom ────────────────────────────────────────────────────────

export interface StepIntercomCreateContact extends StepBase {
  type: "intercomCreateContact";
  role: string;
  email?: string;
  name?: string;
  phone?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepIntercomGetContact extends StepBase {
  type: "intercomGetContact";
  contactId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepIntercomSendMessage extends StepBase {
  type: "intercomSendMessage";
  messageType: string;
  from: string;
  to: string;
  subject?: string;
  body: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepIntercomListContacts extends StepBase {
  type: "intercomListContacts";
  perPage?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Zendesk ─────────────────────────────────────────────────────────

export interface StepZendeskCreateTicket extends StepBase {
  type: "zendeskCreateTicket";
  subdomain: string;
  subject: string;
  body: string;
  priority?: string;
  ticketType?: string;
  assigneeId?: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepZendeskGetTicket extends StepBase {
  type: "zendeskGetTicket";
  subdomain: string;
  ticketId: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepZendeskUpdateTicket extends StepBase {
  type: "zendeskUpdateTicket";
  subdomain: string;
  ticketId: string;
  status?: string;
  priority?: string;
  comment?: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepZendeskListTickets extends StepBase {
  type: "zendeskListTickets";
  subdomain: string;
  status?: string;
  perPage?: string;
  credentialId?: string;
  email?: string;
  apiToken?: string;
  storeKey?: string;
}

// ─── Freshdesk ───────────────────────────────────────────────────────

export interface StepFreshdeskCreateTicket extends StepBase {
  type: "freshdeskCreateTicket";
  domain: string;
  subject: string;
  email: string;
  priority?: string;
  status?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepFreshdeskGetTicket extends StepBase {
  type: "freshdeskGetTicket";
  domain: string;
  ticketId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepFreshdeskUpdateTicket extends StepBase {
  type: "freshdeskUpdateTicket";
  domain: string;
  ticketId: string;
  status?: string;
  priority?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepFreshdeskListTickets extends StepBase {
  type: "freshdeskListTickets";
  domain: string;
  perPage?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── WooCommerce ─────────────────────────────────────────────────────

export interface StepWooCreateProduct extends StepBase {
  type: "wooCreateProduct";
  storeUrl: string;
  name: string;
  productType?: string;
  regularPrice?: string;
  credentialId?: string;
  consumerKey?: string;
  consumerSecret?: string;
  storeKey?: string;
}

export interface StepWooGetProduct extends StepBase {
  type: "wooGetProduct";
  storeUrl: string;
  productId: string;
  credentialId?: string;
  consumerKey?: string;
  consumerSecret?: string;
  storeKey?: string;
}

export interface StepWooListProducts extends StepBase {
  type: "wooListProducts";
  storeUrl: string;
  perPage?: string;
  status?: string;
  credentialId?: string;
  consumerKey?: string;
  consumerSecret?: string;
  storeKey?: string;
}

export interface StepWooCreateOrder extends StepBase {
  type: "wooCreateOrder";
  storeUrl: string;
  lineItems: string;
  billing?: string;
  credentialId?: string;
  consumerKey?: string;
  consumerSecret?: string;
  storeKey?: string;
}

export interface StepWooGetOrder extends StepBase {
  type: "wooGetOrder";
  storeUrl: string;
  orderId: string;
  credentialId?: string;
  consumerKey?: string;
  consumerSecret?: string;
  storeKey?: string;
}

export interface StepWooListOrders extends StepBase {
  type: "wooListOrders";
  storeUrl: string;
  status?: string;
  perPage?: string;
  credentialId?: string;
  consumerKey?: string;
  consumerSecret?: string;
  storeKey?: string;
}

// ─── ActiveCampaign ──────────────────────────────────────────────────

export interface StepActivecampaignCreateContact extends StepBase {
  type: "activecampaignCreateContact";
  baseUrl: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepActivecampaignGetContact extends StepBase {
  type: "activecampaignGetContact";
  baseUrl: string;
  contactId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepActivecampaignListContacts extends StepBase {
  type: "activecampaignListContacts";
  baseUrl: string;
  limit?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Bitly ───────────────────────────────────────────────────────────

export interface StepBitlyCreateLink extends StepBase {
  type: "bitlyCreateLink";
  longUrl: string;
  title?: string;
  domain?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepBitlyGetLink extends StepBase {
  type: "bitlyGetLink";
  bitlink: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepBitlyListLinks extends StepBase {
  type: "bitlyListLinks";
  groupGuid: string;
  size?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── CircleCI ────────────────────────────────────────────────────────

export interface StepCircleciGetPipeline extends StepBase {
  type: "circleciGetPipeline";
  pipelineId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCircleciListPipelines extends StepBase {
  type: "circleciListPipelines";
  projectSlug: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCircleciTriggerPipeline extends StepBase {
  type: "circleciTriggerPipeline";
  projectSlug: string;
  branch?: string;
  parameters?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Jenkins ─────────────────────────────────────────────────────────

export interface StepJenkinsTriggerBuild extends StepBase {
  type: "jenkinsTriggerBuild";
  baseUrl: string;
  jobName: string;
  parameters?: string;
  credentialId?: string;
  username?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepJenkinsGetBuild extends StepBase {
  type: "jenkinsGetBuild";
  baseUrl: string;
  jobName: string;
  buildNumber: string;
  credentialId?: string;
  username?: string;
  apiToken?: string;
  storeKey?: string;
}

export interface StepJenkinsListJobs extends StepBase {
  type: "jenkinsListJobs";
  baseUrl: string;
  credentialId?: string;
  username?: string;
  apiToken?: string;
  storeKey?: string;
}

// ─── Cloudflare ──────────────────────────────────────────────────────

export interface StepCloudflareListZones extends StepBase {
  type: "cloudflareListZones";
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCloudflareGetDnsRecords extends StepBase {
  type: "cloudflareGetDnsRecords";
  zoneId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCloudflareCreateDnsRecord extends StepBase {
  type: "cloudflareCreateDnsRecord";
  zoneId: string;
  recordType: string;
  name: string;
  content: string;
  ttl?: string;
  proxied?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCloudflarePurgeCache extends StepBase {
  type: "cloudflarePurgeCache";
  zoneId: string;
  purgeEverything?: string;
  files?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── ConvertKit ──────────────────────────────────────────────────────

export interface StepConvertkitAddSubscriber extends StepBase {
  type: "convertkitAddSubscriber";
  formId: string;
  email: string;
  firstName?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepConvertkitGetSubscriber extends StepBase {
  type: "convertkitGetSubscriber";
  subscriberId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepConvertkitListSubscribers extends StepBase {
  type: "convertkitListSubscribers";
  page?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Contentful ──────────────────────────────────────────────────────

export interface StepContentfulGetEntry extends StepBase {
  type: "contentfulGetEntry";
  spaceId: string;
  environment?: string;
  entryId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepContentfulListEntries extends StepBase {
  type: "contentfulListEntries";
  spaceId: string;
  environment?: string;
  contentType?: string;
  limit?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepContentfulCreateEntry extends StepBase {
  type: "contentfulCreateEntry";
  spaceId: string;
  environment?: string;
  contentTypeId: string;
  fields: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Mattermost ──────────────────────────────────────────────────────

export interface StepMattermostSendMessage extends StepBase {
  type: "mattermostSendMessage";
  baseUrl: string;
  channelId: string;
  message: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepMattermostGetChannel extends StepBase {
  type: "mattermostGetChannel";
  baseUrl: string;
  channelId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepMattermostListChannels extends StepBase {
  type: "mattermostListChannels";
  baseUrl: string;
  teamId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── PagerDuty ───────────────────────────────────────────────────────

export interface StepPagerdutyCreateIncident extends StepBase {
  type: "pagerdutyCreateIncident";
  serviceId: string;
  title: string;
  urgency?: string;
  incidentBody?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepPagerdutyGetIncident extends StepBase {
  type: "pagerdutyGetIncident";
  incidentId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepPagerdutyListIncidents extends StepBase {
  type: "pagerdutyListIncidents";
  serviceIds?: string;
  statuses?: string;
  limit?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Sentry ──────────────────────────────────────────────────────────

export interface StepSentryListIssues extends StepBase {
  type: "sentryListIssues";
  organizationSlug: string;
  projectSlug: string;
  query?: string;
  credentialId?: string;
  authToken?: string;
  storeKey?: string;
}

export interface StepSentryGetIssue extends StepBase {
  type: "sentryGetIssue";
  issueId: string;
  credentialId?: string;
  authToken?: string;
  storeKey?: string;
}

export interface StepSentryListProjects extends StepBase {
  type: "sentryListProjects";
  organizationSlug: string;
  credentialId?: string;
  authToken?: string;
  storeKey?: string;
}

// ─── Todoist ─────────────────────────────────────────────────────────

export interface StepTodoistCreateTask extends StepBase {
  type: "todoistCreateTask";
  content: string;
  projectId?: string;
  priority?: string;
  dueString?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepTodoistGetTask extends StepBase {
  type: "todoistGetTask";
  taskId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepTodoistListTasks extends StepBase {
  type: "todoistListTasks";
  projectId?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepTodoistCloseTask extends StepBase {
  type: "todoistCloseTask";
  taskId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── NocoDB ──────────────────────────────────────────────────────────

export interface StepNocodbListRows extends StepBase {
  type: "nocodbListRows";
  baseUrl: string;
  tableId: string;
  limit?: string;
  offset?: string;
  where?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepNocodbGetRow extends StepBase {
  type: "nocodbGetRow";
  baseUrl: string;
  tableId: string;
  rowId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepNocodbCreateRow extends StepBase {
  type: "nocodbCreateRow";
  baseUrl: string;
  tableId: string;
  data: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepNocodbUpdateRow extends StepBase {
  type: "nocodbUpdateRow";
  baseUrl: string;
  tableId: string;
  rowId: string;
  data: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Snowflake ───────────────────────────────────────────────────────

export interface StepSnowflakeQuery extends StepBase {
  type: "snowflakeQuery";
  account: string;
  warehouse?: string;
  database?: string;
  schema?: string;
  query: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

// ─── GraphQL ─────────────────────────────────────────────────────────

export interface StepGraphqlQuery extends StepBase {
  type: "graphqlQuery";
  url: string;
  query: string;
  graphqlVariables?: string;
  headers?: string;
  credentialId?: string;
  storeKey?: string;
}

// ─── Crypto ──────────────────────────────────────────────────────────

export interface StepCryptoHash extends StepBase {
  type: "cryptoHash";
  algorithm: string;
  data: string;
  encoding?: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepCryptoHmac extends StepBase {
  type: "cryptoHmac";
  algorithm: string;
  data: string;
  secret: string;
  encoding?: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepCryptoEncrypt extends StepBase {
  type: "cryptoEncrypt";
  algorithm: string;
  data: string;
  cryptoKey: string;
  credentialId?: string;
  storeKey?: string;
}

export interface StepCryptoDecrypt extends StepBase {
  type: "cryptoDecrypt";
  algorithm: string;
  data: string;
  cryptoKey: string;
  credentialId?: string;
  storeKey?: string;
}

// ─── Baserow ─────────────────────────────────────────────────────────

export interface StepBaserowListRows extends StepBase {
  type: "baserowListRows";
  baseUrl: string;
  tableId: string;
  page?: string;
  size?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepBaserowGetRow extends StepBase {
  type: "baserowGetRow";
  baseUrl: string;
  tableId: string;
  rowId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepBaserowCreateRow extends StepBase {
  type: "baserowCreateRow";
  baseUrl: string;
  tableId: string;
  data: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepBaserowUpdateRow extends StepBase {
  type: "baserowUpdateRow";
  baseUrl: string;
  tableId: string;
  rowId: string;
  data: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Elasticsearch ───────────────────────────────────────────────────

export interface StepElasticsearchSearch extends StepBase {
  type: "elasticsearchSearch";
  baseUrl: string;
  index: string;
  query: string;
  size?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepElasticsearchIndex extends StepBase {
  type: "elasticsearchIndex";
  baseUrl: string;
  index: string;
  esId?: string;
  document: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepElasticsearchGet extends StepBase {
  type: "elasticsearchGet";
  baseUrl: string;
  index: string;
  esId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepElasticsearchDelete extends StepBase {
  type: "elasticsearchDelete";
  baseUrl: string;
  index: string;
  esId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Grafana ─────────────────────────────────────────────────────────

export interface StepGrafanaListDashboards extends StepBase {
  type: "grafanaListDashboards";
  baseUrl: string;
  query?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepGrafanaGetDashboard extends StepBase {
  type: "grafanaGetDashboard";
  baseUrl: string;
  uid: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepGrafanaCreateAnnotation extends StepBase {
  type: "grafanaCreateAnnotation";
  baseUrl: string;
  dashboardId?: string;
  text: string;
  tags?: string;
  time?: string;
  timeEnd?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Netlify ─────────────────────────────────────────────────────────

export interface StepNetlifyListSites extends StepBase {
  type: "netlifyListSites";
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepNetlifyGetSite extends StepBase {
  type: "netlifyGetSite";
  siteId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepNetlifyTriggerBuild extends StepBase {
  type: "netlifyTriggerBuild";
  siteId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── WordPress ───────────────────────────────────────────────────────

export interface StepWordpressCreatePost extends StepBase {
  type: "wordpressCreatePost";
  siteUrl: string;
  title: string;
  content: string;
  status?: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

export interface StepWordpressGetPost extends StepBase {
  type: "wordpressGetPost";
  siteUrl: string;
  postId: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

export interface StepWordpressListPosts extends StepBase {
  type: "wordpressListPosts";
  siteUrl: string;
  perPage?: string;
  status?: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

export interface StepWordpressUpdatePost extends StepBase {
  type: "wordpressUpdatePost";
  siteUrl: string;
  postId: string;
  title?: string;
  content?: string;
  status?: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

// ─── Xero ────────────────────────────────────────────────────────────

export interface StepXeroListContacts extends StepBase {
  type: "xeroListContacts";
  tenantId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepXeroGetContact extends StepBase {
  type: "xeroGetContact";
  tenantId: string;
  contactId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepXeroCreateInvoice extends StepBase {
  type: "xeroCreateInvoice";
  tenantId: string;
  invoiceType?: string;
  contactId: string;
  lineItems: string;
  dueDate?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepXeroListInvoices extends StepBase {
  type: "xeroListInvoices";
  tenantId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── QuickBooks ──────────────────────────────────────────────────────

export interface StepQuickbooksGetCompany extends StepBase {
  type: "quickbooksGetCompany";
  realmId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepQuickbooksCreateInvoice extends StepBase {
  type: "quickbooksCreateInvoice";
  realmId: string;
  customerRef: string;
  lineItems: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepQuickbooksListInvoices extends StepBase {
  type: "quickbooksListInvoices";
  realmId: string;
  queryStr?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepQuickbooksQuery extends StepBase {
  type: "quickbooksQuery";
  realmId: string;
  queryStr: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Pipedrive ───────────────────────────────────────────────────────

export interface StepPipedriveCreateDeal extends StepBase {
  type: "pipedriveCreateDeal";
  title: string;
  value?: string;
  currency?: string;
  personId?: string;
  orgId?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepPipedriveGetDeal extends StepBase {
  type: "pipedriveGetDeal";
  dealId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepPipedriveListDeals extends StepBase {
  type: "pipedriveListDeals";
  limit?: string;
  status?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepPipedriveCreatePerson extends StepBase {
  type: "pipedriveCreatePerson";
  name: string;
  email?: string;
  phone?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Help Scout ──────────────────────────────────────────────────────

export interface StepHelpscoutListConversations extends StepBase {
  type: "helpscoutListConversations";
  mailboxId?: string;
  status?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepHelpscoutGetConversation extends StepBase {
  type: "helpscoutGetConversation";
  conversationId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepHelpscoutCreateConversation extends StepBase {
  type: "helpscoutCreateConversation";
  mailboxId: string;
  subject: string;
  customer: string;
  threads: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Reddit ──────────────────────────────────────────────────────────

export interface StepRedditGetPost extends StepBase {
  type: "redditGetPost";
  subreddit: string;
  postId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepRedditListPosts extends StepBase {
  type: "redditListPosts";
  subreddit: string;
  sort?: string;
  limit?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepRedditSubmitPost extends StepBase {
  type: "redditSubmitPost";
  subreddit: string;
  title: string;
  kind?: string;
  text?: string;
  url?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Spotify ─────────────────────────────────────────────────────────

export interface StepSpotifySearch extends StepBase {
  type: "spotifySearch";
  query: string;
  searchType?: string;
  limit?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepSpotifyGetTrack extends StepBase {
  type: "spotifyGetTrack";
  trackId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepSpotifyGetPlaylist extends StepBase {
  type: "spotifyGetPlaylist";
  playlistId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── ServiceNow ──────────────────────────────────────────────────────

export interface StepServicenowCreateIncident extends StepBase {
  type: "servicenowCreateIncident";
  instanceUrl: string;
  shortDescription: string;
  urgency?: string;
  impact?: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

export interface StepServicenowGetIncident extends StepBase {
  type: "servicenowGetIncident";
  instanceUrl: string;
  sysId: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

export interface StepServicenowListIncidents extends StepBase {
  type: "servicenowListIncidents";
  instanceUrl: string;
  limit?: string;
  query?: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

export interface StepServicenowUpdateIncident extends StepBase {
  type: "servicenowUpdateIncident";
  instanceUrl: string;
  sysId: string;
  shortDescription?: string;
  state?: string;
  credentialId?: string;
  username?: string;
  password?: string;
  storeKey?: string;
}

// ─── Ghost ───────────────────────────────────────────────────────────

export interface StepGhostCreatePost extends StepBase {
  type: "ghostCreatePost";
  apiUrl: string;
  title: string;
  html?: string;
  status?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepGhostGetPost extends StepBase {
  type: "ghostGetPost";
  apiUrl: string;
  postId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepGhostListPosts extends StepBase {
  type: "ghostListPosts";
  apiUrl: string;
  limit?: string;
  status?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Webflow ─────────────────────────────────────────────────────────

export interface StepWebflowListSites extends StepBase {
  type: "webflowListSites";
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepWebflowListCollections extends StepBase {
  type: "webflowListCollections";
  siteId: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepWebflowListItems extends StepBase {
  type: "webflowListItems";
  collectionId: string;
  limit?: string;
  offset?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

export interface StepWebflowCreateItem extends StepBase {
  type: "webflowCreateItem";
  collectionId: string;
  fields: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

// ─── Coda ────────────────────────────────────────────────────────────

export interface StepCodaListDocs extends StepBase {
  type: "codaListDocs";
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCodaGetDoc extends StepBase {
  type: "codaGetDoc";
  docId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCodaListRows extends StepBase {
  type: "codaListRows";
  docId: string;
  tableId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

export interface StepCodaInsertRow extends StepBase {
  type: "codaInsertRow";
  docId: string;
  tableId: string;
  cells: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

// ─── Union Type ──────────────────────────────────────────────────────

export type IntegrationStep =
  // Airtable
  | StepAirtableCreateRecord
  | StepAirtableGetRecord
  | StepAirtableListRecords
  | StepAirtableUpdateRecord
  | StepAirtableDeleteRecord
  // Jira
  | StepJiraCreateIssue
  | StepJiraGetIssue
  | StepJiraUpdateIssue
  | StepJiraAddComment
  | StepJiraListIssues
  // HubSpot
  | StepHubspotCreateContact
  | StepHubspotGetContact
  | StepHubspotUpdateContact
  | StepHubspotCreateDeal
  | StepHubspotGetDeal
  // Twilio
  | StepTwilioSendSms
  | StepTwilioMakeCall
  | StepTwilioSendWhatsApp
  // Mailchimp
  | StepMailchimpAddSubscriber
  | StepMailchimpGetSubscriber
  | StepMailchimpCreateCampaign
  | StepMailchimpListCampaigns
  // Zoom
  | StepZoomCreateMeeting
  | StepZoomGetMeeting
  | StepZoomListMeetings
  // Supabase
  | StepSupabaseSelect
  | StepSupabaseInsert
  | StepSupabaseUpdate
  | StepSupabaseDelete
  // Salesforce
  | StepSalesforceCreateRecord
  | StepSalesforceGetRecord
  | StepSalesforceUpdateRecord
  | StepSalesforceQuery
  // Trello
  | StepTrelloCreateCard
  | StepTrelloGetCard
  | StepTrelloMoveCard
  | StepTrelloListCards
  | StepTrelloListBoards
  // Google Calendar
  | StepGoogleCalendarCreateEvent
  | StepGoogleCalendarGetEvents
  | StepGoogleCalendarUpdateEvent
  | StepGoogleCalendarDeleteEvent
  // Google Drive
  | StepGoogleDriveUploadFile
  | StepGoogleDriveListFiles
  | StepGoogleDriveCreateFolder
  | StepGoogleDriveDeleteFile
  // Gmail
  | StepGmailSendEmail
  | StepGmailGetEmails
  | StepGmailGetEmail
  // MongoDB
  | StepMongodbFind
  | StepMongodbInsertOne
  | StepMongodbUpdateOne
  | StepMongodbDeleteOne
  | StepMongodbAggregate
  // MySQL
  | StepMysqlQuery
  | StepMysqlInsert
  | StepMysqlSelect
  | StepMysqlUpdate
  // Redis
  | StepRedisGet
  | StepRedisSet
  | StepRedisDelete
  | StepRedisKeys
  | StepRedisHget
  | StepRedisHset
  // AWS S3
  | StepS3PutObject
  | StepS3GetObject
  | StepS3ListObjects
  | StepS3DeleteObject
  // Shopify
  | StepShopifyCreateProduct
  | StepShopifyGetProduct
  | StepShopifyListProducts
  | StepShopifyCreateOrder
  | StepShopifyGetOrder
  | StepShopifyListOrders
  // Asana
  | StepAsanaCreateTask
  | StepAsanaGetTask
  | StepAsanaUpdateTask
  | StepAsanaListTasks
  // Linear
  | StepLinearCreateIssue
  | StepLinearGetIssue
  | StepLinearUpdateIssue
  | StepLinearListIssues
  // ClickUp
  | StepClickupCreateTask
  | StepClickupGetTask
  | StepClickupUpdateTask
  | StepClickupListTasks
  // Monday.com
  | StepMondayCreateItem
  | StepMondayGetItem
  | StepMondayUpdateItem
  | StepMondayListItems
  // Dropbox
  | StepDropboxUploadFile
  | StepDropboxListFiles
  | StepDropboxDownloadFile
  | StepDropboxDeleteFile
  // Box
  | StepBoxUploadFile
  | StepBoxListFiles
  | StepBoxGetFile
  | StepBoxDeleteFile
  // GitLab
  | StepGitlabCreateIssue
  | StepGitlabGetIssue
  | StepGitlabListIssues
  | StepGitlabCreateMergeRequest
  // PayPal
  | StepPaypalCreateOrder
  | StepPaypalGetOrder
  | StepPaypalCaptureOrder
  | StepPaypalListTransactions
  // Typeform
  | StepTypeformGetForm
  | StepTypeformListForms
  | StepTypeformGetResponses
  // Calendly
  | StepCalendlyGetUser
  | StepCalendlyListEvents
  | StepCalendlyListEventTypes
  // WhatsApp
  | StepWhatsappSendMessage
  | StepWhatsappSendTemplate
  | StepWhatsappGetMedia
  // Intercom
  | StepIntercomCreateContact
  | StepIntercomGetContact
  | StepIntercomSendMessage
  | StepIntercomListContacts
  // Zendesk
  | StepZendeskCreateTicket
  | StepZendeskGetTicket
  | StepZendeskUpdateTicket
  | StepZendeskListTickets
  // Freshdesk
  | StepFreshdeskCreateTicket
  | StepFreshdeskGetTicket
  | StepFreshdeskUpdateTicket
  | StepFreshdeskListTickets
  // WooCommerce
  | StepWooCreateProduct
  | StepWooGetProduct
  | StepWooListProducts
  | StepWooCreateOrder
  | StepWooGetOrder
  | StepWooListOrders
  // ActiveCampaign
  | StepActivecampaignCreateContact
  | StepActivecampaignGetContact
  | StepActivecampaignListContacts
  // Bitly
  | StepBitlyCreateLink
  | StepBitlyGetLink
  | StepBitlyListLinks
  // CircleCI
  | StepCircleciGetPipeline
  | StepCircleciListPipelines
  | StepCircleciTriggerPipeline
  // Jenkins
  | StepJenkinsTriggerBuild
  | StepJenkinsGetBuild
  | StepJenkinsListJobs
  // Cloudflare
  | StepCloudflareListZones
  | StepCloudflareGetDnsRecords
  | StepCloudflareCreateDnsRecord
  | StepCloudflarePurgeCache
  // ConvertKit
  | StepConvertkitAddSubscriber
  | StepConvertkitGetSubscriber
  | StepConvertkitListSubscribers
  // Contentful
  | StepContentfulGetEntry
  | StepContentfulListEntries
  | StepContentfulCreateEntry
  // Mattermost
  | StepMattermostSendMessage
  | StepMattermostGetChannel
  | StepMattermostListChannels
  // PagerDuty
  | StepPagerdutyCreateIncident
  | StepPagerdutyGetIncident
  | StepPagerdutyListIncidents
  // Sentry
  | StepSentryListIssues
  | StepSentryGetIssue
  | StepSentryListProjects
  // Todoist
  | StepTodoistCreateTask
  | StepTodoistGetTask
  | StepTodoistListTasks
  | StepTodoistCloseTask
  // NocoDB
  | StepNocodbListRows
  | StepNocodbGetRow
  | StepNocodbCreateRow
  | StepNocodbUpdateRow
  // Snowflake
  | StepSnowflakeQuery
  // GraphQL
  | StepGraphqlQuery
  // Crypto
  | StepCryptoHash
  | StepCryptoHmac
  | StepCryptoEncrypt
  | StepCryptoDecrypt
  // Baserow
  | StepBaserowListRows
  | StepBaserowGetRow
  | StepBaserowCreateRow
  | StepBaserowUpdateRow
  // Elasticsearch
  | StepElasticsearchSearch
  | StepElasticsearchIndex
  | StepElasticsearchGet
  | StepElasticsearchDelete
  // Grafana
  | StepGrafanaListDashboards
  | StepGrafanaGetDashboard
  | StepGrafanaCreateAnnotation
  // Netlify
  | StepNetlifyListSites
  | StepNetlifyGetSite
  | StepNetlifyTriggerBuild
  // WordPress
  | StepWordpressCreatePost
  | StepWordpressGetPost
  | StepWordpressListPosts
  | StepWordpressUpdatePost
  // Xero
  | StepXeroListContacts
  | StepXeroGetContact
  | StepXeroCreateInvoice
  | StepXeroListInvoices
  // QuickBooks
  | StepQuickbooksGetCompany
  | StepQuickbooksCreateInvoice
  | StepQuickbooksListInvoices
  | StepQuickbooksQuery
  // Pipedrive
  | StepPipedriveCreateDeal
  | StepPipedriveGetDeal
  | StepPipedriveListDeals
  | StepPipedriveCreatePerson
  // Help Scout
  | StepHelpscoutListConversations
  | StepHelpscoutGetConversation
  | StepHelpscoutCreateConversation
  // Reddit
  | StepRedditGetPost
  | StepRedditListPosts
  | StepRedditSubmitPost
  // Spotify
  | StepSpotifySearch
  | StepSpotifyGetTrack
  | StepSpotifyGetPlaylist
  // ServiceNow
  | StepServicenowCreateIncident
  | StepServicenowGetIncident
  | StepServicenowListIncidents
  | StepServicenowUpdateIncident
  // Ghost
  | StepGhostCreatePost
  | StepGhostGetPost
  | StepGhostListPosts
  // Webflow
  | StepWebflowListSites
  | StepWebflowListCollections
  | StepWebflowListItems
  | StepWebflowCreateItem
  // Coda
  | StepCodaListDocs
  | StepCodaGetDoc
  | StepCodaListRows
  | StepCodaInsertRow;

// ─── Step Type String Array ──────────────────────────────────────────

export const IntegrationStepTypes = [
  // Airtable
  "airtableCreateRecord",
  "airtableGetRecord",
  "airtableListRecords",
  "airtableUpdateRecord",
  "airtableDeleteRecord",
  // Jira
  "jiraCreateIssue",
  "jiraGetIssue",
  "jiraUpdateIssue",
  "jiraAddComment",
  "jiraListIssues",
  // HubSpot
  "hubspotCreateContact",
  "hubspotGetContact",
  "hubspotUpdateContact",
  "hubspotCreateDeal",
  "hubspotGetDeal",
  // Twilio
  "twilioSendSms",
  "twilioMakeCall",
  "twilioSendWhatsApp",
  // Mailchimp
  "mailchimpAddSubscriber",
  "mailchimpGetSubscriber",
  "mailchimpCreateCampaign",
  "mailchimpListCampaigns",
  // Zoom
  "zoomCreateMeeting",
  "zoomGetMeeting",
  "zoomListMeetings",
  // Supabase
  "supabaseSelect",
  "supabaseInsert",
  "supabaseUpdate",
  "supabaseDelete",
  // Salesforce
  "salesforceCreateRecord",
  "salesforceGetRecord",
  "salesforceUpdateRecord",
  "salesforceQuery",
  // Trello
  "trelloCreateCard",
  "trelloGetCard",
  "trelloMoveCard",
  "trelloListCards",
  "trelloListBoards",
  // Google Calendar
  "googleCalendarCreateEvent",
  "googleCalendarGetEvents",
  "googleCalendarUpdateEvent",
  "googleCalendarDeleteEvent",
  // Google Drive
  "googleDriveUploadFile",
  "googleDriveListFiles",
  "googleDriveCreateFolder",
  "googleDriveDeleteFile",
  // Gmail
  "gmailSendEmail",
  "gmailGetEmails",
  "gmailGetEmail",
  // MongoDB
  "mongodbFind",
  "mongodbInsertOne",
  "mongodbUpdateOne",
  "mongodbDeleteOne",
  "mongodbAggregate",
  // MySQL
  "mysqlQuery",
  "mysqlInsert",
  "mysqlSelect",
  "mysqlUpdate",
  // Redis
  "redisGet",
  "redisSet",
  "redisDelete",
  "redisKeys",
  "redisHget",
  "redisHset",
  // AWS S3
  "s3PutObject",
  "s3GetObject",
  "s3ListObjects",
  "s3DeleteObject",
  // Shopify
  "shopifyCreateProduct",
  "shopifyGetProduct",
  "shopifyListProducts",
  "shopifyCreateOrder",
  "shopifyGetOrder",
  "shopifyListOrders",
  // Asana
  "asanaCreateTask",
  "asanaGetTask",
  "asanaUpdateTask",
  "asanaListTasks",
  // Linear
  "linearCreateIssue",
  "linearGetIssue",
  "linearUpdateIssue",
  "linearListIssues",
  // ClickUp
  "clickupCreateTask",
  "clickupGetTask",
  "clickupUpdateTask",
  "clickupListTasks",
  // Monday.com
  "mondayCreateItem",
  "mondayGetItem",
  "mondayUpdateItem",
  "mondayListItems",
  // Dropbox
  "dropboxUploadFile",
  "dropboxListFiles",
  "dropboxDownloadFile",
  "dropboxDeleteFile",
  // Box
  "boxUploadFile",
  "boxListFiles",
  "boxGetFile",
  "boxDeleteFile",
  // GitLab
  "gitlabCreateIssue",
  "gitlabGetIssue",
  "gitlabListIssues",
  "gitlabCreateMergeRequest",
  // PayPal
  "paypalCreateOrder",
  "paypalGetOrder",
  "paypalCaptureOrder",
  "paypalListTransactions",
  // Typeform
  "typeformGetForm",
  "typeformListForms",
  "typeformGetResponses",
  // Calendly
  "calendlyGetUser",
  "calendlyListEvents",
  "calendlyListEventTypes",
  // WhatsApp
  "whatsappSendMessage",
  "whatsappSendTemplate",
  "whatsappGetMedia",
  // Intercom
  "intercomCreateContact",
  "intercomGetContact",
  "intercomSendMessage",
  "intercomListContacts",
  // Zendesk
  "zendeskCreateTicket",
  "zendeskGetTicket",
  "zendeskUpdateTicket",
  "zendeskListTickets",
  // Freshdesk
  "freshdeskCreateTicket",
  "freshdeskGetTicket",
  "freshdeskUpdateTicket",
  "freshdeskListTickets",
  // WooCommerce
  "wooCreateProduct",
  "wooGetProduct",
  "wooListProducts",
  "wooCreateOrder",
  "wooGetOrder",
  "wooListOrders",
  // ActiveCampaign
  "activecampaignCreateContact",
  "activecampaignGetContact",
  "activecampaignListContacts",
  // Bitly
  "bitlyCreateLink",
  "bitlyGetLink",
  "bitlyListLinks",
  // CircleCI
  "circleciGetPipeline",
  "circleciListPipelines",
  "circleciTriggerPipeline",
  // Jenkins
  "jenkinsTriggerBuild",
  "jenkinsGetBuild",
  "jenkinsListJobs",
  // Cloudflare
  "cloudflareListZones",
  "cloudflareGetDnsRecords",
  "cloudflareCreateDnsRecord",
  "cloudflarePurgeCache",
  // ConvertKit
  "convertkitAddSubscriber",
  "convertkitGetSubscriber",
  "convertkitListSubscribers",
  // Contentful
  "contentfulGetEntry",
  "contentfulListEntries",
  "contentfulCreateEntry",
  // Mattermost
  "mattermostSendMessage",
  "mattermostGetChannel",
  "mattermostListChannels",
  // PagerDuty
  "pagerdutyCreateIncident",
  "pagerdutyGetIncident",
  "pagerdutyListIncidents",
  // Sentry
  "sentryListIssues",
  "sentryGetIssue",
  "sentryListProjects",
  // Todoist
  "todoistCreateTask",
  "todoistGetTask",
  "todoistListTasks",
  "todoistCloseTask",
  // NocoDB
  "nocodbListRows",
  "nocodbGetRow",
  "nocodbCreateRow",
  "nocodbUpdateRow",
  // Snowflake
  "snowflakeQuery",
  // GraphQL
  "graphqlQuery",
  // Crypto
  "cryptoHash",
  "cryptoHmac",
  "cryptoEncrypt",
  "cryptoDecrypt",
  // Baserow
  "baserowListRows",
  "baserowGetRow",
  "baserowCreateRow",
  "baserowUpdateRow",
  // Elasticsearch
  "elasticsearchSearch",
  "elasticsearchIndex",
  "elasticsearchGet",
  "elasticsearchDelete",
  // Grafana
  "grafanaListDashboards",
  "grafanaGetDashboard",
  "grafanaCreateAnnotation",
  // Netlify
  "netlifyListSites",
  "netlifyGetSite",
  "netlifyTriggerBuild",
  // WordPress
  "wordpressCreatePost",
  "wordpressGetPost",
  "wordpressListPosts",
  "wordpressUpdatePost",
  // Xero
  "xeroListContacts",
  "xeroGetContact",
  "xeroCreateInvoice",
  "xeroListInvoices",
  // QuickBooks
  "quickbooksGetCompany",
  "quickbooksCreateInvoice",
  "quickbooksListInvoices",
  "quickbooksQuery",
  // Pipedrive
  "pipedriveCreateDeal",
  "pipedriveGetDeal",
  "pipedriveListDeals",
  "pipedriveCreatePerson",
  // Help Scout
  "helpscoutListConversations",
  "helpscoutGetConversation",
  "helpscoutCreateConversation",
  // Reddit
  "redditGetPost",
  "redditListPosts",
  "redditSubmitPost",
  // Spotify
  "spotifySearch",
  "spotifyGetTrack",
  "spotifyGetPlaylist",
  // ServiceNow
  "servicenowCreateIncident",
  "servicenowGetIncident",
  "servicenowListIncidents",
  "servicenowUpdateIncident",
  // Ghost
  "ghostCreatePost",
  "ghostGetPost",
  "ghostListPosts",
  // Webflow
  "webflowListSites",
  "webflowListCollections",
  "webflowListItems",
  "webflowCreateItem",
  // Coda
  "codaListDocs",
  "codaGetDoc",
  "codaListRows",
  "codaInsertRow",
] as const;
