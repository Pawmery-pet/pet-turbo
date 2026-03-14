import type {
  CreatePetInput,
  UpdatePetInput,
  Pet,
} from "./types";

export class PetClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, method: string, body?: unknown) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      console.error(
        `PetClient error: ${res.status} ${res.statusText} ${await res.text()}`,
      );
      return {
        success: false,
        message: `PetClient error: ${res.status} ${res.statusText}`,
        data: [],
      } as const;
    }
    const data = (await res.json()) as T;
    return {
      success: true,
      message: "",
      data,
    } as const;
  }

  create(dto: CreatePetInput) {
    return this.request<Pet>("/pet", "POST", dto);
  }

  list(userId: string) {
    return this.request<Pet[]>("/pet/list", "POST", { userId });
  }

  get(id: string, userId: string) {
    return this.request<Pet>(`/pet/${id}`, "POST", { userId });
  }

  update(id: string, dto: UpdatePetInput) {
    return this.request<Pet>(`/pet/${id}`, "PATCH", dto);
  }

  remove(id: string, userId: string) {
    return this.request<void>(`/pet/${id}`, "DELETE", { userId });
  }
}
