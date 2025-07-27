import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Pet Service API",
			version: "1.0.0",
			description: "A simple CRUD API for managing pets associated with users",
		},
		servers: [
			{
				url: "http://localhost:3020",
				description: "Development server",
			},
		],
		components: {
			schemas: {
				Pet: {
					type: "object",
					required: ["name", "species", "userId"],
					properties: {
						id: {
							type: "string",
							description: "Pet ID",
							example: "507f1f77bcf86cd799439011",
						},
						name: {
							type: "string",
							description: "Pet name",
							example: "Buddy",
						},
						species: {
							type: "string",
							description: "Pet species",
							example: "dog",
						},
						breed: {
							type: "string",
							description: "Pet breed",
							example: "Golden Retriever",
						},
						age: {
							type: "integer",
							description: "Pet age in years",
							example: 3,
						},
						color: {
							type: "string",
							description: "Pet color",
							example: "Golden",
						},
						userId: {
							type: "string",
							description: "ID of the user who owns this pet",
							example: "507f1f77bcf86cd799439012",
						},
						description: {
							type: "string",
							description: "Pet description",
							example: "A friendly and energetic dog",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Creation timestamp",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "Last update timestamp",
						},
					},
				},
				CreatePetRequest: {
					type: "object",
					required: ["name", "species", "userId"],
					properties: {
						name: {
							type: "string",
							description: "Pet name",
							example: "Buddy",
						},
						species: {
							type: "string",
							description: "Pet species",
							example: "dog",
						},
						breed: {
							type: "string",
							description: "Pet breed",
							example: "Golden Retriever",
						},
						age: {
							type: "integer",
							description: "Pet age in years",
							example: 3,
						},
						color: {
							type: "string",
							description: "Pet color",
							example: "Golden",
						},
						userId: {
							type: "string",
							description: "ID of the user who owns this pet",
							example: "507f1f77bcf86cd799439012",
						},
						description: {
							type: "string",
							description: "Pet description",
							example: "A friendly and energetic dog",
						},
					},
				},
				UpdatePetRequest: {
					type: "object",
					properties: {
						name: {
							type: "string",
							description: "Pet name",
							example: "Buddy",
						},
						species: {
							type: "string",
							description: "Pet species",
							example: "dog",
						},
						breed: {
							type: "string",
							description: "Pet breed",
							example: "Golden Retriever",
						},
						age: {
							type: "integer",
							description: "Pet age in years",
							example: 3,
						},
						color: {
							type: "string",
							description: "Pet color",
							example: "Golden",
						},
						userId: {
							type: "string",
							description: "ID of the user who owns this pet",
							example: "507f1f77bcf86cd799439012",
						},
						description: {
							type: "string",
							description: "Pet description",
							example: "A friendly and energetic dog",
						},
					},
				},
				PetsListResponse: {
					type: "object",
					properties: {
						pets: {
							type: "array",
							items: {
								$ref: "#/components/schemas/Pet",
							},
						},
						total: {
							type: "integer",
							description: "Total number of pets",
							example: 50,
						},
						page: {
							type: "integer",
							description: "Current page number",
							example: 1,
						},
						limit: {
							type: "integer",
							description: "Number of pets per page",
							example: 10,
						},
					},
				},
				ApiErrorResponse: {
					type: "object",
					properties: {
						error: {
							type: "string",
							description: "Error type",
							example: "Not Found",
						},
						message: {
							type: "string",
							description: "Error message",
							example: "Pet not found",
						},
						statusCode: {
							type: "integer",
							description: "HTTP status code",
							example: 404,
						},
					},
				},
				HealthResponse: {
					type: "object",
					properties: {
						status: {
							type: "string",
							description: "Health status",
							example: "ok",
						},
						timestamp: {
							type: "string",
							format: "date-time",
							description: "Health check timestamp",
						},
						database: {
							type: "string",
							description: "Database connection status",
							example: "connected",
						},
					},
				},
			},
			parameters: {
				PetId: {
					name: "id",
					in: "path",
					required: true,
					description: "Pet ID",
					schema: {
						type: "string",
						example: "507f1f77bcf86cd799439011",
					},
				},
				UserId: {
					name: "userId",
					in: "path",
					required: true,
					description: "User ID",
					schema: {
						type: "string",
						example: "507f1f77bcf86cd799439012",
					},
				},
				PageQuery: {
					name: "page",
					in: "query",
					description: "Page number for pagination",
					schema: {
						type: "integer",
						minimum: 1,
						default: 1,
					},
				},
				LimitQuery: {
					name: "limit",
					in: "query",
					description: "Number of items per page",
					schema: {
						type: "integer",
						minimum: 1,
						maximum: 100,
						default: 10,
					},
				},
				SpeciesQuery: {
					name: "species",
					in: "query",
					description: "Filter by pet species",
					schema: {
						type: "string",
						example: "dog",
					},
				},
				NameQuery: {
					name: "name",
					in: "query",
					description: "Filter by pet name (partial match)",
					schema: {
						type: "string",
						example: "Buddy",
					},
				},
				UserIdQuery: {
					name: "userId",
					in: "query",
					description: "Filter by user ID",
					schema: {
						type: "string",
						example: "507f1f77bcf86cd799439012",
					},
				},
			},
		},
	},
	apis: ["./src/routes/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
