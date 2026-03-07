import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@/auth/components";

interface HeroSectionProps {
	isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn = false }: HeroSectionProps) {
	return (
		<section className="relative min-h-screen flex flex-col">
			<Image
				src="/hero_background.png"
				alt="Pawmery — your pet's digital companion"
				fill
				className="object-cover"
				priority
			/>

			{/* Dark scrim for text readability */}
			<div className="absolute inset-0 bg-black/30" />

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center">
				<h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
					Your pet.
					<br />
					Your story.
					<br />
					Your companion.
				</h1>

				{isLoggedIn ? (
					<Link
						href="/dashboard"
						className="text-white text-base font-semibold px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
					>
						Go to Dashboard
					</Link>
				) : (
					<SignInButton label="Get Started" />
				)}
			</div>
		</section>
	);
}
