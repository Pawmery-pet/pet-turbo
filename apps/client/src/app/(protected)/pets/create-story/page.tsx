import { getSession } from "@/lib/auth-server";
import { CreateStoryClient } from "./CreateStoryClient";

export default async function CreateStoryPage() {
	const session = await getSession();

	if (!session?.user) {
		// This shouldn't happen in protected routes, but just in case
		throw new Error("No session found");
	}

	// Ensure we have a valid user ID
	const userId = session.user.id || "unknown";

	return (
		<CreateStoryClient
			session={{
				user: {
					id: userId,
					name: session.user.name,
					email: session.user.email,
					image: session.user.image,
				},
			}}
		/>
	);
}
