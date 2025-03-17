import { Router } from 'express';
import { body } from 'express-validator';
import {
    createSpecificDateTodo,
    createTodo,
    deleteTodo,
    getTodo,
    getTodos,
    reorderTodos,
    updateTodo
} from '../controllers/todo.controller';
import validateObjectId from '../middlewares/validateObjectId';
import validateRequest from '../middlewares/validateRequest';
import { auth } from '../middlewares/auth';

const router = Router();

// Apply auth middleware to ALL todo routes ▼
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         _id:
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
 *         user:
 *           type: string
 *           description: The user ID who owns the todo
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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

router.patch(
    '/reorder',
    [
        body('ids')
            .isArray().withMessage('IDs must be an array')
            .notEmpty().withMessage('IDs array cannot be empty')
    ],
    validateRequest,
    reorderTodos
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-15T09:00:00Z"
 *         recurrence:
 *           type: string
 *           enum: [daily, weekly]
 *           example: "daily"
 *         nextOccurrence:
 *           type: string
 *           format: date-time
 *           example: "2024-03-16T09:00:00Z"
 */

// POST /todos ▼ (auth removed from route definition)
router.post(
    '/',
    [
        body('text').trim().notEmpty().isLength({ max: 500 }),
        body('dueDate').optional().isISO8601(),
        body('recurrence').optional().isIn(['daily', 'weekly']),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    createTodo
);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       201:
 *         description: The created todo item
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Learn TypeScript"
 *                 completed: false
 *                 user: "65d5b7e5a3b1a12a90c1e1d5"
 *                 createdAt: "2024-02-21T10:00:00.000Z"
 */

// PUT /todos/:id ▼
router.put(
    '/:id',
    validateObjectId,
    [
        body().custom(value => {
            const allowedFields = ['text', 'completed', 'dueDate', 'recurrence'];
            if (!Object.keys(value).some(k => allowedFields.includes(k))) {
                throw new Error('At least one valid field must be provided');
            }
            return true;
        }),
        body('text').optional().trim().notEmpty().isLength({ max: 500 }),
        body('dueDate').optional().isISO8601(),
        body('recurrence').optional().isIn(['daily', 'weekly']),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    updateTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Todos]
 *     summary: Update a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *             example:
 *               success: true
 *               data:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Updated todo item"
 *                 completed: true
 *                 user: "65d5b7e5a3b1a12a90c1e1d5"
 *                 updatedAt: "2024-02-21T10:05:00.000Z"
 */

// DELETE /todos/:id ▼
router.delete(
    '/:id',
    validateObjectId,
    deleteTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Todos]
 *     summary: Delete a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// GET /todos/:id ▼
router.get(
    '/:id',
    validateObjectId,
    getTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Todos]
 *     summary: Get a single todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Learn MERN Stack"
 *                 completed: false
 *                 user: "65d5b7e5a3b1a12a90c1e1d5"
 *                 createdAt: "2024-02-21T10:00:00.000Z"
 *                 updatedAt: "2024-02-21T10:00:00.000Z"
 */

// GET /todos ▼
router.get(
    '/',
    getTodos
);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Todos]
 *     summary: Get all todos for current user
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                   text: "Learn MERN Stack"
 *                   completed: false
 *                   user: "65d5b7e5a3b1a12a90c1e1d5"
 *                   createdAt: "2024-02-21T10:00:00.000Z"
 *                   updatedAt: "2024-02-21T10:00:00.000Z"
 */

// Add new route for specific date todos
router.post(
    '/specific-date',
    [
        body('text').trim().notEmpty().isLength({ max: 500 }),
        body('specificDate').isISO8601(),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    createSpecificDateTodo
);

export default router;