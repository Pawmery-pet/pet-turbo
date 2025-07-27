import { Router, type IRouter } from "express";
import { VerificationTokenController } from "../controllers/verificationTokenController.js";

const router: IRouter = Router();

/**
 * @swagger
 * /api/verification-tokens:
 *   post:
 *     summary: Create verification token
 *     description: Create a new verification token for email verification or password reset
 *     tags: [Verification Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - token
 *               - expires
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email address or other identifier
 *               token:
 *                 type: string
 *                 description: Random verification token
 *               expires:
 *                 type: string
 *                 format: date-time
 *                 description: Token expiration time
 *     responses:
 *       201:
 *         description: Verification token created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Token already exists
 */
router.post("/", VerificationTokenController.createVerificationToken);

/**
 * @swagger
 * /api/verification-tokens:
 *   get:
 *     summary: Get all verification tokens
 *     description: Get all verification tokens (admin/debug purposes)
 *     tags: [Verification Tokens]
 *     responses:
 *       200:
 *         description: List of verification tokens
 */
router.get("/", VerificationTokenController.getAllVerificationTokens);

/**
 * @swagger
 * /api/verification-tokens/{identifier}/{token}:
 *   get:
 *     summary: Get verification token
 *     tags: [Verification Tokens]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Email or identifier
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Verification token found
 *       404:
 *         description: Token not found
 */
router.get(
	"/:identifier/:token",
	VerificationTokenController.getVerificationToken,
);

/**
 * @swagger
 * /api/verification-tokens/{identifier}/{token}/use:
 *   delete:
 *     summary: Use verification token
 *     description: Consume/use verification token (deletes it - AuthJS pattern)
 *     tags: [Verification Tokens]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Email or identifier
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Token used successfully
 *       404:
 *         description: Token not found or already used
 */
router.delete(
	"/:identifier/:token/use",
	VerificationTokenController.useVerificationToken,
);

/**
 * @swagger
 * /api/verification-tokens/cleanup:
 *   delete:
 *     summary: Cleanup expired tokens
 *     description: Remove all expired verification tokens
 *     tags: [Verification Tokens]
 *     responses:
 *       200:
 *         description: Cleanup completed
 */
router.delete("/cleanup", VerificationTokenController.cleanupExpiredTokens);

export default router;
