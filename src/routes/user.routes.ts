import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/user.controller';
import validateRequest from '../middlewares/validateRequest';

const router = Router();

router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    validateRequest,
    register
);

router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    validateRequest,
    login
);

export default router;