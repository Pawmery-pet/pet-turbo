"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMemo, useEffect, useRef } from "react";
import { ChatPanel } from "./chat-panel";

interface PetOnboardingPageProps {
  userId: string;
}

export function PetOnboardingPage({ userId }: PetOnboardingPageProps) {
  const initiated = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "http://localhost:3030/chat/pet-onboarding-agent",
        body: { resourceId: userId },
      }),
    [userId],
  );

  const { messages, status, sendMessage } = useChat({ transport });

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;
    sendMessage({
      text: `My user id is ${userId}, Start the conversation please`,
    });
  }, [sendMessage]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 p-6">
      <div className="flex w-1/2 flex-col">
        <ChatPanel
          messages={messages}
          sendMessage={sendMessage}
          status={status}
        />
      </div>
      <div className="w-1/2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
        Preview panel coming soon
      </div>
    </div>
  );
}
