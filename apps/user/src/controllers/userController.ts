import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma/client.js';
import { toUserResponse } from '../types/user.js';
import type { CreateUserRequest, UpdateUserRequest, GetUsersQuery } from '../types/user.js';

export class UserController {
  // Get all users with pagination and filtering
  static async getAllUsers(req: Request<{}, {}, {}, GetUsersQuery>, res: Response) {
    try {
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const offset = (page - 1) * limit;

      // Build where clause for filtering
      const where: any = {};
      if (req.query.email) {
        where.email = { contains: req.query.email, mode: 'insensitive' };
      }
      if (req.query.name) {
        where.name = { contains: req.query.name, mode: 'insensitive' };
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users: users.map(toUserResponse),
        total,
        page,
        limit,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch users',
        statusCode: 500,
      });
    }
  }

  // Get user by ID
  static async getUserById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }

      res.json(toUserResponse(user));
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user',
        statusCode: 500,
      });
    }
  }

  // Get user by email
  static async getUserByEmail(req: Request<{ email: string }>, res: Response) {
    try {
      const { email } = req.params;

      const user = await prisma.user.findUnique({
        where: { email: decodeURIComponent(email) },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }

      res.json(toUserResponse(user));
    } catch (error) {
      console.error('Error fetching user by email:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user',
        statusCode: 500,
      });
    }
  }

  // Create new user
  static async createUser(req: Request<{}, {}, CreateUserRequest>, res: Response) {
    try {
      const { name, email, image } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email is required',
          statusCode: 400,
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
          statusCode: 409,
        });
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          image,
        },
      });

      res.status(201).json(toUserResponse(user));
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create user',
        statusCode: 500,
      });
    }
  }

  // Update user
  static async updateUser(req: Request<{ id: string }, {}, UpdateUserRequest>, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, image } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }

      // Check if email is being changed and already exists
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          return res.status(409).json({
            error: 'Conflict',
            message: 'User with this email already exists',
            statusCode: 409,
          });
        }
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(image !== undefined && { image }),
        },
      });

      res.json(toUserResponse(user));
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update user',
        statusCode: 500,
      });
    }
  }

  // Delete user
  static async deleteUser(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }

      // Delete user (cascade will handle related records)
      await prisma.user.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete user',
        statusCode: 500,
      });
    }
  }
} 