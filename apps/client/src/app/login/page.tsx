import { redirect } from "next/navigation";
import { SignInWithProvider } from "@/auth/components";
import { getSession } from "@/lib/auth-server";

export default async function LoginPage() {
	const session = await getSession();

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-100 p-8">
				<h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
				<p className="mt-2 text-sm text-gray-600">
					Use your SSO provider to continue.
				</p>
				<div className="mt-6">
					<SignInWithProvider
						providers={[
							{
								providerId: "pawmery-pet",
								name: "Continue with Pawmery",
							},
						]}
					/>
				</div>
			</div>
		</main>
	);
}
