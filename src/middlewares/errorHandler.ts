import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validator';
import mongoose from 'mongoose';

// Type for formatted validation errors
interface FormattedValidationError {
    msg: string;
    param?: string;
    location?: string;
}

// Extended error type for Express applications
interface AppError extends Error {
    statusCode?: number;
    errors?: ValidationError[];
}

// Main error handling middleware
const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: FormattedValidationError[] = [];

    // Handle Mongoose CastError (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
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
    const errorResponse: {
        success: boolean;
        error: string;
        errors?: FormattedValidationError[];
        stack?: string;
    } = {
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
const formatValidationError = (error: ValidationError): FormattedValidationError => {
    const formatted: FormattedValidationError = { msg: error.msg };

    if ('path' in error) {
        formatted.param = error.path;
    }

    if ('location' in error) {
        formatted.location = error.location;
    }

    return formatted;
};

export default errorHandler;