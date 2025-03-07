import { Request, Response } from 'express';
import Todo from '../models/Todo.model';

// Create Todo
export const createTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.create(req.body);
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create todo' });
    }
};

// Update Todo
export const updateTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { completed: req.body.completed },
            { new: true } // Return updated document
        );

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: 'Update failed' });
    }
};

// Delete Todo
export const deleteTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Delete failed' });
    }
};

// Get Todo By Id
export const getTodo = async (req: Request, res: Response) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Todos
export const getTodos = async (req: Request, res: Response) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};