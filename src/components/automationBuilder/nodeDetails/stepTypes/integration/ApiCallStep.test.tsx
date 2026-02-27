import { ApiCallStep } from "@components/automationBuilder/nodeDetails/stepTypes/integration/ApiCallStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ApiCallStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "apiCall" as const,
      method: "GET" as const,
      url: "https://api.example.com",
      headers: {},
    };
    const props = createMockStepProps(step);

    render(<ApiCallStep {...props} />);
    expect(screen.getByPlaceholderText("https://api.example.com/endpoint")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<ApiCallStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays URL from props", () => {
    const step = {
      type: "apiCall" as const,
      method: "GET" as const,
      url: "https://api.test.com/endpoint",
      headers: {},
    };
    const props = createMockStepProps(step);

    render(<ApiCallStep {...props} />);
    const urlInput = screen.getByPlaceholderText(
      "https://api.example.com/endpoint"
    ) as HTMLInputElement;
    expect(urlInput.value).toBe("https://api.test.com/endpoint");
  });

  it("shows body field for POST method", () => {
    const step = {
      type: "apiCall" as const,
      method: "POST" as const,
      url: "https://api.example.com",
      body: '{"test": "data"}',
      headers: {},
    };
    const props = createMockStepProps(step);

    render(<ApiCallStep {...props} />);
    expect(screen.getByPlaceholderText('{"key": "value"}')).toBeInTheDocument();
  });

  it("hides body field for GET method", () => {
    const step = {
      type: "apiCall" as const,
      method: "GET" as const,
      url: "https://api.example.com",
      headers: {},
    };
    const props = createMockStepProps(step);

    render(<ApiCallStep {...props} />);
    expect(screen.queryByPlaceholderText('{"key": "value"}')).not.toBeInTheDocument();
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "apiCall" as const,
      method: "GET" as const,
      url: "https://api.example.com",
      headers: {},
    };
    const props = createMockStepProps(step);

    render(<ApiCallStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("https://api.example.com/endpoint")).toBeInTheDocument();
  });
});
