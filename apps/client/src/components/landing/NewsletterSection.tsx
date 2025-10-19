import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { landingData } from "@/data/landingData";

export function NewsletterSection() {
	const { newsletter } = landingData;
	const [email, setEmail] = useState("");
	const [isSubscribed, setIsSubscribed] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (email) {
			// Handle newsletter subscription here
			setIsSubscribed(true);
			setEmail("");
		}
	};

	return (
		<section className="py-20 bg-gradient-to-br from-orange-400 to-orange-600">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left side - Content */}
					<div className="text-white">
						<h2 className="text-4xl font-bold mb-4">{newsletter.title}</h2>
						<p className="text-xl text-orange-100 mb-8 leading-relaxed">
							{newsletter.subtitle}
						</p>

						{/* Newsletter form */}
						{!isSubscribed ? (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="flex flex-col sm:flex-row gap-4">
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter your email address"
										className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
										required
									/>
									<Button
										type="submit"
										variant="secondary"
										size="lg"
										className="bg-white text-orange-600 hover:bg-orange-50 whitespace-nowrap"
									>
										{newsletter.cta}
									</Button>
								</div>
								<p className="text-sm text-orange-100">
									We respect your privacy. Unsubscribe at any time.
								</p>
							</form>
						) : (
							<div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
								<div className="flex items-center text-white">
									<svg
										className="w-6 h-6 mr-3"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="font-medium">
										Thank you for subscribing!
									</span>
								</div>
								<p className="text-orange-100 mt-2">
									You'll receive our latest updates and pet memory tips.
								</p>
							</div>
						)}

						{/* Benefits */}
						<div className="grid sm:grid-cols-2 gap-4 mt-8">
							<div className="flex items-center text-orange-100">
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
								</svg>
								Weekly memory tips
							</div>
							<div className="flex items-center text-orange-100">
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
										clipRule="evenodd"
									/>
								</svg>
								New features first
							</div>
							<div className="flex items-center text-orange-100">
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
										clipRule="evenodd"
									/>
								</svg>
								Heartwarming stories
							</div>
							<div className="flex items-center text-orange-100">
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
										clipRule="evenodd"
									/>
								</svg>
								Community support
							</div>
						</div>
					</div>

					{/* Right side - Image */}
					<div className="relative">
						<div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
							<Image
								src={newsletter.image}
								alt="Person with pet"
								fill
								className="object-cover"
							/>
							{/* Overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
						</div>

						{/* Floating elements */}
						<div className="absolute -top-6 -right-6 bg-white rounded-full p-4 shadow-xl animate-bounce">
							<span className="text-2xl">💌</span>
						</div>
						<div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								<span className="text-sm font-medium text-gray-700">
									1,200+ subscribers
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
