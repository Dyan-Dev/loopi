import type { TelegramMessage } from "@app-types/globals";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { AlertCircle, Bot, CheckCircle2, Loader2, Send, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProviderConfig {
  provider: "openai" | "anthropic" | "ollama" | "claude-code";
  model: string;
  apiKey?: string;
  credentialId?: string;
  baseUrl?: string;
}

interface Props {
  providerConfig: ProviderConfig | null;
}

export function TelegramTab({ providerConfig }: Props) {
  const [connected, setConnected] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if bot is already running
    window.electronAPI?.telegram.status().then((status) => {
      if (status.connected) {
        setConnected(true);
        setBotUsername(status.username ?? null);
      }
      setIsCheckingStatus(false);
    });

    // Listen for incoming messages
    window.electronAPI?.telegram.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.role === "user") {
        setIsProcessing(true);
      } else {
        setIsProcessing(false);
      }
    });

    return () => {
      window.electronAPI?.telegram.removeMessageListener();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConnect = async () => {
    if (!token.trim()) return;
    if (!providerConfig) {
      setError("Connect an AI provider in the Loopi tab first.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    const result = await window.electronAPI!.telegram.connect({
      token: token.trim(),
      providerConfig: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        apiKey: providerConfig.apiKey,
        credentialId: providerConfig.credentialId,
        baseUrl: providerConfig.baseUrl,
      },
    });
    setIsConnecting(false);
    if (result.success) {
      setConnected(true);
      setBotUsername(result.username ?? null);
      setToken("");
    } else {
      setError(result.error ?? "Failed to connect. Check the token and try again.");
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await window.electronAPI?.telegram.disconnect();
    setConnected(false);
    setBotUsername(null);
    setMessages([]);
    setIsDisconnecting(false);
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-[#229ED9]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Connect Telegram</h3>
              <p className="text-xs text-muted-foreground">Chat with Loopi AI from your phone</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            <p className="text-xs font-medium">Setup steps</p>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>
                Open Telegram and search for{" "}
                <span className="font-mono bg-muted px-1 rounded">@BotFather</span>
              </li>
              <li>
                Send <span className="font-mono bg-muted px-1 rounded">/newbot</span> and follow the
                prompts
              </li>
              <li>Copy the bot token BotFather gives you</li>
              <li>Paste it below and click Connect</li>
              <li>Open your new bot in Telegram and start chatting</li>
            </ol>
          </div>

          {!providerConfig && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Connect an AI provider in the <strong>Loopi</strong> tab first — Telegram needs it
                to generate responses.
              </p>
            </div>
          )}

          {/* Token input */}
          <div className="space-y-2">
            <Label className="text-xs">Bot Token</Label>
            <Input
              type="password"
              placeholder="123456789:ABCdefGHI..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              disabled={isConnecting}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={!token.trim() || isConnecting || !providerConfig}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Connected state
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">
            Bot active
            {botUsername && (
              <>
                {" "}
                · <span className="font-mono text-foreground">@{botUsername}</span>
              </>
            )}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disconnect"}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
            <Bot className="h-10 w-10 opacity-20" />
            <div>
              <p className="text-sm font-medium">Waiting for messages</p>
              <p className="text-xs mt-1">
                Open {botUsername ? <span className="font-mono">@{botUsername}</span> : "your bot"}{" "}
                in Telegram and send a message
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "assistant" ? "bg-muted text-foreground" : "bg-[#229ED9] text-white"
                }`}
              >
                {msg.role === "user" && (
                  <p className="text-[10px] font-medium opacity-70 mb-0.5">{msg.senderName}</p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] mt-1 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-3 py-2.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
