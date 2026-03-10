import type { StoredAutomation } from "@app-types";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

type ExampleCategory = "all" | "scraping" | "api" | "ai" | "logic" | "integration";

interface ExampleMeta {
  id: string;
  name: string;
  description: string;
  fileName: string;
  category: ExampleCategory;
}

// Example automations metadata
export const EXAMPLES: ExampleMeta[] = [
  // --- Scraping ---
  {
    id: "google-search",
    name: "Google Search",
    description: "Search Google for 'loopi browser automation' and take screenshot",
    fileName: "google_search.json",
    category: "scraping",
  },
  {
    id: "contact-form",
    name: "Contact Form Submission",
    description: "Fill and submit a contact form with name, email, and message",
    fileName: "contact_form_submission.json",
    category: "scraping",
  },
  {
    id: "hacker-news",
    name: "Hacker News Top Story",
    description: "Get the top story from Hacker News and extract details",
    fileName: "hacker_news_top_story.json",
    category: "scraping",
  },
  {
    id: "multi-scraper",
    name: "Multi-Page Scraper",
    description: "Scrape data across multiple pages with pagination",
    fileName: "multi_page_scraper.json",
    category: "scraping",
  },
  {
    id: "pagination-loop",
    name: "Pagination Price Extraction Loop",
    description: "Extract prices with pagination using variable loops",
    fileName: "pagination_price_extraction_variable_loop.json",
    category: "scraping",
  },
  {
    id: "data-extraction-pipeline",
    name: "Data Extraction Pipeline",
    description:
      "Extracts product data from a page, builds a structured summary, and sends it to an API endpoint",
    fileName: "data_extraction_pipeline.json",
    category: "scraping",
  },
  // --- API ---
  {
    id: "api-github",
    name: "GitHub User API Call",
    description: "Fetch user data from GitHub API and extract information",
    fileName: "api_call_github_user.json",
    category: "api",
  },
  {
    id: "api-polling-notification",
    name: "API Polling with Notification",
    description:
      "Polls an API endpoint, checks conditions, and sends Discord webhook notification when triggered",
    fileName: "api_polling_notification.json",
    category: "api",
  },
  {
    id: "github-issue-tracker",
    name: "GitHub Issue Tracker",
    description: "Lists open issues from a repo, filters critical ones, and creates a summary",
    fileName: "github_issue_tracker.json",
    category: "api",
  },
  {
    id: "stripe-payment-monitor",
    name: "Stripe Payment Monitor",
    description: "Monitors Stripe payments and triggers automated actions based on transaction status",
    fileName: "stripe_payment_monitor.json",
    category: "api",
  },
  {
    id: "postgres-data-sync",
    name: "PostgreSQL Data Sync",
    description: "Syncs data between external sources and PostgreSQL database",
    fileName: "postgres_data_sync.json",
    category: "api",
  },
  // --- AI ---
  {
    id: "ai-content-summarizer",
    name: "AI Content Summarizer",
    description:
      "Demonstrates AI step with variable piping: extracts article text and summarizes with AI",
    fileName: "ai_content_summarizer.json",
    category: "ai",
  },
  {
    id: "ai-text-processing",
    name: "AI Text Processing Pipeline",
    description:
      "Extracts article text, uses AI to summarize and extract key entities, then builds a final report",
    fileName: "ai_text_processing.json",
    category: "ai",
  },
  // --- Logic ---
  {
    id: "foreach-url-scraper",
    name: "ForEach URL Scraper",
    description:
      "Demonstrates forEach loop: iterates over URLs, navigates to each, and extracts page titles",
    fileName: "foreach_url_scraper.json",
    category: "logic",
  },
  {
    id: "loop-data-processing",
    name: "Loop Data Processing",
    description:
      "ForEach loop over URLs: navigates, extracts titles, appends to results array, builds summary",
    fileName: "loop_data_processing.json",
    category: "logic",
  },
  {
    id: "conditional-login-check",
    name: "Conditional Login Check",
    description:
      "Demonstrates variableConditional branching: checks if user is logged in and acts accordingly",
    fileName: "conditional_login_check.json",
    category: "logic",
  },
  {
    id: "variable-operations-counter",
    name: "Variable Operations Counter",
    description:
      "Demonstrates setVariable and modifyVariable: creates a counter and builds status strings",
    fileName: "variable_operations_counter.json",
    category: "logic",
  },
  {
    id: "data-transformation-pipeline",
    name: "Data Transformation Pipeline",
    description:
      "Demonstrates JSON parsing, math, string operations, filtering, mapping, and code execution",
    fileName: "data_transformation_pipeline.json",
    category: "logic",
  },
  // --- Integration & Social ---
  {
    id: "google-sheets-report",
    name: "Google Sheets Report",
    description: "Generates data reports and updates Google Sheets with automated results",
    fileName: "google_sheets_report.json",
    category: "integration",
  },
  {
    id: "notion-content-pipeline",
    name: "Notion Content Pipeline",
    description: "Automatically processes and syncs content to Notion databases",
    fileName: "notion_content_pipeline.json",
    category: "integration",
  },
  {
    id: "sendgrid-email-campaign",
    name: "SendGrid Email Campaign",
    description: "Automates email campaigns with SendGrid integration and tracking",
    fileName: "sendgrid_email_campaign.json",
    category: "integration",
  },
  {
    id: "telegram-notification-bot",
    name: "Telegram Notification Bot",
    description: "Sends automated notifications and messages via Telegram bot",
    fileName: "telegram_notification_bot.json",
    category: "integration",
  },
  {
    id: "twitter-dm-automation",
    name: "Twitter DM Automation",
    description: "Automates sending and responding to Twitter direct messages",
    fileName: "twitter_dm_automation.json",
    category: "integration",
  },
  {
    id: "twitter-interaction-workflow",
    name: "Twitter Interaction Workflow",
    description: "Automates liking, retweeting, and engaging with Twitter content",
    fileName: "twitter_interaction_workflow.json",
    category: "integration",
  },
  {
    id: "twitter-post-and-search",
    name: "Twitter Post and Search",
    description: "Posts tweets and searches for specific content on Twitter",
    fileName: "twitter_post_and_search.json",
    category: "integration",
  },
];

