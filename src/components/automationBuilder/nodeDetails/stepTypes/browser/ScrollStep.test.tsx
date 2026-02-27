import { ScrollStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/ScrollStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ScrollStep", () => {
  it("renders without errors for toElement scrollType", () => {
    const step = {
      type: "scroll" as const,
      scrollType: "toElement" as const,
      selector: ".target",
    };
    const props = createMockStepProps(step);

    render(<ScrollStep {...props} />);
    expect(screen.getByText("To element")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });

  it("renders without errors for byAmount scrollType", () => {
    const step = {
      type: "scroll" as const,
      scrollType: "byAmount" as const,
      scrollAmount: 200,
    };
    const props = createMockStepProps(step);

    render(<ScrollStep {...props} />);
    expect(screen.getByText("By amount")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 200")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<ScrollStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays scroll amount from props", () => {
    const step = {
      type: "scroll" as const,
      scrollType: "byAmount" as const,
      scrollAmount: 500,
    };
    const props = createMockStepProps(step);

    render(<ScrollStep {...props} />);
    const input = screen.getByPlaceholderText("e.g. 200") as HTMLInputElement;
    expect(input.value).toBe("500");
  });

  it("displays selector for toElement type", () => {
    const step = {
      type: "scroll" as const,
      scrollType: "toElement" as const,
      selector: "#footer",
    };
    const props = createMockStepProps(step);

    render(<ScrollStep {...props} />);
    const input = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    expect(input.value).toBe("#footer");
  });

  it("accepts all required callback props", () => {
    const onUpdate = vi.fn();
    const onPickWithSetter = vi.fn();
    const step = {
      type: "scroll" as const,
      scrollType: "toElement" as const,
      selector: ".target",
    };
    const props = createMockStepProps(step);

    render(<ScrollStep {...props} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />);
    expect(screen.getByText("To element")).toBeInTheDocument();
  });
});
