import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json' assert { type: 'json' };

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: version,
      description: 'A comprehensive User CRUD service with Prisma and MongoDB integration',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3010',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'MongoDB ObjectId',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              nullable: true,
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              nullable: true,
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            emailVerified: {
              type: 'string',
              nullable: true,
              format: 'date-time',
              description: 'Email verification timestamp',
              example: '2024-01-15T10:30:00Z',
            },
            image: {
              type: 'string',
              nullable: true,
              format: 'uri',
              description: 'User profile image URL',
              example: 'https://example.com/avatar.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['id', 'createdAt', 'updatedAt'],
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'User profile image URL',
              example: 'https://example.com/avatar.jpg',
            },
          },
          required: ['email'],
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'User profile image URL',
              example: 'https://example.com/avatar.jpg',
            },
          },
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
            },
            total: {
              type: 'integer',
              description: 'Total number of users',
              example: 150,
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Number of users per page',
              example: 10,
            },
          },
          required: ['users', 'total', 'page', 'limit'],
        },
        ApiErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Email is required',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
              example: 400,
            },
          },
          required: ['error', 'message', 'statusCode'],
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'error'],
              description: 'Health status',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp',
              example: '2024-01-15T10:30:00Z',
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected'],
              description: 'Database connection status',
              example: 'connected',
            },
          },
          required: ['status', 'timestamp', 'database'],
        },
      },
      parameters: {
        UserId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID (MongoDB ObjectId)',
          schema: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$',
            example: '507f1f77bcf86cd799439011',
          },
        },
        UserEmail: {
          name: 'email',
          in: 'path',
          required: true,
          description: 'User email address (URL encoded)',
          schema: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
        },
        PageQuery: {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1,
          },
        },
        LimitQuery: {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            example: 10,
          },
        },
        EmailQuery: {
          name: 'email',
          in: 'query',
          required: false,
          description: 'Filter users by email (partial match)',
          schema: {
            type: 'string',
            example: 'john',
          },
        },
        NameQuery: {
          name: 'name',
          in: 'query',
          required: false,
          description: 'Filter users by name (partial match)',
          schema: {
            type: 'string',
            example: 'John',
          },
        },
      },
    },
    tags: [
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Health',
        description: 'API health and status checks',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/app.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions); 