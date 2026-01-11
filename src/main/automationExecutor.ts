import { AutomationStep, StepAIAnthropic, StepAIOllama, StepAIOpenAI } from "@app-types/steps";
import { debugLogger } from "@main/debugLogger";
import {
  AiStepHandler,
  ApiCallHandler,
  BrowserStepHandler,
  ConditionalEvaluator,
  DiscordStepHandler,
  TwitterStepHandler,
  VariableManager,
  VariableOperationHandler,
} from "@main/handlers";
import { HeadlessExecutor } from "@main/headlessExecutor";
import { BrowserWindow } from "electron";

/**
 * Handles execution of automation steps in the browser window
 * Delegates step execution to specialized handlers for cleaner code organization
 */
export class AutomationExecutor {
  private variableManager: VariableManager;
  private browserHandler: BrowserStepHandler;
  private apiCallHandler: ApiCallHandler;
  private aiHandler: AiStepHandler;
  private twitterHandler: TwitterStepHandler;
  private discordHandler: DiscordStepHandler;
  private variableOperationHandler: VariableOperationHandler;
  private conditionalEvaluator: ConditionalEvaluator;

  constructor() {
    this.variableManager = new VariableManager();
    this.browserHandler = new BrowserStepHandler();
    this.apiCallHandler = new ApiCallHandler();
    this.aiHandler = new AiStepHandler();
    this.twitterHandler = new TwitterStepHandler();
    this.discordHandler = new DiscordStepHandler();
    this.variableOperationHandler = new VariableOperationHandler();
    this.conditionalEvaluator = new ConditionalEvaluator();
  }

  /**
   * Initialize executor variable context
   */
  initVariables(vars?: Record<string, unknown>) {
    this.variableManager.initVariables(vars);
  }

  /**
   * Expose a shallow copy of current variables (for logging / IPC)
   */
  getVariables(): Record<string, unknown> {
    return this.variableManager.getVariables();
  }

  /**
   * Get a variable value, supporting dot notation and array indexing
   */
  private getVariableValue(path: string): unknown {
    return this.variableManager.getVariableValue(path);
  }

  /**
   * Auto-detect and convert variable value to appropriate type
   */
  private parseValue(input: string): unknown {
    return this.variableManager.parseValue(input);
  }

  /**
   * Replace {{varName}} and {{varName.property}} tokens in a string with current variable values.
   */
  private substituteVariables(input?: string): string {
    return this.variableManager.substituteVariables(input);
  }

  /**
   * Set a variable value
   */
  private setVariable(key: string, value: unknown) {
    this.variableManager.setVariable(key, value);
  }

  /**
   * Get the underlying variables object for passes to handlers
   */
  private getVariablesObject(): Record<string, unknown> {
    return this.variableManager.getVariables();
  }

