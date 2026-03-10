"use client";

import { DefaultChatTransport, ToolUIPart } from "ai";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

interface PetOnboardingPageProps {
  userId: string;
}

export function PetOnboardingPage({ userId }: PetOnboardingPageProps) {
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3030/chat/pet-onboarding-agent",
      body: { resourceId: userId },
    }),
  });

  return (
    <div className="relative size-full h-screen w-full p-6">
      <div className="flex h-full flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }

                  if (part.type?.startsWith("tool-")) {
                    return (
                      <Tool key={`${message.id}-${i}`}>
                        <ToolHeader
                          type={(part as ToolUIPart).type}
                          state={
                            (part as ToolUIPart).state || "output-available"
                          }
                          className="cursor-pointer"
                        />
                        <ToolContent>
                          <ToolInput input={(part as ToolUIPart).input || {}} />
                          <ToolOutput
                            output={(part as ToolUIPart).output}
                            errorText={(part as ToolUIPart).errorText}
                          />
                        </ToolContent>
                      </Tool>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
            <ConversationScrollButton />
          </ConversationContent>
        </Conversation>

        <PromptInput
          onSubmit={(message) => {
            sendMessage({ text: message.text });
            setInput("");
          }}
          className="mt-20"
        >
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              className="md:leading-10"
              value={input}
              placeholder="Type your message..."
              disabled={status !== "ready"}
            />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
