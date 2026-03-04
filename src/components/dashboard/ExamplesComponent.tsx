import type { StoredAutomation } from "@app-types";
import { Button } from "@components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Plus } from "lucide-react";

// Example automations metadata
export const EXAMPLES: Array<{
  id: string;
  name: string;
  description: string;
  fileName: string;
}> = [
  {
    id: "google-search",
    name: "Google Search",
    description: "Search Google for 'loopi browser automation' and take screenshot",
    fileName: "google_search.json",
  },
  {
    id: "contact-form",
    name: "Contact Form Submission",
    description: "Fill and submit a contact form with name, email, and message",
    fileName: "contact_form_submission.json",
  },
  {
    id: "api-github",
    name: "GitHub User API Call",
    description: "Fetch user data from GitHub API and extract information",
    fileName: "api_call_github_user.json",
  },
  {
    id: "hacker-news",
    name: "Hacker News Top Story",
    description: "Get the top story from Hacker News and extract details",
    fileName: "hacker_news_top_story.json",
  },
  {
    id: "multi-scraper",
    name: "Multi-Page Scraper",
    description: "Scrape data across multiple pages with pagination",
    fileName: "multi_page_scraper.json",
  },
  {
    id: "pagination-loop",
    name: "Pagination Price Extraction Loop",
    description: "Extract prices with pagination using variable loops",
    fileName: "pagination_price_extraction_variable_loop.json",
  },
  {
    id: "foreach-url-scraper",
    name: "ForEach URL Scraper",
    description: "Demonstrates forEach loop: iterates over URLs, navigates to each, and extracts page titles",
    fileName: "foreach_url_scraper.json",
  },
  {
    id: "conditional-login-check",
    name: "Conditional Login Check",
    description: "Demonstrates variableConditional branching: checks if user is logged in and acts accordingly",
    fileName: "conditional_login_check.json",
  },
  {
    id: "ai-content-summarizer",
    name: "AI Content Summarizer",
    description: "Demonstrates AI step with variable piping: extracts article text and summarizes with AI",
    fileName: "ai_content_summarizer.json",
  },
  {
    id: "variable-operations-counter",
    name: "Variable Operations Counter",
    description: "Demonstrates setVariable and modifyVariable: creates a counter and builds status strings",
    fileName: "variable_operations_counter.json",
  },
];

interface ExamplesComponentProps {
  automations: StoredAutomation[];
  onLoadExample: (example: (typeof EXAMPLES)[0]) => Promise<void>;
}

export function ExamplesComponent({ automations, onLoadExample }: ExamplesComponentProps) {
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

      <div className="grid gap-4">
        {EXAMPLES.map((example) => (
          <Card
            key={example.id}
            className="hover:shadow-lg transition-shadow hover:z-10 hover:bg-accent hover:border-accent"
          >
            <CardHeader className="py-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-xl">{example.name}</CardTitle>
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
