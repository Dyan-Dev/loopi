import { AiOpenAIStep } from "@components/automationBuilder/nodeDetails/stepTypes/integration/AiOpenAIStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("AiOpenAIStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "aiOpenAI" as const,
      model: "gpt-4o-mini",
      prompt: "Test prompt",
      temperature: 0,
      maxTokens: 256,
    };
    const props = createMockStepProps(step);

    render(<AiOpenAIStep {...props} />);
    expect(screen.getByPlaceholderText("e.g., gpt-4o-mini, gpt-4-turbo")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<AiOpenAIStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays model value from props", () => {
    const step = {
      type: "aiOpenAI" as const,
      model: "gpt-4-turbo",
      prompt: "Test",
      temperature: 0.5,
      maxTokens: 512,
    };
    const props = createMockStepProps(step);

    render(<AiOpenAIStep {...props} />);
    const modelInput = screen.getByPlaceholderText(
      "e.g., gpt-4o-mini, gpt-4-turbo"
    ) as HTMLInputElement;
    expect(modelInput.value).toBe("gpt-4-turbo");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "aiOpenAI" as const,
      model: "gpt-4o-mini",
      prompt: "Test",
      temperature: 0,
      maxTokens: 256,
    };
    const props = createMockStepProps(step);

    render(<AiOpenAIStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("e.g., gpt-4o-mini, gpt-4-turbo")).toBeInTheDocument();
  });
});
