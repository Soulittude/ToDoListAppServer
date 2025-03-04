import { Router } from 'express';
import { getTodos } from '../controllers/todoController';

const router = Router();

router.get('/', getTodos);
// Add POST, PUT, DELETE routes

export default router;