import { AutomationStep } from "@app-types/steps";

export type UpdatePayload = Partial<{ step: AutomationStep }> | Record<string, unknown>;

export interface StepProps {
  step: AutomationStep;
  id: string;
  onUpdate: (id: string, type: "update", updates?: UpdatePayload) => void;
  onPickWithSetter?: (
    setter: (s: string) => void,
    strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"
  ) => Promise<void>;
}
