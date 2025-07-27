import type { Pet } from '@prisma/client';

// API Request types
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

// API Response types
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

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// Query parameters
export interface GetPetsQuery {
  page?: string;
  limit?: string;
  species?: string;
  name?: string;
  userId?: string;  // Filter pets by user ID
}

// Convert Prisma Pet to API response format
export function toPetResponse(pet: Pet): PetResponse {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    color: pet.color,
    userId: pet.userId,
    description: pet.description,
    createdAt: pet.createdAt,
    updatedAt: pet.updatedAt,
  };
}