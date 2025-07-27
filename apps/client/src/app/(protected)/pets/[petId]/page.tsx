import { petService, type PetResponse } from "@/services/petService";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PetDetailPageProps {
	params: Promise<{
		petId: string;
	}>;
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
	const { petId } = await params;

	// Fetch pet data from backend
	let pet: PetResponse | null = null;
	let error: string | null = null;

	try {
		pet = await petService.getPetById(petId);
	} catch (err) {
		if (err instanceof Error && err.message.includes('404')) {
			notFound(); // This will show the 404 page
		}
		console.error("Failed to fetch pet:", err);
		error = err instanceof Error ? err.message : "Failed to load pet";
	}

	if (!pet && !error) {
		notFound();
	}

	// Show error state
	if (error) {
		return (
			<div className="px-4 py-6 sm:px-0">
				<div className="text-center py-12">
					<div className="text-6xl mb-4">😞</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Failed to load pet
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<Link
						href="/pets"
						className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
					>
						Back to Pets
					</Link>
				</div>
			</div>
		);
	}

	if (!pet) {
		return null; // This shouldn't happen due to notFound() above
	}

	const getPetEmoji = (species: string) => {
		switch (species.toLowerCase()) {
			case "dog":
				return "🐕";
			case "cat":
				return "🐱";
			case "bird":
				return "🐦";
			default:
				return "🐾";
		}
	};

	return (
		<div className="px-4 py-6 sm:px-0">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-4 mb-4">
					<Link
						href="/pets"
						className="text-blue-600 hover:text-blue-800 text-sm font-medium"
					>
						← Back to Pets
					</Link>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-6xl">{getPetEmoji(pet.species)}</div>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
						<p className="text-lg text-gray-600">{pet.species} • {pet.breed || 'Unknown breed'}</p>
					</div>
				</div>
			</div>

			{/* Pet Information */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Info */}
				<div className="lg:col-span-2">
					<div className="bg-white shadow rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Pet Information
						</h2>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-sm font-medium text-gray-500 mb-2">Basic Details</h3>
								<div className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-700">Name</dt>
										<dd className="text-sm text-gray-900">{pet.name}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-700">Species</dt>
										<dd className="text-sm text-gray-900">{pet.species}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-700">Breed</dt>
										<dd className="text-sm text-gray-900">{pet.breed || 'Unknown'}</dd>
									</div>
									{pet.age && (
										<div>
											<dt className="text-sm font-medium text-gray-700">Age</dt>
											<dd className="text-sm text-gray-900">{pet.age} years old</dd>
										</div>
									)}
									{pet.color && (
										<div>
											<dt className="text-sm font-medium text-gray-700">Color</dt>
											<dd className="text-sm text-gray-900">{pet.color}</dd>
										</div>
									)}
								</div>
							</div>
							
							<div>
								<h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
								<div className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-700">Created</dt>
										<dd className="text-sm text-gray-900">
											{new Date(pet.createdAt).toLocaleDateString()} at{' '}
											{new Date(pet.createdAt).toLocaleTimeString()}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-700">Last Updated</dt>
										<dd className="text-sm text-gray-900">
											{new Date(pet.updatedAt).toLocaleDateString()} at{' '}
											{new Date(pet.updatedAt).toLocaleTimeString()}
										</dd>
									</div>
								</div>
							</div>
						</div>

						{pet.description && (
							<div className="mt-6">
								<h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
								<p className="text-sm text-gray-900 whitespace-pre-wrap">{pet.description}</p>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="lg:col-span-1">
					<div className="bg-white shadow rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Actions
						</h2>
						
						<div className="space-y-3">
							<Link
								href={`/pets/${pet.id}/edit`}
								className="w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors block"
							>
								Edit Pet
							</Link>
							
							<button
								type="button"
								className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
							>
								Analyze Personality
							</button>
							
							<button
								type="button"
								className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
							>
								Chat with {pet.name}
							</button>
						</div>

						<div className="mt-6 pt-6 border-t border-gray-200">
							<h3 className="text-sm font-medium text-gray-700 mb-2">Pet ID</h3>
							<p className="text-xs text-gray-500 font-mono break-all">{pet.id}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
