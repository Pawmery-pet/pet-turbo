"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignInWithProvider({
	providers,
}: {
	providers: {
		providerId: string;
		name: string;
	}[];
}) {
	const [isLoading, setIsLoading] = useState(false);
	return (
		<div className="flex flex-col gap-4">
			{providers.map(({ providerId, name }) => (
				<Button
					key={providerId}
					type="submit"
					onClick={async () => {
						setIsLoading(true);
						await authClient.signIn.oauth2({
							providerId,
							callbackURL: "/dashboard",
						});
						setIsLoading(false);
					}}
				>
					{isLoading ? "Signing in..." : name}
				</Button>
			))}
		</div>
	);
}

export function SignOut() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	return (
		<button
			type="submit"
			className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
			onClick={() => {
				setIsLoading(true);
				authClient.signOut({
					fetchOptions: {
						onSuccess: () => {
							router.push("/");
						},
					},
				});
				setIsLoading(false);
			}}
		>
			{isLoading ? "Signing out..." : "Sign out"}
		</button>
	);
}

export function SignInButton({ label = "Get Started" }: { label?: string }) {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<button
			type="button"
			disabled={isLoading}
			aria-busy={isLoading}
			onClick={async () => {
				setIsLoading(true);
				try {
					await authClient.signIn.oauth2({
						providerId: "pawmery-pet",
						callbackURL: "/dashboard",
					});
				} catch (error) {
					console.error("Sign in failed:", error);
				} finally {
					setIsLoading(false);
				}
			}}
			className="text-white text-base font-semibold px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
		>
			{isLoading ? "Signing in..." : label}
		</button>
	);
}
