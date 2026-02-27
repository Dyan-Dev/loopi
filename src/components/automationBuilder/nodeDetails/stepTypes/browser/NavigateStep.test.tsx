import { NavigateStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/NavigateStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("NavigateStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "navigate" as const,
      value: "https://example.com",
    };
    const props = createMockStepProps(step);

    render(<NavigateStep {...props} />);
    expect(screen.getByPlaceholderText("https://google.com")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<NavigateStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays URL value from props", () => {
    const step = {
      type: "navigate" as const,
      value: "https://example.com",
    };
    const props = createMockStepProps(step);

    render(<NavigateStep {...props} />);
    const input = screen.getByPlaceholderText("https://google.com") as HTMLInputElement;
    expect(input.value).toBe("https://example.com");
  });

  it("handles empty URL", () => {
    const step = {
      type: "navigate" as const,
      value: "",
    };
    const props = createMockStepProps(step);

    render(<NavigateStep {...props} />);
    const input = screen.getByPlaceholderText("https://google.com") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "navigate" as const,
      value: "https://example.com",
    };
    const props = createMockStepProps(step);

    render(<NavigateStep {...props} step={{ ...props.step }} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("https://google.com")).toBeInTheDocument();
  });
});
