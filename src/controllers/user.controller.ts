import { Request, Response } from 'express';
import User from '../models/User.model';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Create user
        const user = new User({ email, password });
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        // Response with safe user data
        res.status(201).json({
            success: true,
            data: {
                token,
                user: user.toJSON()
            }
        });

    } catch (error: any) {
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: user.toJSON()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

// Get Profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return sendError(res, 404, 'User not found');
        res.json({ success: true, data: user });
    } catch (error) {
        sendError(res, 500, 'Server error');
    }
};

function sendError(res: Response<any, Record<string, any>>, arg1: number, arg2: string) {
    throw new Error('Function not implemented.');
}
