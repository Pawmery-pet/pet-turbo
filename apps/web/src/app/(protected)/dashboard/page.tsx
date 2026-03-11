import { getSession } from "@/lib/auth-server";
import { PetClient } from "@repo/pet-client";
import Link from "next/link";
import type { Pet } from "@repo/pet-client";
import { redirect } from "next/navigation";

const petClient = new PetClient(
  process.env.PET_SERVICE_URL ?? "http://localhost:3020",
);

function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-xl">
        {pet.type === "dog" ? "🐶" : pet.type === "cat" ? "🐱" : "🐦"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{pet.name}</p>
        <p className="text-sm text-gray-500 capitalize">{pet.breed}</p>
      </div>
      <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-1 rounded-full">
        {pet.status.replace("_", " ")}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🐾</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No pets yet</h2>
      <p className="text-gray-500 mb-6 max-w-xs">
        Register your first pet to get started.
      </p>
      <Link
        href="/pet/onboard"
        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Register a pet
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const userId = session.user.uid;

  const { data: pets } = await petClient.list(userId);

  return (
    <div className="px-4 py-8 sm:px-0">
      {pets.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Pets</h2>
            <Link
              href="/pet/onboard"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Add pet
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
