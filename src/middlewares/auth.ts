import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
    return;
};