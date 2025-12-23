/**
 * Types for conditional node evaluation in the AutomationExecutor
 */

export interface ConditionalConfig {
  conditionType: "elementExists" | "valueMatches";
  selector: string;
  expectedValue?: string;
  nodeId?: string;
  condition?: "equals" | "contains" | "greaterThan" | "lessThan";
  transformType?: "none" | "stripCurrency" | "stripNonNumeric" | "removeChars" | "regexReplace";
  transformPattern?: string;
  transformReplace?: string;
  transformChars?: string;
  parseAsNumber?: boolean;
}

export interface ConditionalResult {
  conditionResult: boolean;
  effectiveSelector?: string | null;
}
