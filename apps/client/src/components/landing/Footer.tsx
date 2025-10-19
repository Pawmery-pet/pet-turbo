import Link from "next/link";
import { landingData } from "@/data/landingData";

export function Footer() {
	const { footer } = landingData;

	return (
		<footer className="bg-black text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* Main footer content */}
				<div className="grid lg:grid-cols-4 gap-8">
					{/* Company info */}
					<div className="lg:col-span-1">
						<Link href="/" className="flex items-center space-x-2 mb-4">
							<span className="text-2xl">🐾</span>
							<span className="text-xl font-bold">Pawmery</span>
						</Link>
						<p className="text-gray-400 mb-6 leading-relaxed">
							{footer.description}
						</p>

						{/* Social links */}
						<div className="flex space-x-4">
							{footer.socialLinks.map((social, index) => (
								<Link
									key={index}
									href={social.href}
									className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-200"
									aria-label={social.name}
								>
									<span className="text-lg">{social.icon}</span>
								</Link>
							))}
						</div>
					</div>

					{/* Footer links */}
					{footer.sections.map((section, index) => (
						<div key={index}>
							<h3 className="text-lg font-semibold mb-4">{section.title}</h3>
							<ul className="space-y-3">
								{section.links.map((link, linkIndex) => (
									<li key={linkIndex}>
										<Link
											href={link.href}
											className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
										>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom section */}
				<div className="border-t border-gray-800 mt-12 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="text-gray-400 mb-4 md:mb-0">
							© 2024 Pawmery. All rights reserved.
						</div>

						{/* Additional links */}
						<div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
							<Link
								href="#"
								className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
							>
								Privacy Policy
							</Link>
							<Link
								href="#"
								className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
							>
								Terms of Service
							</Link>
							<Link
								href="#"
								className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
							>
								Cookie Policy
							</Link>
						</div>
					</div>

					{/* Additional info */}
					<div className="text-center mt-8 text-gray-500 text-sm">
						<p>Made with ❤️ for pet lovers everywhere</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
