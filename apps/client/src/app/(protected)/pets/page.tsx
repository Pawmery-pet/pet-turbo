import { auth } from "@/auth";
import { petService } from "@/services/petService";
import Link from "next/link";

export default async function PetsPage() {
	const session = await auth();

	// Fetch user's pets from the backend
	let pets: any[] = [];
	let error: string | null = null;
	
	try {
		// Get user ID from session - we need this for the pet service
		const userId = session?.user?.id || session?.user?.email || 'unknown';
		if (userId === 'unknown') {
			throw new Error('No authenticated user found');
		}
		
		const result = await petService.getUserPets(userId);
		pets = result.pets;
	} catch (err) {
		console.error("Failed to fetch pets:", err);
		error = err instanceof Error ? err.message : "Failed to load pets";
	}

	return (
		<div className="px-4 py-6 sm:px-0">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					My Forever Friends
				</h2>
				<p className="text-gray-600">
					Continue the beautiful stories of your beloved pets. Each one holds
					precious memories and an everlasting bond in your heart.
				</p>
			</div>

			<div className="bg-white shadow overflow-hidden sm:rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-lg font-medium text-gray-900">
							Your Pet Stories
						</h3>
						<Link
							href="/pets/create-story"
							className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
						>
							Start a New Story
						</Link>
					</div>

					{error ? (
						<div className="text-center py-12">
							<div className="text-6xl mb-4">😞</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Failed to load pets
							</h3>
							<p className="text-gray-600 mb-6">
								{error}
							</p>
							<button 
								type="button"
								onClick={() => window.location.reload()} 
								className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
							>
								Try Again
							</button>
						</div>
					) : pets.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-6xl mb-4">💝</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No pets yet
							</h3>
							<p className="text-gray-600 mb-6">
								Create your first pet's profile to begin their story and keep
								their precious memories alive forever.
							</p>
							<Link
								href="/pets/create-story"
								className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
							>
								Create Your First Pet
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{pets.map((pet) => (
								<div
									key={pet.id}
									className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex items-center justify-between mb-3">
										<h4 className="text-lg font-semibold text-gray-900">
											{pet.name}
										</h4>
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{pet.species}
										</span>
									</div>
									<div className="space-y-2">
										<p className="text-sm text-gray-600">
											<span className="font-medium">Breed:</span> {pet.breed || 'Unknown'}
										</p>
										{pet.age && (
											<p className="text-sm text-gray-600">
												<span className="font-medium">Age:</span> {pet.age}
											</p>
										)}
										{pet.description && (
											<p className="text-sm text-gray-600 truncate">
												<span className="font-medium">Description:</span> {pet.description}
											</p>
										)}
										<p className="text-xs text-gray-500">
											Created: {new Date(pet.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div className="mt-4 flex space-x-2">
										<Link 
											href={`/pets/${pet.id}`}
											className="text-blue-600 hover:text-blue-800 text-sm font-medium"
										>
											View Profile
										</Link>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
