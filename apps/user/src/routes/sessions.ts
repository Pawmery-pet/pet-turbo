import { Router, type IRouter } from 'express';
import { SessionController } from '../controllers/sessionController.js';

const router: IRouter = Router();

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create session
 *     description: Create a new user session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionToken
 *               - userId
 *               - expires
 *             properties:
 *               sessionToken:
 *                 type: string
 *               userId:
 *                 type: string
 *               expires:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Session already exists
 */
router.post('/', SessionController.createSession);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions
 *     description: Get all sessions with optional filtering
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: sessionToken
 *         schema:
 *           type: string
 *         description: Filter by session token
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/', SessionController.getAllSessions);

/**
 * @swagger
 * /api/sessions/{sessionToken}:
 *   get:
 *     summary: Get session by token
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session found
 *       404:
 *         description: Session not found
 */
router.get('/:sessionToken', SessionController.getSession);

/**
 * @swagger
 * /api/sessions/{sessionToken}:
 *   put:
 *     summary: Update session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               expires:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Session updated
 *       404:
 *         description: Session not found
 */
router.put('/:sessionToken', SessionController.updateSession);

/**
 * @swagger
 * /api/sessions/{sessionToken}:
 *   delete:
 *     summary: Delete session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Session deleted
 *       404:
 *         description: Session not found
 */
router.delete('/:sessionToken', SessionController.deleteSession);

/**
 * @swagger
 * /api/sessions/{sessionToken}/user:
 *   get:
 *     summary: Get session and user
 *     description: Get session with associated user (used by AuthJS)
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session and user found
 *       404:
 *         description: Session not found
 */
router.get('/:sessionToken/user', SessionController.getSessionAndUser);

/**
 * @swagger
 * /api/sessions/user/{userId}:
 *   get:
 *     summary: Get sessions by user ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User sessions
 */
router.get('/user/:userId', SessionController.getSessionsByUserId);

export default router; 