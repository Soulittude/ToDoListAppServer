import { Router } from 'express';
import { body } from 'express-validator';
import {
    createTodo,
    deleteTodo,
    getTodo,
    getTodos,
    updateTodo
} from '../controllers/todo.controller';
import validateObjectId from '../middlewares/validateObjectId';
import validateRequest from '../middlewares/validateRequest';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/', auth, createTodo); // Add auth middleware

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated MongoDB ID
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           example: Buy groceries
 *         completed:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Auto-generated creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Auto-generated update timestamp
 *   responses:
 *     NotFoundError:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             error: Todo not found
 *     ValidationError:
 *       description: Validation failed
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             error: Validation failed
 *             errors:
 *               - msg: Text is required
 *                 param: text
 */

/**
 * @swagger
 * /api/todos:
 *   post:
 *     tags: [Todos]
 *     summary: Create a new todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *           example:
 *             text: Learn TypeScript
 *             completed: false
 *     responses:
 *       201:
 *         description: The created todo item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    [
        body('text')
            .trim()
            .notEmpty().withMessage('Text is required')
            .isLength({ max: 500 }).withMessage('Maximum 500 characters allowed'),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    createTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     tags: [Todos]
 *     summary: Update a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the todo to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *           example:
 *             text: Updated todo item
 *             completed: true
 *     responses:
 *       200:
 *         description: The updated todo item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
    '/:id',
    validateObjectId,
    [
        body('text')
            .optional()
            .trim()
            .notEmpty().withMessage('Text cannot be empty')
            .isLength({ max: 500 }).withMessage('Maximum 500 characters allowed'),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    updateTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     tags: [Todos]
 *     summary: Delete a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the todo to delete
 *     responses:
 *       200:
 *         description: Confirmation of deletion
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Todo deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
    '/:id',
    validateObjectId,
    deleteTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     tags: [Todos]
 *     summary: Get a single todo
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the todo to fetch
 *     responses:
 *       200:
 *         description: Todo details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
    '/:id',
    validateObjectId,
    getTodo
);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     tags: [Todos]
 *     summary: Get all todos
 *     responses:
 *       200:
 *         description: List of all todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *             example:
 *               - id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Learn MERN Stack"
 *                 completed: false
 *                 createdAt: "2024-02-21T10:00:00.000Z"
 *                 updatedAt: "2024-02-21T10:00:00.000Z"
 */
router.get(
    '/',
    getTodos
);

export default router;