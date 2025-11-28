import { Globe, Mouse, Type as TypeIcon, Clock, Camera } from "lucide-react";

/**
 * Automation Step Type System
 *
 * This module defines a discriminated union for all automation step types.
 * Each step has a unique 'type' field that TypeScript uses for type narrowing.
 */

/** Base properties shared by all automation steps */
export interface StepBase {
  id: string;
  description: string;
}

/** Navigate to a URL */
export interface StepNavigate extends StepBase {
  type: "navigate";
  value: string; // URL
}

export interface StepClick extends StepBase {
  type: "click";
  selector: string;
}

export interface StepType extends StepBase {
  type: "type";
  selector: string;
  value: string;
  credentialId?: string;
}

export interface StepWait extends StepBase {
  type: "wait";
  value: string; // seconds as string (current executor parses with parseInt)
}

export interface StepScreenshot extends StepBase {
  type: "screenshot";
  savePath?: string;
}

export interface StepExtract extends StepBase {
  type: "extract";
  selector: string;
  storeKey?: string;
}

export type ComparisonOp = "equals" | "contains" | "greaterThan" | "lessThan";

export interface StepExtractWithLogic extends StepBase {
  type: "extractWithLogic";
  selector: string;
  condition: ComparisonOp;
  expectedValue: string;
}

export interface StepApiCall extends StepBase {
  type: "apiCall";
  method?: "GET" | "POST";
  url: string;
  body?: string;
  headers?: Record<string, string>;
  storeKey?: string;
}

export type ScrollType = "toElement" | "byAmount";
export interface StepScroll extends StepBase {
  type: "scroll";
  scrollType: ScrollType;
  selector?: string; // required when toElement
  scrollAmount?: number; // required when byAmount
}

export interface StepSelectOption extends StepBase {
  type: "selectOption";
  selector: string;
  optionValue?: string;
  optionIndex?: number;
}

export interface StepFileUpload extends StepBase {
  type: "fileUpload";
  selector: string;
  filePath: string;
}

export interface StepHover extends StepBase {
  type: "hover";
  selector: string;
}

// Set / define a variable (can reference other variables via {{varName}})
export interface StepSetVariable extends StepBase {
  type: "setVariable";
  variableName: string;
  value: string; // supports {{var}} substitution
}

export type ModifyOp = "set" | "increment" | "decrement" | "append";

export interface StepModifyVariable extends StepBase {
  type: "modifyVariable";
  variableName: string;
  operation: ModifyOp;
  value: string; // supports {{var}} substitution
}

// Union of all supported steps used throughout the app
export type AutomationStep =
  | StepNavigate
  | StepClick
  | StepType
  | StepWait
  | StepScreenshot
  | StepExtract
  | StepExtractWithLogic
  | StepApiCall
  | StepScroll
  | StepSelectOption
  | StepFileUpload
  | StepHover
  | StepSetVariable
  | StepModifyVariable;
// UI meta for step type picker
export const stepTypes = [
  { value: "navigate", label: "Navigate", icon: Globe, description: "Go to a URL" },
  { value: "click", label: "Click", icon: Mouse, description: "Click an element" },
  { value: "type", label: "Type", icon: TypeIcon, description: "Enter text" },
  { value: "selectOption", label: "Select Option", icon: TypeIcon, description: "Select an option from a dropdown" },
  { value: "wait", label: "Wait", icon: Clock, description: "Wait for a duration" },
  { value: "screenshot", label: "Screenshot", icon: Camera, description: "Take a screenshot" },
  { value: "scroll", label: "Scroll", icon: Mouse, description: "Scroll the page or to an element" },
  { value: "setVariable", label: "Set Variable", icon: TypeIcon, description: "Define or update a variable" },
  { value: "modifyVariable", label: "Modify Variable", icon: TypeIcon, description: "Increment / decrement / edit a variable" },
] as const;
