import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";
import type { ReactNode } from "react";
import { SignOut } from "@/auth/components";

export default async function ProtectedLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getSession();

	if (!session?.user) {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<Link
								href="/dashboard"
								className="text-xl font-semibold text-gray-900 hover:text-blue-600"
							>
								🐾 Pawmery
							</Link>
						</div>
						<nav className="hidden md:flex space-x-8">
							<Link
								href="/dashboard"
								className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
							>
								Dashboard
							</Link>
							<Link
								href="/pets"
								className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
							>
								My Pets
							</Link>
							<Link
								href="/profile"
								className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
							>
								Profile
							</Link>
						</nav>
						<div className="flex items-center space-x-4">
							<span className="text-sm text-gray-700">
								Welcome, {session.user.name || session.user.email}
							</span>
							<SignOut />
						</div>
					</div>
				</div>
			</header>
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
		</div>
	);
}
