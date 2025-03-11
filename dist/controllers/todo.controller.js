"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodos = exports.getTodo = exports.deleteTodo = exports.updateTodo = exports.createTodo = void 0;
const Todo_model_1 = __importDefault(require("../models/Todo.model"));
// Helper for error responses
const sendError = (res, status, message) => {
    return res.status(status).json({ success: false, error: message });
};
// Create Todo
const createTodo = async (req, res) => {
    try {
        const todo = await Todo_model_1.default.create({
            text: req.body.text,
            user: req.userId
        });
        res.status(201).json({ success: true, data: todo });
    }
    catch (error) {
        sendError(res, 400, 'Failed to create todo');
    }
};
exports.createTodo = createTodo;
// Update Todo
const updateTodo = async (req, res) => {
    try {
        const todo = await Todo_model_1.default.findOneAndUpdate({
            _id: req.params.id,
            user: req.userId // Ensure user owns the todo
        }, {
            text: req.body.text,
            completed: req.body.completed
        }, { new: true });
        if (!todo)
            return sendError(res, 404, 'Todo not found');
        res.json({ success: true, data: todo });
    }
    catch (error) {
        sendError(res, 400, 'Update failed');
    }
};
exports.updateTodo = updateTodo;
// Delete Todo
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo_model_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if (!todo)
            return sendError(res, 404, 'Todo not found');
        res.status(204).send();
    }
    catch (error) {
        sendError(res, 400, 'Delete failed');
    }
};
exports.deleteTodo = deleteTodo;
// Get Single Todo
const getTodo = async (req, res) => {
    try {
        const todo = await Todo_model_1.default.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!todo)
            return sendError(res, 404, 'Todo not found');
        res.json({ success: true, data: todo });
    }
    catch (error) {
        sendError(res, 500, 'Server error');
    }
};
exports.getTodo = getTodo;
// Get All Todos
const getTodos = async (req, res) => {
    try {
        const todos = await Todo_model_1.default.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: todos });
    }
    catch (error) {
        sendError(res, 500, 'Failed to fetch todos');
    }
};
exports.getTodos = getTodos;
