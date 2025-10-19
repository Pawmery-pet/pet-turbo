import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { landingData } from "@/data/landingData";

export function ServicesSection() {
	const { services } = landingData;

	return (
		<section className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						What We Offer
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Comprehensive tools and services to help you preserve, celebrate,
						and continue the bond with your beloved pets
					</p>
				</div>

				{/* Services list */}
				<div className="space-y-16">
					{services.map((service, index) => (
						<div
							key={index}
							className={`grid lg:grid-cols-2 gap-12 items-center ${
								index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
							}`}
						>
							{/* Image */}
							<div
								className={`relative ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
							>
								<div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
									<Image
										src={service.image}
										alt={service.title}
										fill
										className="object-cover"
									/>
									{/* Overlay gradient */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
								</div>

								{/* Floating card */}
								<div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-orange-100">
									<div className="flex items-center space-x-2">
										<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
										<span className="text-sm font-medium text-gray-700">
											Available Now
										</span>
									</div>
								</div>
							</div>

							{/* Content */}
							<div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
								<div className="flex items-center mb-4">
									<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
										<span className="text-orange-600 text-xl font-bold">
											{index + 1}
										</span>
									</div>
									<div className="h-px bg-orange-200 flex-1"></div>
								</div>

								<h3 className="text-3xl font-bold text-gray-900 mb-4">
									{service.title}
								</h3>
								<p className="text-lg text-gray-600 mb-8 leading-relaxed">
									{service.description}
								</p>

								{/* Features list */}
								<ul className="space-y-3 mb-8">
									<li className="flex items-center text-gray-700">
										<svg
											className="w-5 h-5 text-orange-500 mr-3"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Easy to use interface
									</li>
									<li className="flex items-center text-gray-700">
										<svg
											className="w-5 h-5 text-orange-500 mr-3"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Personalized experience
									</li>
									<li className="flex items-center text-gray-700">
										<svg
											className="w-5 h-5 text-orange-500 mr-3"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Secure and private
									</li>
								</ul>

								<Link href={service.href}>
									<Button size="lg" className="group">
										{service.cta}
										<svg
											className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</Button>
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
