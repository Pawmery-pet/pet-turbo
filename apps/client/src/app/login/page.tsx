import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
	const session = await getSession();

	// If already logged in, redirect to dashboard
	if (session?.user) {
		redirect("/dashboard");
	}

	async function handleOIDCLogin() {
		"use server";
		// Redirect to better-auth OAuth flow
		const data = await auth.api.signInWithOAuth2({ 
			body: {
				providerId: "pawmery-pet",
				callbackURL: "/dashboard"
			}
		})
		console.log(data)
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">🐾 Pawmery</h1>
					<h2 className="text-2xl font-bold text-gray-900">
						Begin Your Journey
					</h2>
					<p className="mt-2 text-gray-600">
						Continue the story with your beloved pet and keep their spirit alive
						in your heart
					</p>
				</div>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<div className="space-y-6">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-6">
								Sign in with your identity provider to start honoring your pet's
								memory
							</p>

							<form action={handleOIDCLogin}>
								<button
									type="submit"
									className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
								>
									Continue with Pawmery Pet
								</button>
							</form>
						</div>

						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">
										New to Pawmery?
									</span>
								</div>
							</div>

							<div className="mt-6 text-center">
								<p className="text-sm text-gray-600">
									A loving space to honor your pet's memory and keep your
									beautiful bond alive.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8 text-center">
					<Link
						href="/"
						className="text-blue-600 hover:text-blue-800 text-sm font-medium"
					>
						← Back to home
					</Link>
				</div>
			</div>
		</div>
	);
}
