import { ClickStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/ClickStep";
import type { TestStep } from "@src/test/testUtils";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ClickStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    render(<ClickStep {...props} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "navigate" as const,
      value: "https://example.com",
    };
    const props = createMockStepProps(step);

    const { container } = render(<ClickStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays selector value from props", () => {
    const step = {
      type: "click" as const,
      selector: ".my-selector",
    };
    const props = createMockStepProps(step);

    render(<ClickStep {...props} />);
    const input = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    expect(input.value).toBe(".my-selector");
  });

  it("handles empty selector", () => {
    const step = {
      type: "click" as const,
      selector: "",
    };
    const props = createMockStepProps(step);

    render(<ClickStep {...props} />);
    const input = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    render(<ClickStep {...props} step={{ ...props.step }} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });

  it("accepts onPickWithSetter callback prop", () => {
    const onPickWithSetter = vi.fn();
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    render(
      <ClickStep
        {...props}
        step={{ ...props.step }}
        onUpdate={vi.fn()}
        onPickWithSetter={onPickWithSetter}
      />
    );
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });
});
