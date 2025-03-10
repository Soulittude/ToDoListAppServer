import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.model';

const JWT_EXPIRES_IN = '6h';
const BCRYPT_ROUNDS = 10;

const sendError = (res: Response, status: number, message: string) => {
    return res.status(status).json({ success: false, error: message });
};

// User Registration
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return sendError(res, 400, 'Email already exists');

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password: await bcrypt.hash(password, BCRYPT_ROUNDS)
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        sendError(res, 400, 'Registration failed');
    }
};

// User Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return sendError(res, 401, 'Invalid credentials');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return sendError(res, 401, 'Invalid credentials');

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        sendError(res, 400, 'Login failed');
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