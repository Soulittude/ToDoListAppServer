import { Request, Response } from 'express';
import Todo from '../models/Todo.model';

// Helper for error responses
const sendError = (res: Response, status: number, message: string) => {
    return res.status(status).json({ success: false, error: message });
};

// Create Todo
export const createTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.create({
            text: req.body.text,
            user: req.userId
        });
        res.status(201).json({ success: true, data: todo });
    } catch (error) {
        sendError(res, 400, 'Failed to create todo');
    }
};

// Update Todo
export const updateTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId // Ensure user owns the todo
            },
            {
                text: req.body.text,
                completed: req.body.completed
            },
            { new: true }
        );

        if (!todo) return sendError(res, 404, 'Todo not found');
        res.json({ success: true, data: todo });
    } catch (error) {
        sendError(res, 400, 'Update failed');
    }
};

// Delete Todo
export const deleteTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!todo) return sendError(res, 404, 'Todo not found');
        res.status(204).send();
    } catch (error) {
        sendError(res, 400, 'Delete failed');
    }
};

// Get Single Todo
export const getTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!todo) return sendError(res, 404, 'Todo not found');
        res.json({ success: true, data: todo });
    } catch (error) {
        sendError(res, 500, 'Server error');
    }
};

// Get All Todos
export const getTodos = async (req: Request, res: Response) => {
    try {
        const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: todos });
    } catch (error) {
        sendError(res, 500, 'Failed to fetch todos');
    }
};