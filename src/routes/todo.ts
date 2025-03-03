import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/todos - Retrieve all todos
router.get('/', (req: Request, res: Response) => {
  // TODO: Replace this with logic to fetch todos from your database
  res.status(200).json({ message: 'Get all todos' });
});

// POST /api/todos - Create a new todo
router.post('/', (req: Request, res: Response) => {
  // TODO: Replace this with logic to create a new todo using data from req.body
  res.status(201).json({ message: 'Create a new todo' });
});

// PUT /api/todos/:id - Update an existing todo
router.put('/:id', (req: Request, res: Response) => {
  // TODO: Replace this with logic to update a todo by its ID
  const { id } = req.params;
  res.status(200).json({ message: `Update todo with ID ${id}` });
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', (req: Request, res: Response) => {
  // TODO: Replace this with logic to delete a todo by its ID
  const { id } = req.params;
  res.status(200).json({ message: `Delete todo with ID ${id}` });
});

export default router;
