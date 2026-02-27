import { TwitterCreateTweetStep } from "@components/automationBuilder/nodeDetails/stepTypes/twitter/TwitterCreateTweetStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("TwitterCreateTweetStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "twitterCreateTweet" as const,
      text: "Test tweet",
    };
    const props = createMockStepProps(step);

    render(<TwitterCreateTweetStep {...props} />);
    expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<TwitterCreateTweetStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays tweet text from props", () => {
    const step = {
      type: "twitterCreateTweet" as const,
      text: "Hello Twitter!",
    };
    const props = createMockStepProps(step);

    render(<TwitterCreateTweetStep {...props} />);
    const textInput = screen.getByPlaceholderText("What's happening?") as HTMLTextAreaElement;
    expect(textInput.value).toBe("Hello Twitter!");
  });

  it("handles empty text", () => {
    const step = {
      type: "twitterCreateTweet" as const,
      text: "",
    };
    const props = createMockStepProps(step);

    render(<TwitterCreateTweetStep {...props} />);
    const textInput = screen.getByPlaceholderText("What's happening?") as HTMLTextAreaElement;
    expect(textInput.value).toBe("");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "twitterCreateTweet" as const,
      text: "Test tweet",
    };
    const props = createMockStepProps(step);

    render(<TwitterCreateTweetStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
  });
});
