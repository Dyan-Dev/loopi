import { SlackSendMessageStep } from "@components/automationBuilder/nodeDetails/stepTypes/slack/SlackSendMessageStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("SlackSendMessageStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "slackSendMessage" as const,
      channelId: "C123456",
      text: "Test message",
    };
    const props = createMockStepProps(step);

    render(<SlackSendMessageStep {...props} />);
    expect(
      screen.getByPlaceholderText("Channel ID or name (e.g., C123456 or #general)")
    ).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<SlackSendMessageStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays channelId and text from props", () => {
    const step = {
      type: "slackSendMessage" as const,
      channelId: "#general",
      text: "Hello Slack",
    };
    const props = createMockStepProps(step);

    render(<SlackSendMessageStep {...props} />);
    const channelInput = screen.getByPlaceholderText(
      "Channel ID or name (e.g., C123456 or #general)"
    ) as HTMLInputElement;
    const textInput = screen.getByPlaceholderText(
      "Message content (supports variables like {{variableName}})"
    ) as HTMLTextAreaElement;
    expect(channelInput.value).toBe("#general");
    expect(textInput.value).toBe("Hello Slack");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "slackSendMessage" as const,
      channelId: "C123",
      text: "Test",
    };
    const props = createMockStepProps(step);

    render(<SlackSendMessageStep {...props} onUpdate={onUpdate} />);
    expect(
      screen.getByPlaceholderText("Channel ID or name (e.g., C123456 or #general)")
    ).toBeInTheDocument();
  });
});
