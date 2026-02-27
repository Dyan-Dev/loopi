import { SelectOptionStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/SelectOptionStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("SelectOptionStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "selectOption" as const,
      selector: "select#dropdown",
      optionValue: "option1",
      optionIndex: 0,
    };
    const props = createMockStepProps(step);

    render(<SelectOptionStep {...props} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Option value to select")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Option index to select")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<SelectOptionStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays selector, optionValue, and optionIndex from props", () => {
    const step = {
      type: "selectOption" as const,
      selector: "select#country",
      optionValue: "usa",
      optionIndex: 2,
    };
    const props = createMockStepProps(step);

    render(<SelectOptionStep {...props} />);
    const selectorInput = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText("Option value to select") as HTMLInputElement;
    const indexInput = screen.getByPlaceholderText("Option index to select") as HTMLInputElement;
    expect(selectorInput.value).toBe("select#country");
    expect(valueInput.value).toBe("usa");
    expect(indexInput.value).toBe("2");
  });

  it("handles empty values", () => {
    const step = {
      type: "selectOption" as const,
      selector: "",
      optionValue: "",
      optionIndex: 0,
    };
    const props = createMockStepProps(step);

    render(<SelectOptionStep {...props} />);
    const selectorInput = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText("Option value to select") as HTMLInputElement;
    expect(selectorInput.value).toBe("");
    expect(valueInput.value).toBe("");
  });

  it("accepts all required callback props", () => {
    const onUpdate = vi.fn();
    const onPickWithSetter = vi.fn();
    const step = {
      type: "selectOption" as const,
      selector: "select",
      optionValue: "value",
      optionIndex: 0,
    };
    const props = createMockStepProps(step);

    render(<SelectOptionStep {...props} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });
});
