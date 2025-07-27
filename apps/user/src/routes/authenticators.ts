import { Router, type IRouter } from "express";
import { AuthenticatorController } from "../controllers/authenticatorController.js";

const router: IRouter = Router();

/**
 * @swagger
 * /api/authenticators:
 *   post:
 *     summary: Create authenticator
 *     description: Create a new WebAuthn authenticator
 *     tags: [Authenticators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credentialID
 *               - userId
 *               - providerAccountId
 *               - credentialPublicKey
 *               - counter
 *               - credentialDeviceType
 *               - credentialBackedUp
 *             properties:
 *               credentialID:
 *                 type: string
 *               userId:
 *                 type: string
 *               providerAccountId:
 *                 type: string
 *               credentialPublicKey:
 *                 type: string
 *               counter:
 *                 type: number
 *               credentialDeviceType:
 *                 type: string
 *               credentialBackedUp:
 *                 type: boolean
 *               transports:
 *                 type: string
 *     responses:
 *       201:
 *         description: Authenticator created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Authenticator already exists
 */
router.post("/", AuthenticatorController.createAuthenticator);

/**
 * @swagger
 * /api/authenticators:
 *   get:
 *     summary: Get all authenticators
 *     description: Get all authenticators with optional filtering
 *     tags: [Authenticators]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: credentialID
 *         schema:
 *           type: string
 *         description: Filter by credential ID
 *     responses:
 *       200:
 *         description: List of authenticators
 */
router.get("/", AuthenticatorController.getAllAuthenticators);

/**
 * @swagger
 * /api/authenticators/{credentialID}:
 *   get:
 *     summary: Get authenticator by credential ID
 *     tags: [Authenticators]
 *     parameters:
 *       - in: path
 *         name: credentialID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Authenticator found
 *       404:
 *         description: Authenticator not found
 */
router.get("/:credentialID", AuthenticatorController.getAuthenticator);

/**
 * @swagger
 * /api/authenticators/{credentialID}:
 *   delete:
 *     summary: Delete authenticator
 *     tags: [Authenticators]
 *     parameters:
 *       - in: path
 *         name: credentialID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Authenticator deleted
 *       404:
 *         description: Authenticator not found
 */
router.delete("/:credentialID", AuthenticatorController.deleteAuthenticator);

/**
 * @swagger
 * /api/authenticators/{credentialID}/counter:
 *   put:
 *     summary: Update authenticator counter
 *     description: Update the counter for WebAuthn authenticator
 *     tags: [Authenticators]
 *     parameters:
 *       - in: path
 *         name: credentialID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - counter
 *             properties:
 *               counter:
 *                 type: number
 *     responses:
 *       200:
 *         description: Counter updated
 *       404:
 *         description: Authenticator not found
 */
router.put(
	"/:credentialID/counter",
	AuthenticatorController.updateAuthenticatorCounter,
);

/**
 * @swagger
 * /api/authenticators/user/{userId}:
 *   get:
 *     summary: Get authenticators by user ID
 *     tags: [Authenticators]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User authenticators
 */
router.get("/user/:userId", AuthenticatorController.getAuthenticatorsByUserId);

export default router;
