import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/user.controller';
import validateRequest from '../middlewares/validateRequest';
import { auth } from '../middlewares/auth';

const router = Router();

// Registration
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    validateRequest,
    register
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    validateRequest,
    login
);

// Get current user profile (requires authentication)
router.get('/me', auth, getProfile);

export default router;