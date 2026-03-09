import { getSession } from "@/lib/auth-server";
import Link from "next/link";
import { ChatUI } from "./ChatUI";

function generateThreadId() {
	return `onboard-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default async function OnboardPage() {
	const session = await getSession();
	const userId = session!.user.id;
	const threadId = generateThreadId();

	return (
		<div className="px-4 py-6 sm:px-0 max-w-lg mx-auto">
			<div className="mb-4">
				<Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
					← Back to dashboard
				</Link>
				<h1 className="text-xl font-bold text-gray-900 mt-2">Register your pet</h1>
				<p className="text-sm text-gray-500">Chat with our assistant to get started.</p>
			</div>
			<ChatUI userId={userId} threadId={threadId} />
		</div>
	);
}
