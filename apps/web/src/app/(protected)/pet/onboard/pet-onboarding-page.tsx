"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMemo, useState } from "react";

interface PetOnboardingPageProps {
	userId: string;
}

export function PetOnboardingPage({ userId }: PetOnboardingPageProps) {
	const [input, setInput] = useState("");

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/agent/agents/pet-onboarding/stream",
				body: { resourceId: userId },
			}),
		[userId],
	);

	const { messages, status, sendMessage } = useChat({ transport });

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="text-xs text-gray-400">status: {status}</div>
			{messages
				.filter((m) => m.role !== "system")
				.map((m) => (
					<div key={m.id}>
						<strong>{m.role}:</strong>{" "}
						{m.parts?.map((p, i) =>
							p.type === "text" ? <span key={i}>{p.text}</span> : null,
						)}
					</div>
				))}
			<input
				className="border p-2"
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && input.trim()) {
						sendMessage({ text: input });
						setInput("");
					}
				}}
				placeholder="Type a message…"
				value={input}
			/>
		</div>
	);
}
