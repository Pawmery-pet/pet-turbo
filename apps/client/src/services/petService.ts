// Pet API types matching the backend
export interface CreatePetRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  color?: string;
  userId: string;  // Required: ID of the user who owns this pet
  description?: string;
}

export interface UpdatePetRequest {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  color?: string;
  userId?: string;  // Allow updating the pet's owner
  description?: string;
}

export interface PetResponse {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  color: string | null;
  userId: string;  // ID of the user who owns this pet
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetsListResponse {
  pets: PetResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetPetsQuery {
  page?: number;
  limit?: number;
  species?: string;
  name?: string;
  userId?: string;  // Filter pets by user ID
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

class PetService {
  private baseUrl: string;

  constructor() {
    // Pet service is at localhost:3020
    this.baseUrl = process.env.NEXT_PUBLIC_PET_SERVICE_URL || 'http://localhost:3020';
  }



  /**
   * Make authenticated API request to pet service
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: 'Unknown Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
          };
        }
        throw new Error(`Pet Service Error: ${errorData.message}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Pet Service Request Failed: ${String(error)}`);
    }
  }

  /**
   * Create a new pet for the specified user
   */
  async createPet(userId: string, petData: Omit<CreatePetRequest, 'userId'>): Promise<PetResponse> {
    const createRequest: CreatePetRequest = {
      ...petData,
      userId,
    };

    return this.makeRequest<PetResponse>('/api/pets', {
      method: 'POST',
      body: JSON.stringify(createRequest),
    });
  }

  /**
   * Get all pets with optional filtering
   * If userId is provided, filters by that user, otherwise returns all pets
   */
  async getPets(query: GetPetsQuery = {}): Promise<PetsListResponse> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.species) params.append('species', query.species);
    if (query.name) params.append('name', query.name);
    if (query.userId) params.append('userId', query.userId);

    const queryString = params.toString();
    const endpoint = `/api/pets${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PetsListResponse>(endpoint);
  }

  /**
   * Get pets for a specific user
   */
  async getUserPets(userId: string, query: Omit<GetPetsQuery, 'userId'> = {}): Promise<PetsListResponse> {
    return this.getPets({ ...query, userId });
  }

  /**
   * Get a specific pet by ID
   */
  async getPetById(petId: string): Promise<PetResponse> {
    return this.makeRequest<PetResponse>(`/api/pets/${petId}`);
  }

  /**
   * Update a pet
   */
  async updatePet(petId: string, petData: UpdatePetRequest): Promise<PetResponse> {
    return this.makeRequest<PetResponse>(`/api/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  }

  /**
   * Delete a pet
   */
  async deletePet(petId: string): Promise<void> {
    await this.makeRequest<void>(`/api/pets/${petId}`, {
      method: 'DELETE',
    });
  }


}

// Export a singleton instance
export const petService = new PetService();

// Export the class for testing or custom instances
export { PetService }; 