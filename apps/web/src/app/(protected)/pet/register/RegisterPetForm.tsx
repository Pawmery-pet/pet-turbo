"use client";

import { useState } from "react";
import type { PetType } from "@repo/pet-client";

const PET_TYPES: { value: PetType; label: string; emoji: string }[] = [
	{ value: "dog", label: "Dog", emoji: "🐶" },
	{ value: "cat", label: "Cat", emoji: "🐱" },
	{ value: "bird", label: "Bird", emoji: "🐦" },
];

interface RegisterPetFormProps {
	onRegister: (data: { name: string; type: PetType; breed: string }) => Promise<void>;
}

export function RegisterPetForm({ onRegister }: RegisterPetFormProps) {
	const [type, setType] = useState<PetType>("dog");
	const [name, setName] = useState("");
	const [breed, setBreed] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			await onRegister({ name, type, breed });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* Pet type */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Type
				</label>
				<div className="flex gap-3">
					{PET_TYPES.map(({ value, label, emoji }) => (
						<button
							key={value}
							type="button"
							onClick={() => setType(value)}
							className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
								type === value
									? "border-orange-500 bg-orange-50 text-orange-600"
									: "border-gray-200 text-gray-500 hover:border-gray-300"
							}`}
						>
							<span className="text-2xl">{emoji}</span>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Name */}
			<div>
				<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
					Name
				</label>
				<input
					id="name"
					type="text"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Buddy"
					className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
				/>
			</div>

			{/* Breed */}
			<div>
				<label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1.5">
					Breed
				</label>
				<input
					id="breed"
					type="text"
					required
					value={breed}
					onChange={(e) => setBreed(e.target.value)}
					placeholder="e.g. Golden Retriever"
					className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
				/>
			</div>

			{error && (
				<p className="text-sm text-red-600">{error}</p>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
			>
				{isSubmitting ? "Registering..." : "Register pet"}
			</button>
		</form>
	);
}
