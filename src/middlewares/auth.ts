// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model'; // Make sure this path is correct

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Authentication token required');
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            exp: number; // Added expiration timestamp
        };

        // 3. Check token expiration
        if (Date.now() >= decoded.exp * 1000) {
            throw new Error('Token expired');
        }

        // 4. Verify user still exists in database
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error('User not found');
        }

        // 5. Attach user to request
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error('Authentication error:', err);

        const errorMessage = process.env.NODE_ENV === 'development'
            ? err instanceof Error ? err.message : 'Authentication failed'
            : 'Authentication failed';

        res.status(401).json({
            success: false,
            error: errorMessage
        });
    }
};