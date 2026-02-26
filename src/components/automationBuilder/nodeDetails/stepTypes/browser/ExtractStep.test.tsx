import { ExtractStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/ExtractStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ExtractStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "extract" as const,
      selector: ".price",
      storeKey: "productPrice",
    };
    const props = createMockStepProps(step);

    render(<ExtractStep {...props} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g., productPrice, title")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<ExtractStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays selector and storeKey from props", () => {
    const step = {
      type: "extract" as const,
      selector: ".title",
      storeKey: "pageTitle",
    };
    const props = createMockStepProps(step);

    render(<ExtractStep {...props} />);
    const selectorInput = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    const storeKeyInput = screen.getByPlaceholderText(
      "e.g., productPrice, title"
    ) as HTMLInputElement;
    expect(selectorInput.value).toBe(".title");
    expect(storeKeyInput.value).toBe("pageTitle");
  });

  it("handles empty values", () => {
    const step = {
      type: "extract" as const,
      selector: "",
      storeKey: "",
    };
    const props = createMockStepProps(step);

    render(<ExtractStep {...props} />);
    const selectorInput = screen.getByPlaceholderText("Selector") as HTMLInputElement;
    const storeKeyInput = screen.getByPlaceholderText(
      "e.g., productPrice, title"
    ) as HTMLInputElement;
    expect(selectorInput.value).toBe("");
    expect(storeKeyInput.value).toBe("");
  });

  it("accepts all required callback props", () => {
    const onUpdate = vi.fn();
    const onPickWithSetter = vi.fn();
    const step = {
      type: "extract" as const,
      selector: ".price",
      storeKey: "price",
    };
    const props = createMockStepProps(step);

    render(<ExtractStep {...props} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />);
    expect(screen.getByPlaceholderText("Selector")).toBeInTheDocument();
  });
});
