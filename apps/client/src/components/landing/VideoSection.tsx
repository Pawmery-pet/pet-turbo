import Image from "next/image";
import { useState } from "react";
import { landingData } from "@/data/landingData";

export function VideoSection() {
	const { video } = landingData;
	const [isPlaying, setIsPlaying] = useState(false);

	return (
		<section className="py-20 bg-white">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						{video.title}
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						{video.subtitle}
					</p>
				</div>

				{/* Video container */}
				<div className="relative">
					<div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
						<Image
							src={video.thumbnail}
							alt="Pawmery Demo Video"
							fill
							className="object-cover"
						/>

						{/* Play button overlay */}
						{!isPlaying && (
							<div
								className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group cursor-pointer"
								onClick={() => setIsPlaying(true)}
							>
								<div className="bg-orange-500 rounded-full p-6 group-hover:bg-orange-600 transition-colors duration-200 group-hover:scale-110 transform">
									<svg
										className="w-12 h-12 text-white ml-1"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M8 5v14l11-7z" />
									</svg>
								</div>
							</div>
						)}

						{/* Video placeholder when playing */}
						{isPlaying && (
							<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
								<div className="text-center text-white">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
									<p>Video would play here...</p>
									<button
										onClick={() => setIsPlaying(false)}
										className="mt-4 text-orange-400 hover:text-orange-300"
									>
										← Back to thumbnail
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Stats below video */}
					<div className="text-center mt-8">
						<div className="inline-flex items-center bg-gray-50 rounded-full px-6 py-3 shadow-md">
							<div className="text-yellow-500 mr-2">★★★★★</div>
							<span className="text-gray-700 font-medium">{video.stats}</span>
						</div>
					</div>
				</div>

				{/* Additional info */}
				<div className="grid md:grid-cols-3 gap-8 mt-16">
					<div className="text-center">
						<div className="text-3xl mb-4">⏱️</div>
						<h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
						<p className="text-gray-600">Get started in just 5 minutes</p>
					</div>
					<div className="text-center">
						<div className="text-3xl mb-4">🔒</div>
						<h3 className="font-semibold text-gray-900 mb-2">
							Private & Secure
						</h3>
						<p className="text-gray-600">Your memories are safely protected</p>
					</div>
					<div className="text-center">
						<div className="text-3xl mb-4">💝</div>
						<h3 className="font-semibold text-gray-900 mb-2">
							Forever Memories
						</h3>
						<p className="text-gray-600">Keep their spirit alive always</p>
					</div>
				</div>
			</div>
		</section>
	);
}
