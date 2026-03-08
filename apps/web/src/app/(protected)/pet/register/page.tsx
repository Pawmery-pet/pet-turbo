import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { PetClient } from "@repo/pet-client";
import type { PetType } from "@repo/pet-client";
import { RegisterPetForm } from "./RegisterPetForm";
import Link from "next/link";

const petClient = new PetClient(
	process.env.PET_SERVICE_URL ?? "http://localhost:3020",
);

export default async function RegisterPetPage() {
	const session = await getSession();
	const userId = session!.user.id;

	async function registerPet(data: { name: string; type: PetType; breed: string }) {
		"use server";
		await petClient.create({ userId, ...data });
		redirect("/dashboard");
	}

	return (
		<div className="px-4 py-8 sm:px-0 max-w-md mx-auto">
			<div className="mb-6">
				<Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
					← Back
				</Link>
				<h1 className="text-2xl font-bold text-gray-900 mt-3">Register a pet</h1>
			</div>
			<RegisterPetForm onRegister={registerPet} />
		</div>
	);
}
