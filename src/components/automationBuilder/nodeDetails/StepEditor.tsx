/**
 * StepEditor - Dynamic editor for automation step configuration
 *
 * Routes to appropriate step-specific editor based on step type.
 * Each step type has its own component with custom fields and validation.
 */
import type { ReactFlowNode } from "@app-types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  ApiCallStep,
  ClickStep,
  DiscordDeleteMessageStep,
  DiscordGetMessageStep,
  DiscordListMessagesStep,
  DiscordReactStep,
  DiscordSendMessageStep,
  DiscordSendWebhookStep,
  ExtractStep,
  ModifyVariableStep,
  NavigateStep,
  ScreenshotStep,
  ScrollStep,
  SelectOptionStep,
  SetVariableStep,
  TwitterCreateTweetStep,
  TwitterDeleteTweetStep,
  TwitterLikeTweetStep,
  TwitterRetweetStep,
  TwitterSearchTweetsStep,
  TwitterSearchUserStep,
  TwitterSendDMStep,
  TypeStep,
  WaitStep,
} from "./stepTypes";

export default function StepEditor({
  node,
  onUpdate,
  onPickWithSetter,
}: {
  node: ReactFlowNode;
  onUpdate: (
    id: string,
    type: "update",
    updates?: import("./stepTypes/types").UpdatePayload
  ) => void;
  onPickWithSetter: (
    setter: (s: string) => void,
    strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"
  ) => Promise<void>;
}) {
  const { data, id } = node;
  const { step } = data;

  const renderStepType = () => {
    switch (step.type) {
      case "navigate":
        return <NavigateStep step={step} id={id} onUpdate={onUpdate} />;
      case "click":
        return (
          <ClickStep step={step} id={id} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />
        );
      case "type":
        return (
          <TypeStep step={step} id={id} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />
        );
      case "selectOption":
        return (
          <SelectOptionStep
            step={step}
            id={id}
            onUpdate={onUpdate}
            onPickWithSetter={onPickWithSetter}
          />
        );
      case "extract":
        return (
          <ExtractStep
            step={step}
            id={id}
            onUpdate={onUpdate}
            onPickWithSetter={onPickWithSetter}
          />
        );
      case "wait":
        return <WaitStep step={step} id={id} onUpdate={onUpdate} />;
      case "screenshot":
        return <ScreenshotStep step={step} id={id} onUpdate={onUpdate} />;
      case "scroll":
        return (
          <ScrollStep step={step} id={id} onUpdate={onUpdate} onPickWithSetter={onPickWithSetter} />
        );
      case "apiCall":
        return <ApiCallStep step={step} id={id} onUpdate={onUpdate} />;
      case "discordSendMessage":
        return <DiscordSendMessageStep step={step} id={id} onUpdate={onUpdate} />;
      case "discordSendWebhook":
        return <DiscordSendWebhookStep step={step} id={id} onUpdate={onUpdate} />;
      case "discordReactMessage":
        return <DiscordReactStep step={step} id={id} onUpdate={onUpdate} />;
      case "discordGetMessage":
        return <DiscordGetMessageStep step={step} id={id} onUpdate={onUpdate} />;
      case "discordListMessages":
        return <DiscordListMessagesStep step={step} id={id} onUpdate={onUpdate} />;
      case "discordDeleteMessage":
        return <DiscordDeleteMessageStep step={step} id={id} onUpdate={onUpdate} />;
      case "modifyVariable":
        return <ModifyVariableStep step={step} id={id} onUpdate={onUpdate} />;
      case "setVariable":
        return <SetVariableStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterCreateTweet":
        return <TwitterCreateTweetStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterDeleteTweet":
        return <TwitterDeleteTweetStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterLikeTweet":
        return <TwitterLikeTweetStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterRetweet":
        return <TwitterRetweetStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterSearchTweets":
        return <TwitterSearchTweetsStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterSendDM":
        return <TwitterSendDMStep step={step} id={id} onUpdate={onUpdate} />;
      case "twitterSearchUser":
        return <TwitterSearchUserStep step={step} id={id} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Input
          value={step.description || ""}
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, description: e.target.value } })
          }
          className="text-xs"
          placeholder="Step description"
        />
      </div>

      {renderStepType()}
    </>
  );
}
