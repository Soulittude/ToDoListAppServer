import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.model'; // Create this model

const JWT_EXPIRES_IN = '1h';

// User registration
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({ userId: user._id, token });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
};

// User login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ userId: user._id, token });
    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
    }
};