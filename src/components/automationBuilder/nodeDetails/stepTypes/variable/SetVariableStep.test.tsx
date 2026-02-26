import { SetVariableStep } from "@components/automationBuilder/nodeDetails/stepTypes/variable/SetVariableStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("SetVariableStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "setVariable" as const,
      variableName: "productTitle",
      value: "Test Product",
    };
    const props = createMockStepProps(step);

    render(<SetVariableStep {...props} />);
    expect(screen.getByPlaceholderText("e.g. productTitle")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Use static text or {{otherVar}}")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<SetVariableStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays variableName and value from props", () => {
    const step = {
      type: "setVariable" as const,
      variableName: "myVar",
      value: "myValue",
    };
    const props = createMockStepProps(step);

    render(<SetVariableStep {...props} />);
    const nameInput = screen.getByPlaceholderText("e.g. productTitle") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText(
      "Use static text or {{otherVar}}"
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("myVar");
    expect(valueInput.value).toBe("myValue");
  });

  it("handles empty values", () => {
    const step = {
      type: "setVariable" as const,
      variableName: "",
      value: "",
    };
    const props = createMockStepProps(step);

    render(<SetVariableStep {...props} />);
    const nameInput = screen.getByPlaceholderText("e.g. productTitle") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText(
      "Use static text or {{otherVar}}"
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("");
    expect(valueInput.value).toBe("");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "setVariable" as const,
      variableName: "test",
      value: "value",
    };
    const props = createMockStepProps(step);

    render(<SetVariableStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("e.g. productTitle")).toBeInTheDocument();
  });
});
