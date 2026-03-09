import { getSession } from "@/lib/auth-server";

const BORDER_COLLIE_URL = process.env.BORDER_COLLIE_URL ?? "http://localhost:3030";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const session = await getSession();
	if (!session?.user?.id) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const raw = await req.text();

	let finalBody = raw;
	try {
		const parsed = JSON.parse(raw);
		// Always override resourceId from session — never trust the client
		parsed.resourceId = session.user.id;

		if (Array.isArray(parsed.messages)) {
			const alreadyInjected = parsed.messages.some(
				(m: { id?: string }) => m.id === "system-userid",
			);
			if (!alreadyInjected) {
				parsed.messages = [
					{
						id: "system-userid",
						role: "system",
						content: `[SYSTEM] userId: ${parsed.resourceId}`,
					},
					...parsed.messages,
				];
			}
		}
		finalBody = JSON.stringify(parsed);
	} catch {
		// not JSON, forward as-is
	}

	const res = await fetch(upstream, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: finalBody,
	});

	return new Response(res.body, {
		status: res.status,
		headers: {
			"Content-Type": res.headers.get("Content-Type") ?? "application/json",
		},
	});
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const session = await getSession();
	if (!session?.user?.id) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const res = await fetch(upstream);

	return new Response(res.body, {
		status: res.status,
		headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
	});
}
