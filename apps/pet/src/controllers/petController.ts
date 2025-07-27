import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { toPetResponse } from '../types/pet.js';
import type { CreatePetRequest, UpdatePetRequest, GetPetsQuery } from '../types/pet.js';

export class PetController {
  // Get all pets with pagination and filtering
  static async getAllPets(req: Request<{}, {}, {}, GetPetsQuery>, res: Response) {
    try {
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const offset = (page - 1) * limit;

      // Build where clause for filtering
      const where: any = {};
      if (req.query.species) {
        where.species = { contains: req.query.species, mode: 'insensitive' };
      }
      if (req.query.name) {
        where.name = { contains: req.query.name, mode: 'insensitive' };
      }
      if (req.query.userId) {
        where.userId = req.query.userId;
      }

      // Get pets with pagination
      const [pets, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.pet.count({ where }),
      ]);

      res.json({
        pets: pets.map(toPetResponse),
        total,
        page,
        limit,
      });
    } catch (error) {
      console.error('Error fetching pets:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch pets',
        statusCode: 500,
      });
    }
  }

  // Get pet by ID
  static async getPetById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const pet = await prisma.pet.findUnique({
        where: { id },
      });

      if (!pet) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Pet not found',
          statusCode: 404,
        });
      }

      res.json(toPetResponse(pet));
    } catch (error) {
      console.error('Error fetching pet:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch pet',
        statusCode: 500,
      });
    }
  }

  // Get pets by user ID
  static async getPetsByUserId(req: Request<{ userId: string }, {}, {}, Omit<GetPetsQuery, 'userId'>>, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const offset = (page - 1) * limit;

      // Build where clause for filtering
      const where: any = { userId };
      if (req.query.species) {
        where.species = { contains: req.query.species, mode: 'insensitive' };
      }
      if (req.query.name) {
        where.name = { contains: req.query.name, mode: 'insensitive' };
      }

      // Get pets with pagination
      const [pets, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.pet.count({ where }),
      ]);

      res.json({
        pets: pets.map(toPetResponse),
        total,
        page,
        limit,
      });
    } catch (error) {
      console.error('Error fetching pets by user ID:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch pets',
        statusCode: 500,
      });
    }
  }

  // Create new pet
  static async createPet(req: Request<{}, {}, CreatePetRequest>, res: Response) {
    try {
      const { name, species, breed, age, color, userId, description } = req.body;

      // Basic validation
      if (!name || !species || !userId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name, species, and userId are required',
          statusCode: 400,
        });
      }

      const pet = await prisma.pet.create({
        data: {
          name,
          species,
          breed,
          age,
          color,
          userId,
          description,
        },
      });

      res.status(201).json(toPetResponse(pet));
    } catch (error) {
      console.error('Error creating pet:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create pet',
        statusCode: 500,
      });
    }
  }

  // Update pet
  static async updatePet(req: Request<{ id: string }, {}, UpdatePetRequest>, res: Response) {
    try {
      const { id } = req.params;
      const { name, species, breed, age, color, userId, description } = req.body;

      // Check if pet exists
      const existingPet = await prisma.pet.findUnique({
        where: { id },
      });

      if (!existingPet) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Pet not found',
          statusCode: 404,
        });
      }

      const pet = await prisma.pet.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(species !== undefined && { species }),
          ...(breed !== undefined && { breed }),
          ...(age !== undefined && { age }),
          ...(color !== undefined && { color }),
          ...(userId !== undefined && { userId }),
          ...(description !== undefined && { description }),
        },
      });

      res.json(toPetResponse(pet));
    } catch (error) {
      console.error('Error updating pet:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update pet',
        statusCode: 500,
      });
    }
  }

  // Delete pet
  static async deletePet(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Check if pet exists
      const existingPet = await prisma.pet.findUnique({
        where: { id },
      });

      if (!existingPet) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Pet not found',
          statusCode: 404,
        });
      }

      await prisma.pet.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting pet:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete pet',
        statusCode: 500,
      });
    }
  }
}