"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface ChatUIProps {
	userId: string;
	threadId: string;
}

export function ChatUI({ userId, threadId }: ChatUIProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		sendMessage(`My user ID is ${userId}. Hello, I'd like to register my pet.`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	async function sendMessage(text: string) {
		const newMessages: Message[] = [...messages, { role: "user", content: text }];
		setMessages(newMessages);
		setInput("");
		setLoading(true);
		try {
			const res = await fetch("/api/agent/agents/pet-onboarding/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: newMessages,
					threadId,
					resourceId: userId,
				}),
			});
			const data = await res.json() as { text?: string; error?: string };
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: data.text ?? "Sorry, something went wrong." },
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)]">
			<div className="flex-1 overflow-y-auto space-y-4 pb-4">
				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
								msg.role === "user"
									? "bg-orange-500 text-white rounded-br-sm"
									: "bg-gray-100 text-gray-900 rounded-bl-sm"
							}`}
						>
							{msg.content}
						</div>
					</div>
				))}
				{loading && (
					<div className="flex justify-start">
						<div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-400">
							Thinking…
						</div>
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (input.trim()) sendMessage(input.trim());
				}}
				className="flex gap-2 pt-3 border-t border-gray-100"
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type a message…"
					disabled={loading}
					className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={loading || !input.trim()}
					className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
				>
					Send
				</button>
			</form>
		</div>
	);
}
