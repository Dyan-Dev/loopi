import { DiscordSendMessageStep } from "@components/automationBuilder/nodeDetails/stepTypes/discord/DiscordSendMessageStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("DiscordSendMessageStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "discordSendMessage" as const,
      channelId: "123456789",
      content: "Test message",
    };
    const props = createMockStepProps(step);

    render(<DiscordSendMessageStep {...props} />);
    expect(screen.getByPlaceholderText("Channel ID")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<DiscordSendMessageStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays channelId and content from props", () => {
    const step = {
      type: "discordSendMessage" as const,
      channelId: "987654321",
      content: "Hello Discord",
    };
    const props = createMockStepProps(step);

    render(<DiscordSendMessageStep {...props} />);
    const channelInput = screen.getByPlaceholderText("Channel ID") as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      "Message content (supports variables like {{name}})"
    ) as HTMLTextAreaElement;
    expect(channelInput.value).toBe("987654321");
    expect(contentInput.value).toBe("Hello Discord");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "discordSendMessage" as const,
      channelId: "123",
      content: "Test",
    };
    const props = createMockStepProps(step);

    render(<DiscordSendMessageStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("Channel ID")).toBeInTheDocument();
  });
});
