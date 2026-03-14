"use client";

import type { ChatStatus, UIMessage } from "ai";
import { useCallback, useEffect, useRef } from "react";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { parseAgentResponse } from "./parse-agent-response";

interface TypeformPanelProps {
	messages: UIMessage[];
	status: ChatStatus;
	sendMessage: (msg: { text: string }) => void;
}

export function TypeformPanel({
	messages,
	status,
	sendMessage,
}: TypeformPanelProps) {
	const lastProgressRef = useRef(0);

	const lastAssistantMessage = messages.findLast((m) => m.role === "assistant");

	const lastTextPart = lastAssistantMessage?.parts
		?.filter((p) => p.type === "text")
		.at(-1);

	const parsed =
		lastTextPart?.type === "text"
			? parseAgentResponse(lastTextPart.text)
			: null;

	if (parsed?.progress !== undefined) {
		lastProgressRef.current = parsed.progress;
	}

	const progress = lastProgressRef.current;
	const questionText = parsed?.message ?? null;

	const isDisabled = status === "submitted" || status === "streaming";

	const lastSettledRef = useRef<string | null>(null);
	if (!isDisabled && questionText) lastSettledRef.current = questionText;
	const displayText = questionText ?? lastSettledRef.current;

	const prevDisabledRef = useRef(false);
	useEffect(() => {
		if (prevDisabledRef.current && !isDisabled) {
			document.querySelector<HTMLTextAreaElement>("textarea")?.focus();
		}
		prevDisabledRef.current = isDisabled;
	}, [isDisabled]);

	const handleSubmit = useCallback(
		({ text }: { text: string }) => {
			if (!text.trim()) return;
			sendMessage({ text });
		},
		[sendMessage],
	);

	return (
		<div className="flex h-full flex-col">
			{/* Progress bar */}
			<div className="h-1 w-full bg-gray-100">
				<div
					className="h-full bg-primary transition-all duration-500"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Scrollable message area */}
			<div className="relative flex flex-1 items-center justify-center overflow-y-auto px-8 py-12">
				{/* Question — fades out when loading, slides in when new content arrives */}
				<p
					key={isDisabled ? (lastSettledRef.current ?? "") : (questionText ?? "")}
					className={`max-w-xl text-center text-2xl font-medium leading-relaxed text-gray-900 ${
						isDisabled
							? "animate-out fade-out slide-out-to-bottom-4 duration-200 fill-mode-forwards"
							: "animate-in fade-in slide-in-from-bottom-4 duration-300"
					}`}
				>
					{displayText ?? (
						<span className="text-gray-400">Starting your pet registration…</span>
					)}
				</p>

				{/* Typing dots — fade in while agent is thinking */}
				{isDisabled && (
					<div className="absolute inset-0 flex items-center justify-center gap-2 animate-in fade-in duration-200">
						<span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
						<span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
						<span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
					</div>
				)}
			</div>

			{/* Pinned input */}
			<div className="mt-auto border-t border-gray-100 p-4">
				<PromptInput
					onSubmit={handleSubmit}
				>
					<PromptInputBody>
						<PromptInputTextarea
							placeholder="Type your answer…"
							disabled={isDisabled}
						/>
					</PromptInputBody>
					<PromptInputFooter>
						<div />
						<PromptInputSubmit
							status={status}
							disabled={isDisabled}
						/>
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	);
}
