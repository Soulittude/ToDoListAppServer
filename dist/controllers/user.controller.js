"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_model_1 = __importDefault(require("../models/User.model"));
const JWT_EXPIRES_IN = '6h';
const BCRYPT_ROUNDS = 10;
const sendError = (res, status, message) => {
    return res.status(status).json({ success: false, error: message });
};
// User Registration
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check for existing user
        const existingUser = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser)
            return sendError(res, 400, 'Email already exists');
        // Create user
        const user = await User_model_1.default.create({
            email: email.toLowerCase(),
            password: await bcrypt_1.default.hash(password, BCRYPT_ROUNDS)
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
    }
    catch (error) {
        sendError(res, 400, 'Registration failed');
    }
};
exports.register = register;
// User Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (!user)
            return sendError(res, 401, 'Invalid credentials');
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword)
            return sendError(res, 401, 'Invalid credentials');
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
    }
    catch (error) {
        sendError(res, 400, 'Login failed');
    }
};
exports.login = login;
// Get Profile
const getProfile = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.userId).select('-password');
        if (!user)
            return sendError(res, 404, 'User not found');
        res.json({ success: true, data: user });
    }
    catch (error) {
        sendError(res, 500, 'Server error');
    }
};
exports.getProfile = getProfile;
