import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/user.controller';
import validateRequest from '../middlewares/validateRequest';
import { auth } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB unique identifier
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "strongPassword123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 */

// Registration
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             email: "user@example.com"
 *             password: "strongPassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d5"
 *                 email: "user@example.com"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Validation failed"
 *               errors:
 *                 - msg: "Email must be valid"
 *                   param: "email"
 */
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    validateRequest,
    register
);

// Login
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Authenticate user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             email: "user@example.com"
 *             password: "strongPassword123"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d5"
 *                 email: "user@example.com"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid credentials"
 */
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    validateRequest,
    login
);

// Get current user profile
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             example:
 *               _id: "65d5b7e5a3b1a12a90c1e1d5"
 *               email: "user@example.com"
 *               todos: []
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', auth, getProfile);

export default router;