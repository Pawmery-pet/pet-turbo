import { Router, type IRouter } from "express";
import { AccountController } from "../controllers/accountController.js";

const router: IRouter = Router();

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Link account (OAuth)
 *     description: Link an OAuth account to a user
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - provider
 *               - providerAccountId
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *               provider:
 *                 type: string
 *               providerAccountId:
 *                 type: string
 *               refresh_token:
 *                 type: string
 *               access_token:
 *                 type: string
 *               expires_at:
 *                 type: number
 *               token_type:
 *                 type: string
 *               scope:
 *                 type: string
 *               id_token:
 *                 type: string
 *               session_state:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account linked successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Account already linked
 */
router.post("/", AccountController.linkAccount);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts
 *     description: Get all accounts with optional filtering
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by provider
 *       - in: query
 *         name: providerAccountId
 *         schema:
 *           type: string
 *         description: Filter by provider account ID
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get("/", AccountController.getAllAccounts);

/**
 * @swagger
 * /api/accounts/{provider}/{providerAccountId}:
 *   get:
 *     summary: Get account by provider and account ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: providerAccountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account found
 *       404:
 *         description: Account not found
 */
router.get("/:provider/:providerAccountId", AccountController.getAccount);

/**
 * @swagger
 * /api/accounts/{provider}/{providerAccountId}:
 *   delete:
 *     summary: Unlink account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: providerAccountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account unlinked
 *       404:
 *         description: Account not found
 */
router.delete("/:provider/:providerAccountId", AccountController.unlinkAccount);

/**
 * @swagger
 * /api/accounts/{provider}/{providerAccountId}/user:
 *   get:
 *     summary: Get user by account
 *     description: Get user associated with the account (used by AuthJS)
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: providerAccountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: Account not found
 */
router.get(
	"/:provider/:providerAccountId/user",
	AccountController.getUserByAccount,
);

/**
 * @swagger
 * /api/accounts/user/{userId}:
 *   get:
 *     summary: Get accounts by user ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User accounts
 */
router.get("/user/:userId", AccountController.getAccountsByUserId);

export default router;