const CATEGORY_LABELS: Record<ExampleCategory, string> = {
  all: "All",
  scraping: "Web Scraping",
  api: "API & Integration",
  ai: "AI Processing",
  logic: "Logic & Loops",
  integration: "Social & Messaging",
};

interface ExamplesComponentProps {
  automations: StoredAutomation[];
  onLoadExample: (example: ExampleMeta) => Promise<void>;
}

export function ExamplesComponent({ automations, onLoadExample }: ExamplesComponentProps) {
  const [activeCategory, setActiveCategory] = useState<ExampleCategory>("all");

  const filteredExamples =
    activeCategory === "all" ? EXAMPLES : EXAMPLES.filter((e) => e.category === activeCategory);

  const categoriesWithCounts = (Object.keys(CATEGORY_LABELS) as ExampleCategory[]).filter(
    (cat) => cat === "all" || EXAMPLES.some((e) => e.category === cat)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Example Automations</h2>
          <p className="text-sm text-muted-foreground">
            Load and explore ready-made automation examples to get started
          </p>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="flex flex-wrap gap-2">
        {categoriesWithCounts.map((cat) => {
          const count =
            cat === "all" ? EXAMPLES.length : EXAMPLES.filter((e) => e.category === cat).length;
          return (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className="cursor-pointer"
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {filteredExamples.map((example) => (
          <Card
            key={example.id}
            className="hover:shadow-lg transition-shadow hover:z-10 hover:bg-accent hover:border-accent"
          >
            <CardHeader className="py-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{example.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[example.category]}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{example.description}</CardDescription>
                </div>

                <Button
                  onClick={() => onLoadExample(example)}
                  size="sm"
                  className="ml-4 self-start cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Load Example
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
