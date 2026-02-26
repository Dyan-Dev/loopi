import type { AutomationStep } from "@app-types/steps";
import type { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { render } from "@testing-library/react";

// Mock functions for testing
export const mockOnUpdate = () => {
  // Intentionally empty for testing
};
export const mockOnPickWithSetter = async () => {
  // Intentionally empty for testing
};

// Type for partial step objects in tests (id and description are optional)
export type TestStep = Partial<AutomationStep> & { type: string };

// Helper to create mock StepProps
export function createMockStepProps(step: TestStep): StepProps {
  const fullStep = {
    id: "test-step-id",
    description: "Test step description",
    ...step,
  } as AutomationStep;

  return {
    step: fullStep,
    id: "test-id",
    onUpdate: mockOnUpdate,
    onPickWithSetter: mockOnPickWithSetter,
  };
}

// Custom render function that includes common providers
export function renderStep(ui: React.ReactElement) {
  return render(ui);
}
