import { Router, type IRouter } from "express";
import { PetController } from "../controllers/petController.js";

const router: IRouter = Router();

const petController = new PetController();

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Get all pets
 *     description: Retrieve a paginated list of pets with optional filtering
 *     tags: [Pets]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SpeciesQuery'
 *       - $ref: '#/components/parameters/NameQuery'
 *       - $ref: '#/components/parameters/UserIdQuery'
 *     responses:
 *       200:
 *         description: List of pets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetsListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/", petController.getAllPets);

/**
 * @swagger
 * /api/pets/user/{userId}:
 *   get:
 *     summary: Get pets by user ID
 *     description: Retrieve a paginated list of pets belonging to a specific user
 *     tags: [Pets]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SpeciesQuery'
 *       - $ref: '#/components/parameters/NameQuery'
 *     responses:
 *       200:
 *         description: List of user's pets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetsListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/user/:userId", petController.getPetsByUserId);

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Get pet by ID
 *     description: Retrieve a specific pet by their MongoDB ObjectId
 *     tags: [Pets]
 *     parameters:
 *       - $ref: '#/components/parameters/PetId'
 *     responses:
 *       200:
 *         description: Pet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       404:
 *         description: Pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/:id", petController.getPetById);

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Create a new pet
 *     description: Create a new pet with the provided information
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePetRequest'
 *     responses:
 *       201:
 *         description: Pet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post("/", petController.createPet);

/**
 * @swagger
 * /api/pets/{id}:
 *   put:
 *     summary: Update pet
 *     description: Update an existing pet's information
 *     tags: [Pets]
 *     parameters:
 *       - $ref: '#/components/parameters/PetId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePetRequest'
 *     responses:
 *       200:
 *         description: Pet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       404:
 *         description: Pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.put("/:id", petController.updatePet);

/**
 * @swagger
 * /api/pets/{id}:
 *   delete:
 *     summary: Delete pet
 *     description: Delete an existing pet
 *     tags: [Pets]
 *     parameters:
 *       - $ref: '#/components/parameters/PetId'
 *     responses:
 *       204:
 *         description: Pet deleted successfully
 *       404:
 *         description: Pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.delete("/:id", petController.deletePet);

export default router;
