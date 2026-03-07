"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface HeaderProps {
	isLoggedIn?: boolean;
	userEmail?: string;
}

export function Header({ isLoggedIn = false, userEmail }: HeaderProps) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const signIn = async () => {
		try {
			await authClient.signIn.oauth2({
				providerId: "pawmery-pet",
				callbackURL: "/dashboard",
			});
		} catch (error) {
			console.error("Sign in failed:", error);
		}
	};

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
				scrolled ? "bg-[#111111]" : "bg-transparent"
			}`}
		>
			<div className="max-w-7xl mx-auto px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo placeholder — replace with <Image src="/logo.svg"> when asset is ready */}
					<Link href="/" className="flex items-center gap-2">
						<span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
							P
						</span>
						<span className="text-xl font-bold text-white">Pawmery</span>
					</Link>

					<nav className="flex items-center gap-3">
						{isLoggedIn ? (
							<>
								<span className="text-sm text-gray-300 hidden sm:block">
									{userEmail}
								</span>
								<Link
									href="/dashboard"
									className="text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/50 hover:border-white hover:bg-white/10 transition-all"
								>
									Dashboard
								</Link>
							</>
						) : (
							<>
								<button
									type="button"
									onClick={signIn}
									className="text-white text-sm font-medium px-4 py-2 rounded-lg border border-white hover:bg-white/10 transition-all"
								>
									Sign in
								</button>
								<button
									type="button"
									onClick={signIn}
									className="text-white text-sm font-semibold px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-all"
								>
									Sign up
								</button>
							</>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
