import Image from "next/image";
import { useState } from "react";
import { landingData } from "@/data/landingData";

export function PetTypesSection() {
	const { petTypes } = landingData;
	const [currentIndex, setCurrentIndex] = useState(0);

	return (
		<section className="py-20 bg-orange-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						Popular Pet Types
					</h2>
					<p className="text-xl text-gray-600">
						We support all kinds of beloved companions
					</p>
				</div>

				{/* Pet types grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					{petTypes.map((petType, index) => (
						<div
							key={index}
							className="text-center group cursor-pointer"
							onClick={() => setCurrentIndex(index)}
						>
							{/* Pet image */}
							<div className="relative w-32 h-32 mx-auto mb-4">
								<div
									className={`absolute inset-0 rounded-full transition-all duration-300 ${
										currentIndex === index
											? "bg-orange-500 shadow-xl scale-105"
											: "bg-white shadow-lg group-hover:shadow-xl group-hover:scale-105"
									}`}
								></div>
								<div className="relative w-full h-full p-2">
									<Image
										src={petType.image}
										alt={petType.alt}
										fill
										className="rounded-full object-cover"
									/>
								</div>
							</div>

							{/* Pet name */}
							<h3
								className={`font-semibold text-lg transition-colors duration-200 ${
									currentIndex === index ? "text-orange-600" : "text-gray-900"
								}`}
							>
								{petType.name}
							</h3>
						</div>
					))}
				</div>

				{/* Navigation dots */}
				<div className="flex justify-center space-x-2">
					{petTypes.map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentIndex(index)}
							className={`w-3 h-3 rounded-full transition-all duration-200 ${
								currentIndex === index
									? "bg-orange-500 scale-125"
									: "bg-gray-300 hover:bg-gray-400"
							}`}
						/>
					))}
				</div>

				{/* Current pet type info */}
				<div className="text-center mt-8">
					<div className="inline-block bg-white rounded-lg px-6 py-4 shadow-md">
						<p className="text-gray-600">
							Currently viewing:{" "}
							<span className="font-semibold text-orange-600">
								{petTypes[currentIndex].name}
							</span>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
