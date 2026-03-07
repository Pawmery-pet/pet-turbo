import Link from "next/link";
import { SignInButton } from "@/auth/components";

interface HeroSectionProps {
	isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn = false }: HeroSectionProps) {
	return (
		<section className="relative min-h-screen flex flex-col">
			{/*
			 * Illustration placeholder — replace this div with:
			 *   <Image src="/illustration-hero.png" fill className="object-cover" alt="Pawmery — your pet's digital companion" priority />
			 * once the asset is ready. Place the file at apps/web/public/illustration-hero.png
			 *
			 * Illustration description for generation:
			 * A warm, painterly scene of a cozy home where pets (dog, cat, maybe a rabbit)
			 * exist in a gently magical digital world — soft glowing UI elements or subtle
			 * light portals around them, warm amber and orange tones, pets looking calm and happy.
			 * Style: soft digital illustration, not cartoonish, slightly dreamy. Full-bleed.
			 */}
			<div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500" />

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
