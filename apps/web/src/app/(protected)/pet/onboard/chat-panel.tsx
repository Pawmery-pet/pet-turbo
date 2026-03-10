"use client";

import type { ChatStatus, ToolUIPart, UIMessage } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

interface ChatPanelProps {
  messages: UIMessage[];
  status: ChatStatus;
  sendMessage: (msg: { text: string }) => void;
}

export function ChatPanel({ messages, status, sendMessage }: ChatPanelProps) {
  const lastAgentMessage = messages.findLast((m) => m.role === "assistant");

  const toolParts = messages.flatMap((m) =>
    (m.parts ?? [])
      .filter((p) => p.type?.startsWith("tool-"))
      .map((p, i) => ({ part: p as ToolUIPart, key: `${m.id}-tool-${i}` })),
  );

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="font-semibold text-gray-900">Pet Registration</h2>
        <p className="text-sm text-gray-500">Tell me about your pet</p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-1 items-center justify-center">
          {lastAgentMessage ? (
            <Message className="w-full" from="assistant">
              <MessageContent>
                {lastAgentMessage.parts?.map((part, i) =>
                  part.type === "text" ? (
                    <MessageResponse key={`text-${i}`}>
                      {part.text}
                    </MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ) : (
            <p className="text-sm text-gray-400">
              Starting your pet registration…
            </p>
          )}
        </div>

        {toolParts.length > 0 && (
          <div className="mt-4 space-y-2">
            {toolParts.map(({ part, key }) => (
              <Tool key={key}>
                <ToolHeader
                  type={part.type}
                  state={part.state ?? "output-available"}
                  className="cursor-pointer"
                />
                <ToolContent>
                  <ToolInput input={part.input ?? {}} />
                  <ToolOutput output={part.output} errorText={part.errorText} />
                </ToolContent>
              </Tool>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-3">
        <PromptInput
          onSubmit={({ text }) => {
            if (!text.trim()) return;
            sendMessage({ text });
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Type your answer…"
              disabled={status === "submitted" || status === "streaming"}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
