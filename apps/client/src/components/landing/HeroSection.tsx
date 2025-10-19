import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { landingData } from "@/data/landingData";

interface HeroSectionProps {
	isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn = false }: HeroSectionProps) {
	const { hero } = landingData;

	return (
		<section className="relative bg-gradient-to-br from-orange-400 to-orange-600 text-white overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
				<div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-xl"></div>
				<div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-lg"></div>
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left side - Text content */}
					<div className="text-center lg:text-left">
						<h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
							{hero.title}
						</h1>
						<p className="text-xl lg:text-2xl mb-8 text-orange-100 leading-relaxed">
							{hero.subtitle}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<Link href={isLoggedIn ? "/dashboard" : "/login"}>
								<Button
									variant="secondary"
									size="lg"
									className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transform hover:scale-105"
								>
									{isLoggedIn ? "Go to Dashboard" : hero.cta}
								</Button>
							</Link>
						</div>
					</div>

					{/* Right side - Pet images */}
					<div className="relative">
						<div className="grid grid-cols-3 gap-4 items-center">
							{hero.petImages.map((pet, index) => (
								<div
									key={index}
									className={`relative ${
										index === 1
											? "transform scale-110 z-10"
											: "transform scale-90"
									}`}
								>
									<div className="relative w-32 h-32 lg:w-40 lg:h-40 mx-auto">
										<div className="absolute inset-0 bg-white rounded-full shadow-2xl"></div>
										<Image
											src={pet.src}
											alt={pet.alt}
											fill
											className="rounded-full object-cover p-2"
										/>
									</div>
									{/* Floating animation */}
									<div className="absolute inset-0 animate-pulse">
										<div className="w-full h-full rounded-full bg-white opacity-20"></div>
									</div>
								</div>
							))}
						</div>

						{/* Rating badge */}
						<div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-xl">
							<div className="flex items-center space-x-2">
								<span className="text-yellow-400 text-lg">#1 Rated</span>
							</div>
							<div className="text-center text-sm">
								<div className="text-yellow-400">★★★★★</div>
								<div className="text-xs text-gray-300">(10,000+ reviews)</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom wave */}
			<div className="absolute bottom-0 left-0 right-0">
				<svg viewBox="0 0 1200 120" fill="none" className="w-full h-12">
					<path
						d="M0 120L50 105C100 90 200 60 300 45C400 30 500 30 600 37.5C700 45 800 60 900 67.5C1000 75 1100 75 1150 75L1200 75V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
						fill="white"
					/>
				</svg>
			</div>
		</section>
	);
}
