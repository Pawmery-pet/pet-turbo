import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma/client.js';
import { toAuthenticatorResponse } from '../types/auth.js';
import type { CreateAuthenticatorRequest, UpdateAuthenticatorRequest, GetAuthenticatorsQuery } from '../types/auth.js';

export class AuthenticatorController {
  // Create authenticator (WebAuthn)
  static async createAuthenticator(req: Request<{}, {}, CreateAuthenticatorRequest>, res: Response) {
    try {
      const authenticatorData = req.body;

      // Validate required fields
      if (
        !authenticatorData.credentialID ||
        !authenticatorData.userId ||
        !authenticatorData.providerAccountId ||
        !authenticatorData.credentialPublicKey ||
        authenticatorData.counter === undefined ||
        !authenticatorData.credentialDeviceType ||
        authenticatorData.credentialBackedUp === undefined
      ) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'All authenticator fields except transports are required',
          statusCode: 400,
        });
      }

      // Check if authenticator already exists
      const existingAuthenticator = await prisma.authenticator.findUnique({
        where: { credentialID: authenticatorData.credentialID },
      });

      if (existingAuthenticator) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Authenticator already exists',
          statusCode: 409,
        });
      }

      // Create authenticator
      const authenticator = await prisma.authenticator.create({
        data: authenticatorData,
      });

      res.status(201).json(toAuthenticatorResponse(authenticator));
    } catch (error) {
      console.error('Error creating authenticator:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create authenticator',
        statusCode: 500,
      });
    }
  }

  // Get authenticator by credential ID
  static async getAuthenticator(req: Request<{ credentialID: string }>, res: Response) {
    try {
      const { credentialID } = req.params;

      const authenticator = await prisma.authenticator.findUnique({
        where: { credentialID },
      });

      if (!authenticator) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Authenticator not found',
          statusCode: 404,
        });
      }

      res.json(toAuthenticatorResponse(authenticator));
    } catch (error) {
      console.error('Error fetching authenticator:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch authenticator',
        statusCode: 500,
      });
    }
  }

  // List authenticators by user ID
  static async getAuthenticatorsByUserId(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      const authenticators = await prisma.authenticator.findMany({
        where: { userId },
        orderBy: { credentialID: 'asc' },
      });

      res.json(authenticators.map(toAuthenticatorResponse));
    } catch (error) {
      console.error('Error fetching user authenticators:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user authenticators',
        statusCode: 500,
      });
    }
  }

  // Update authenticator counter (used by WebAuthn)
  static async updateAuthenticatorCounter(req: Request<{ credentialID: string }, {}, UpdateAuthenticatorRequest>, res: Response) {
    try {
      const { credentialID } = req.params;
      const { counter } = req.body;

      if (counter === undefined || typeof counter !== 'number') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Counter is required and must be a number',
          statusCode: 400,
        });
      }

      const authenticator = await prisma.authenticator.update({
        where: { credentialID },
        data: { counter },
      });

      res.json(toAuthenticatorResponse(authenticator));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Authenticator not found',
          statusCode: 404,
        });
      }

      console.error('Error updating authenticator counter:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update authenticator counter',
        statusCode: 500,
      });
    }
  }

  // Delete authenticator
  static async deleteAuthenticator(req: Request<{ credentialID: string }>, res: Response) {
    try {
      const { credentialID } = req.params;

      await prisma.authenticator.delete({
        where: { credentialID },
      });

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Authenticator not found',
          statusCode: 404,
        });
      }

      console.error('Error deleting authenticator:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete authenticator',
        statusCode: 500,
      });
    }
  }

  // Get all authenticators (with optional filtering)
  static async getAllAuthenticators(req: Request<{}, {}, {}, GetAuthenticatorsQuery>, res: Response) {
    try {
      const { userId, credentialID } = req.query;

      const where: any = {};
      if (userId) where.userId = userId;
      if (credentialID) where.credentialID = credentialID;

      const authenticators = await prisma.authenticator.findMany({
        where,
        orderBy: { credentialID: 'asc' },
      });

      res.json(authenticators.map(toAuthenticatorResponse));
    } catch (error) {
      console.error('Error fetching authenticators:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch authenticators',
        statusCode: 500,
      });
    }
  }
} 