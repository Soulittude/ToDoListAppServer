import { Request, Response } from 'express';
import Todo from '../models/Todo.model';

// Helper for error responses
const sendError = (res: Response, status: number, message: string) => {
    return res.status(status).json({ success: false, error: message });
};

// Create Todo
export const createTodo = async (req: Request, res: Response) => {
    try {
        const order = req.body.order ?? await Todo.countDocuments({ user: req.userId });

        const todoData = {
            text: req.body.text,
            user: req.userId,
            date: req.body.date,
            recurrence: req.body.recurrence,
            order: req.body.order ?? await Todo.countDocuments({ user: req.userId })
        };

        const todo = await Todo.create(todoData);
        res.status(201).json({ success: true, data: todo });
    } catch (error) {
        sendError(res, 400, 'Failed to create todo');
    }
};

export const updateTodo = async (req: Request, res: Response) => {
    try {
        const updateData: Record<string, any> = {
            text: req.body.text,
            completed: req.body.completed,
            date: req.body.date, // Changed from dueDate
            recurrence: req.body.recurrence,
            order: req.body.order
        };

        // Remove dueDate checks
        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            updateData,
            { new: true }
        );

        if (!todo) return sendError(res, 404, 'Todo not found');
        res.json({ success: true, data: todo });
    } catch (error) {
        sendError(res, 400, 'Update failed');
    }
};

// Add new controller for reordering
export const reorderTodos = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        await Todo.reorderTodos(req.userId!, ids);
        res.json({ success: true });
    } catch (error) {
        sendError(res, 400, 'Failed to reorder todos');
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