  /**
   * Executes a single automation step
   * @param browserWindow - The browser window to execute the step in (optional for non-browser steps)
   * @param step - The step configuration object
   */
  async executeStep(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: AutomationStep
  ): Promise<unknown> {
    const startTime = performance.now();

    debugLogger.debug("Step Execution", `Starting ${step.type} step`, {
      stepId: step.id,
      type: step.type,
    });

    try {
      let result: unknown;
      const variables = this.getVariablesObject();

      switch (step.type) {
        // Browser interaction steps
        case "navigate":
          result = await this.browserHandler.executeNavigate(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "click":
          result = await this.browserHandler.executeClick(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "type":
          result = await this.browserHandler.executeType(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "wait":
          result = await this.browserHandler.executeWait(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "screenshot":
          result = await this.browserHandler.executeScreenshot(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "scroll":
          result = await this.browserHandler.executeScroll(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "fileUpload":
          result = await this.browserHandler.executeFileUpload(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "hover":
          result = await this.browserHandler.executeHover(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "selectOption":
          result = await this.browserHandler.executeSelectOption(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this)
          );
          break;

        case "extract":
          result = await this.browserHandler.executeExtract(
            browserWindow,
            headless,
            headlessExecutor,
            step,
            this.substituteVariables.bind(this),
            variables
          );
          break;

        // API Call step
        case "apiCall":
          result = await this.apiCallHandler.executeApiCall(
            step,
            this.substituteVariables.bind(this),
            variables
          );
          break;

        // AI steps
        case "aiOpenAI":
          result = await this.aiHandler.executeAiOpenAI(
            step as StepAIOpenAI,
            this.substituteVariables.bind(this)
          );
          if ((step as StepAIOpenAI).storeKey) {
            variables[(step as StepAIOpenAI).storeKey] = result;
            debugLogger.debug(
              "AI OpenAI",
              `Stored response in variable: ${(step as StepAIOpenAI).storeKey}`
            );
          }
          break;

        case "aiAnthropic":
          result = await this.aiHandler.executeAiAnthropic(
            step as StepAIAnthropic,
            this.substituteVariables.bind(this)
          );
          if ((step as StepAIAnthropic).storeKey) {
            variables[(step as StepAIAnthropic).storeKey] = result;
            debugLogger.debug(
              "AI Anthropic",
              `Stored response in variable: ${(step as StepAIAnthropic).storeKey}`
            );
          }
          break;

        case "aiOllama":
          result = await this.aiHandler.executeAiOllama(
            step as StepAIOllama,
            this.substituteVariables.bind(this)
          );
          if ((step as StepAIOllama).storeKey) {
            variables[(step as StepAIOllama).storeKey] = result;
            debugLogger.debug(
              "AI Ollama",
              `Stored response in variable: ${(step as StepAIOllama).storeKey}`
            );
          }
          break;

        // Discord steps
        case "discordSendMessage":
          result = await this.discordHandler.executeSendMessage(
            step,
            this.substituteVariables.bind(this),
            this.resolveDiscordCredentials.bind(this),
            variables
          );
          break;

        case "discordSendWebhook":
          result = await this.discordHandler.executeSendWebhook(
            step,
            this.substituteVariables.bind(this),
            variables
          );
          break;

        case "discordReactMessage":
          result = await this.discordHandler.executeReactMessage(
            step,
            this.substituteVariables.bind(this),
            this.resolveDiscordCredentials.bind(this)
          );
          break;

        case "discordGetMessage":
          result = await this.discordHandler.executeGetMessage(
            step,
            this.substituteVariables.bind(this),
            this.resolveDiscordCredentials.bind(this),
            variables
          );
          break;

        case "discordListMessages":
          result = await this.discordHandler.executeListMessages(
            step,
            this.substituteVariables.bind(this),
            this.resolveDiscordCredentials.bind(this),
            variables
          );
          break;

        case "discordDeleteMessage":
          result = await this.discordHandler.executeDeleteMessage(
            step,
            this.substituteVariables.bind(this),
            this.resolveDiscordCredentials.bind(this)
          );
          break;

        // Twitter steps
        case "twitterCreateTweet":
          result = await this.twitterHandler.executeCreateTweet(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        case "twitterDeleteTweet":
          result = await this.twitterHandler.executeDeleteTweet(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        case "twitterLikeTweet":
          result = await this.twitterHandler.executeLikeTweet(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        case "twitterRetweet":
          result = await this.twitterHandler.executeRetweet(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        case "twitterSearchTweets":
          result = await this.twitterHandler.executeSearchTweets(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        case "twitterSendDM":
          result = await this.twitterHandler.executeSendDM(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        case "twitterSearchUser":
          result = await this.twitterHandler.executeSearchUser(
            step,
            this.substituteVariables.bind(this),
            this.resolveTwitterCredentials.bind(this),
            variables
          );
          break;

        // Variable modification steps
        case "setVariable":
          result = this.variableOperationHandler.executeSetVariable(
            step,
            this.substituteVariables.bind(this),
            this.parseValue.bind(this),
            variables
          );
          break;

        case "modifyVariable":
          result = this.variableOperationHandler.executeModifyVariable(
            step,
            this.substituteVariables.bind(this),
            this.parseValue.bind(this),
            variables
          );
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      const duration = performance.now() - startTime;
      debugLogger.logOperation(
        "Step Execution",
        `${step.type} step completed successfully`,
        duration
      );
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      debugLogger.error(
        "Step Execution",
        `${step.type} step failed after ${duration.toFixed(2)}ms`,
        error
      );
      throw error;
    }
  }

  /**
   * Evaluates a browser conditional node (elementExists or valueMatches)
   * Delegates to ConditionalEvaluator
   */
  async evaluateBrowserConditional(
    browserWindow: BrowserWindow | undefined,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    config: {
      browserConditionType?: string;
      selector?: string;
      expectedValue?: string;
      nodeId?: string;
      condition?: string;
      transformType?: string;
      transformPattern?: string;
      transformReplace?: string;
      transformChars?: string;
      parseAsNumber?: boolean;
    }
  ): Promise<{
    conditionResult: boolean;
    effectiveSelector?: string | null;
  }> {
    return this.conditionalEvaluator.evaluateBrowserConditional(
      browserWindow,
      headless,
      headlessExecutor,
      config,
      this.substituteVariables.bind(this)
    );
  }

  /**
   * Evaluates a variable conditional node (variable-based conditions)
   * Delegates to ConditionalEvaluator
   */
  evaluateVariableConditional(config: {
    variableConditionType?: string;
    variableName?: string;
    expectedValue?: string;
    parseAsNumber?: boolean;
  }): {
    conditionResult: boolean;
  } {
    return this.conditionalEvaluator.evaluateVariableConditional(
      config,
      this.substituteVariables.bind(this),
      this.getVariableValue.bind(this)
    );
  }

  /**
   * Resolve Twitter credentials from either credentialId or direct fields
   * Delegates to TwitterStepHandler
   */
  private resolveTwitterCredentials(step: {
    credentialId?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
  }): Promise<{
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
  }> {
    return TwitterStepHandler.resolveTwitterCredentials(step);
  }

  /**
   * Resolve Discord credentials from store or direct fields
   * Delegates to DiscordStepHandler
   */
  private resolveDiscordCredentials(step: {
    credentialId?: string;
    botToken?: string;
  }): Promise<{ botToken: string }> {
    return DiscordStepHandler.resolveDiscordCredentials(step);
  }
}
