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

const router = Router();

// POST /api/todos + body
router.post(
    '/',
    [
        body('text')
            .trim()
            .notEmpty().withMessage('Text is required')
            .isLength({ max: 500 }).withMessage('Max 500 characters'),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    createTodo
);

// PUT /api/todos/{id} + body
router.put(
    '/:id',
    validateObjectId,
    [
        body('text')
            .optional()
            .trim()
            .notEmpty().withMessage('Text cannot be empty')
            .isLength({ max: 500 }).withMessage('Max 500 characters'),
        body('completed').optional().isBoolean()
    ],
    validateRequest,
    updateTodo
);

// DELETE /api/todos/{id}
router.delete('/:id', validateObjectId, deleteTodo);

// GET /api/todos/{id}
router.get('/:id', validateObjectId, getTodo);

// GET /api/todos
router.get('/', getTodos);

export default router;