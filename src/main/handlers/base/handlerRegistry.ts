import type { HandlerContext } from "./BaseRestHandler";

export type StepExecutor = (step: Record<string, unknown>, ctx: HandlerContext) => Promise<unknown>;

const registry = new Map<string, StepExecutor>();

export function registerHandler(stepType: string, executor: StepExecutor): void {
  registry.set(stepType, executor);
}

export function getHandler(stepType: string): StepExecutor | undefined {
  return registry.get(stepType);
}

export function hasHandler(stepType: string): boolean {
  return registry.has(stepType);
}
