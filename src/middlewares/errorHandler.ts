import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validator';

type AppError = Error & {
    statusCode?: number;
    errors?: Array<{
        msg: string;
        param?: string;
        location?: string;
    }>;
};

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    const errorResponse: {
        success: boolean;
        error: string;
        stack?: string;
        errors?: Array<{
            msg: string;
            param?: string;
            location?: string;
        }>;
    } = {
        success: false,
        error: message
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        if (err.errors) {
            errorResponse.errors = err.errors.map(e => ({
                msg: e.msg,
                param: e.param,
                location: e.location
            }));
        }
    }

    console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);

    res.status(statusCode).json(errorResponse);
};

export default errorHandler;