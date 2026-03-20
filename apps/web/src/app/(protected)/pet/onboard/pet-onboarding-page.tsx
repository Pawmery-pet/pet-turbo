"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMemo, useEffect, useRef } from "react";
import { TypeformPanel } from "./chat-panel";
import { PetPreviewPanel } from "./pet-preview-panel";
import { derivePetState } from "./derive-pet-state";

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

	const state = useMemo(() => derivePetState(messages), [messages]);

	if (state.narrative) {
		return <PetPreviewPanel state={state} />;
	}

	return (
		<div className="flex h-full flex-col">
			<TypeformPanel
				messages={messages}
				sendMessage={sendMessage}
				status={status}
			/>
		</div>
	);
}
