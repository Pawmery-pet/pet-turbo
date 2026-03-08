import type { CreatePetInput, UpdatePetInput, Pet, PetProfile, CreatePetProfileInput } from "./types";

export class PetClient {
	constructor(private readonly baseUrl: string) {}

	private async request<T>(path: string, method: string, body?: unknown): Promise<T> {
		const res = await fetch(`${this.baseUrl}${path}`, {
			method,
			headers: { "Content-Type": "application/json" },
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
		if (!res.ok) {
			throw new Error(`PetClient error: ${res.status} ${res.statusText}`);
		}
		return res.json() as Promise<T>;
	}

	create(dto: CreatePetInput): Promise<Pet> {
		return this.request<Pet>("/pet", "POST", dto);
	}

	list(userId: string): Promise<Pet[]> {
		return this.request<Pet[]>("/pet/list", "POST", { userId });
	}

	get(id: string, userId: string): Promise<Pet> {
		return this.request<Pet>(`/pet/${id}`, "POST", { userId });
	}

	update(id: string, dto: UpdatePetInput): Promise<Pet> {
		return this.request<Pet>(`/pet/${id}`, "PATCH", dto);
	}

	remove(id: string, userId: string): Promise<void> {
		return this.request<void>(`/pet/${id}`, "DELETE", { userId });
	}

	createProfile(petId: string, dto: CreatePetProfileInput): Promise<PetProfile> {
		return this.request<PetProfile>(`/pet/${petId}/profile`, "POST", dto);
	}

	getProfile(petId: string): Promise<PetProfile> {
		return this.request<PetProfile>(`/pet/${petId}/profile`, "GET");
	}

	getProfileHistory(petId: string): Promise<PetProfile[]> {
		return this.request<PetProfile[]>(`/pet/${petId}/profile/history`, "GET");
	}
}
