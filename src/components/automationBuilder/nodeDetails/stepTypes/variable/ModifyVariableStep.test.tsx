import { ModifyVariableStep } from "@components/automationBuilder/nodeDetails/stepTypes/variable/ModifyVariableStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ModifyVariableStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "modifyVariable" as const,
      variableName: "counter",
      operation: "increment" as const,
      value: "1",
    };
    const props = createMockStepProps(step);

    render(<ModifyVariableStep {...props} />);
    expect(screen.getByPlaceholderText("variable name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Value or {{otherVar}}")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<ModifyVariableStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays variableName, operation, and value from props", () => {
    const step = {
      type: "modifyVariable" as const,
      variableName: "count",
      operation: "increment" as const,
      value: "5",
    };
    const props = createMockStepProps(step);

    render(<ModifyVariableStep {...props} />);
    const nameInput = screen.getByPlaceholderText("variable name") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText("Value or {{otherVar}}") as HTMLInputElement;
    const operationSelect = screen.getByDisplayValue("Increment") as HTMLSelectElement;
    expect(nameInput.value).toBe("count");
    expect(valueInput.value).toBe("5");
    expect(operationSelect.value).toBe("increment");
  });

  it("handles empty values", () => {
    const step = {
      type: "modifyVariable" as const,
      variableName: "",
      operation: "set" as const,
      value: "",
    };
    const props = createMockStepProps(step);

    render(<ModifyVariableStep {...props} />);
    const nameInput = screen.getByPlaceholderText("variable name") as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText("Value or {{otherVar}}") as HTMLInputElement;
    expect(nameInput.value).toBe("");
    expect(valueInput.value).toBe("");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "modifyVariable" as const,
      variableName: "test",
      operation: "set" as const,
      value: "value",
    };
    const props = createMockStepProps(step);

    render(<ModifyVariableStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("variable name")).toBeInTheDocument();
  });
});
