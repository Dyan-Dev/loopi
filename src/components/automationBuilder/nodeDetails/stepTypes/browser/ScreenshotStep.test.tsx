import { ScreenshotStep } from "@components/automationBuilder/nodeDetails/stepTypes/browser/ScreenshotStep";
import { createMockStepProps } from "@src/test/testUtils";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ScreenshotStep", () => {
  it("renders without errors", () => {
    const step = {
      type: "screenshot" as const,
      savePath: "screenshots/test.png",
    };
    const props = createMockStepProps(step);

    render(<ScreenshotStep {...props} />);
    expect(screen.getByPlaceholderText("save/path/filename.png")).toBeInTheDocument();
  });

  it("returns null when step type does not match", () => {
    const step = {
      type: "click" as const,
      selector: "#button",
    };
    const props = createMockStepProps(step);

    const { container } = render(<ScreenshotStep {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays savePath from props", () => {
    const step = {
      type: "screenshot" as const,
      savePath: "images/screenshot.png",
    };
    const props = createMockStepProps(step);

    render(<ScreenshotStep {...props} />);
    const input = screen.getByPlaceholderText("save/path/filename.png") as HTMLInputElement;
    expect(input.value).toBe("images/screenshot.png");
  });

  it("handles empty savePath", () => {
    const step = {
      type: "screenshot" as const,
      savePath: "",
    };
    const props = createMockStepProps(step);

    render(<ScreenshotStep {...props} />);
    const input = screen.getByPlaceholderText("save/path/filename.png") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("accepts onUpdate callback prop", () => {
    const onUpdate = vi.fn();
    const step = {
      type: "screenshot" as const,
      savePath: "test.png",
    };
    const props = createMockStepProps(step);

    render(<ScreenshotStep {...props} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("save/path/filename.png")).toBeInTheDocument();
  });
});
