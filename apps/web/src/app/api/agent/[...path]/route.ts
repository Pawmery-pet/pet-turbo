const BORDER_COLLIE_URL = process.env.BORDER_COLLIE_URL ?? "http://localhost:3030";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const body = await req.text();

	const res = await fetch(upstream, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body,
	});

	return new Response(res.body, {
		status: res.status,
		headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
	});
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const res = await fetch(upstream);

	return new Response(res.body, {
		status: res.status,
		headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
	});
}
