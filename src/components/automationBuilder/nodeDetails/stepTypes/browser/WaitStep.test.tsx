import { WaitStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/WaitStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("WaitStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "wait" as const,
      value: "5",
    };
    const props = createMockStepProps(step);

    render(<WaitStep {...props} />);
    expect(screen.getByPlaceholderText("Milliseconds to wait")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<WaitStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays duration value from props", () => {
    const step = {
      type: "wait" as const,
      value: "10",
    };
    const props = createMockStepProps(step);

    render(<WaitStep {...props} />);
    const input = screen.getByPlaceholderText("Milliseconds to wait") as HTMLInputElement;
    expect(input.value).toBe("10");
  });

  it("handles default value", () => {
    const step = {
      type: "wait" as const,
      value: "",
    };
    const props = createMockStepProps(step);

    render(<WaitStep {...props} />);
    const input = screen.getByPlaceholderText("Milliseconds to wait") as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "wait" as const,
      value: "5",
    };
    const props = createMockStepProps(step);

    render(<WaitStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("Milliseconds to wait")).toBeInTheDocument();
  });
});
