import { Router } from 'express';
import { body } from 'express-validator';
import {
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
router.use(auth);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB unique identifier
 *           example: "65d5b7e5a3b1a12a90c1e1d4"
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           example: "Buy groceries"
 *         completed:
 *           type: boolean
 *           default: false
 *         date:
 *           type: string
 *           format: date-time
 *           description: Due date for dated/recurring todos
 *           example: "2024-03-20T09:00:00Z"
 *         recurrence:
 *           type: string
 *           enum: [daily, weekly]
 *           description: Recurrence pattern for repeating todos
 *           example: "daily"
 *         nextRecurrence:
 *           type: string
 *           format: date-time
 *           description: Next occurrence date for recurring todos
 *           example: "2024-03-21T09:00:00Z"
 *         order:
 *           type: number
 *           description: Position in the todo list
 *           example: 0
 *         isRecurringInstance:
 *           type: boolean
 *           description: Flag for generated recurring instances
 *         originalTodo:
 *           type: string
 *           description: Parent todo ID for recurring instances
 *         user:
 *           type: string
 *           description: Owner user ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Missing or invalid authentication token
 *     NotFoundError:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             error: "Todo not found"
 *     ValidationError:
 *       description: Validation failed
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             error: "Validation failed"
 *             errors:
 *               - msg: "Text is required"
 *                 param: "text"
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
 * /api/todos/reorder:
 *   patch:
 *     summary: Reorder todos
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               ids: ["65d5b7e5a3b1a12a90c1e1d4", "65d5b7e5a3b1a12a90c1e1d5"]
 *     responses:
 *       200:
 *         description: Todos reordered successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// POST /todos ▼
router.post(
    '/',
    [
        body('text').trim().notEmpty().isLength({ max: 500 }),
        body('date')
            .optional()
            .isISO8601()
            .custom((value, { req }) => {
                if (req.body.recurrence && !value) {
                    throw new Error('Recurring todos require a start date');
                }
                return true;
            }),
        body('recurrence')
            .optional()
            .isIn(['daily', 'weekly'])
            .custom((value, { req }) => {
                if (value && !req.body.date) {
                    throw new Error('Recurrence requires a date');
                }
                return true;
            })
    ],
    validateRequest,
    createTodo
);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *           examples:
 *             basicTodo:
 *               summary: Basic Todo
 *               value:
 *                 text: "Buy milk"
 *             datedTodo:
 *               summary: Dated Todo
 *               value:
 *                 text: "Doctor appointment"
 *                 date: "2024-03-25T14:00:00Z"
 *             recurringTodo:
 *               summary: Recurring Todo
 *               value:
 *                 text: "Daily standup"
 *                 date: "2024-03-25T09:00:00Z"
 *                 recurrence: "daily"
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *             example:
 *               success: true
 *               data:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Daily standup"
 *                 date: "2024-03-25T09:00:00Z"
 *                 recurrence: "daily"
 *                 order: 3
 *                 completed: false
 *                 user: "65d5b7e5a3b1a12a90c1e1d5"
 *                 createdAt: "2024-03-20T10:00:00Z"
 *                 updatedAt: "2024-03-20T10:00:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// PUT /todos/:id ▼
router.put(
    '/:id',
    validateObjectId,
    [
        body().custom(value => {
            const allowedFields = ['text', 'completed', 'date', 'recurrence', 'order'];
            if (!Object.keys(value).some(k => allowedFields.includes(k))) {
                throw new Error('At least one valid field must be provided');
            }
            return true;
        }),
        body('date').optional().isISO8601(),
        body('recurrence').custom((value, { req }) => {
            if (value && !req.body.date) {
                throw new Error('Recurrence requires a date');
            }
            return true;
        })
    ],
    validateRequest,
    updateTodo
);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65d5b7e5a3b1a12a90c1e1d4"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *           examples:
 *             updateText:
 *               value:
 *                 text: "Updated task description"
 *             completeTodo:
 *               value:
 *                 completed: true
 *             updateRecurrence:
 *               value:
 *                 date: "2024-04-01T09:00:00Z"
 *                 recurrence: "weekly"
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Updated task description"
 *                 date: "2024-04-01T09:00:00Z"
 *                 recurrence: "weekly"
 *                 completed: false
 *                 order: 2
 *                 updatedAt: "2024-03-20T10:05:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65d5b7e5a3b1a12a90c1e1d4"
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
 *     summary: Get a single todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65d5b7e5a3b1a12a90c1e1d4"
 *     responses:
 *       200:
 *         description: Todo details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                 text: "Team meeting"
 *                 date: "2024-03-25T14:30:00Z"
 *                 recurrence: "weekly"
 *                 order: 1
 *                 completed: false
 *                 user: "65d5b7e5a3b1a12a90c1e1d5"
 *                 createdAt: "2024-03-20T09:00:00Z"
 *                 updatedAt: "2024-03-20T09:00:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *     summary: Get all todos for current user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: "65d5b7e5a3b1a12a90c1e1d4"
 *                   text: "Project planning"
 *                   date: "2024-03-22T10:00:00Z"
 *                   order: 0
 *                   completed: true
 *                 - _id: "65d5b7e5a3b1a12a90c1e1d5"
 *                   text: "Code review"
 *                   recurrence: "daily"
 *                   date: "2024-03-25T09:00:00Z"
 *                   order: 1
 *                   completed: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

export default router;