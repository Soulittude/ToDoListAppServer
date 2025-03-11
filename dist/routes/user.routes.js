"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controllers/user.controller");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Registration
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], validateRequest_1.default, user_controller_1.register);
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').exists()
], validateRequest_1.default, user_controller_1.login);
// Get current user profile (requires authentication)
router.get('/me', auth_1.auth, user_controller_1.getProfile);
exports.default = router;
