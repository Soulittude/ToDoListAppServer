import { Request, Response } from 'express';
import Todo from '../models/Todo';

export const getTodos = async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add other CRUD operations (createTodo, updateTodo, deleteTodo)