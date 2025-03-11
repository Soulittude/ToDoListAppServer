"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const todo_controller_1 = require("../controllers/todo.controller");
const validateObjectId_1 = __importDefault(require("../middlewares/validateObjectId"));
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to ALL todo routes ▼
router.use(auth_1.auth);
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
// POST /todos ▼ (auth removed from route definition)
router.post('/', [
    (0, express_validator_1.body)('text')
        .trim()
        .notEmpty().withMessage('Text is required')
        .isLength({ max: 500 }).withMessage('Maximum 500 characters allowed'),
    (0, express_validator_1.body)('completed').optional().isBoolean()
], validateRequest_1.default, todo_controller_1.createTodo);
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
router.put('/:id', validateObjectId_1.default, [
    (0, express_validator_1.body)('text')
        .optional()
        .trim()
        .notEmpty().withMessage('Text cannot be empty')
        .isLength({ max: 500 }).withMessage('Maximum 500 characters allowed'),
    (0, express_validator_1.body)('completed').optional().isBoolean()
], validateRequest_1.default, todo_controller_1.updateTodo);
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
router.delete('/:id', validateObjectId_1.default, todo_controller_1.deleteTodo);
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
router.get('/:id', validateObjectId_1.default, todo_controller_1.getTodo);
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
router.get('/', todo_controller_1.getTodos);
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
exports.default = router;
