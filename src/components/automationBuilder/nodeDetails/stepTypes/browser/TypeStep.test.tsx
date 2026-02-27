import type { AutomationStep } from "@app-types/steps";
import { TypeStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/TypeStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("TypeStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "type" as const,
      selector: "#input",
      value: "Hello World",
    };
    const props = createMockStepProps(step);

    render(<TypeStep {...props} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Text to type")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<TypeStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays selector and value from props", () => {
    const step = {
      type: "type" as const,
      selector: "#input",
      value: "Test value",
    };
    const props = createMockStepProps(step);

    render(<TypeStep {...props} />);
    const selectorInput = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText("Text to type") as HTMLInputElement;
    expect(selectorInput.value).toBe("#input");
    expect(valueInput.value).toBe("Test value");
  });

  it("handles empty values", () => {
    const step = {
      type: "type" as const,
      selector: "",
      value: "",
    };
    const props = createMockStepProps(step);

    render(<TypeStep {...props} />);
    const selectorInput = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText("Text to type") as HTMLInputElement;
    expect(selectorInput.value).toBe("");
    expect(valueInput.value).toBe("");
  });

  it("accepts all required callback props", () => {
    const onUpdate = vi.fn();
    const onPickWithSetter = vi.fn();
    const step = {
      type: "type" as const,
      selector: "#input",
      value: "text",
    };
    const props = createMockStepProps(step);

    render(<TypeStep {...props} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });
});
