"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Main error handling middleware
const errorHandler = (err, req, res, next) => {
    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors = [];
    // Handle Mongoose CastError (invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    // Handle express-validator errors
    else if (err.errors?.length) {
        statusCode = 400;
        message = 'Validation failed';
        errors = err.errors.map(formatValidationError);
    }
    // Handle custom error status codes
    else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Construct error response
    const errorResponse = {
        success: false,
        error: message,
    };
    // Add stack trace and detailed errors in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        if (errors.length > 0) {
            errorResponse.errors = errors;
        }
    }
    // Log the error details
    console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`, {
        path: req.path,
        method: req.method,
    });
    // Send response
    res.status(statusCode).json(errorResponse);
};
// Helper to format express-validator errors
const formatValidationError = (error) => {
    const formatted = { msg: error.msg };
    if ('path' in error) {
        formatted.param = error.path;
    }
    if ('location' in error) {
        formatted.location = error.location;
    }
    return formatted;
};
exports.default = errorHandler;
