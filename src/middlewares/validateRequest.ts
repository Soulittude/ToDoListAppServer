import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

// Type for express-validator errors
type FieldValidationError = ValidationError & {
    location: 'body' | 'query' | 'params' | 'cookies' | 'headers';
    path: string;
    value: any;
};

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error: ValidationError) => {
            if ('path' in error) { // Type guard for field errors
                const fieldError = error as FieldValidationError;
                return {
                    msg: fieldError.msg,
                    param: fieldError.path,
                    location: fieldError.location
                };
            }
            return { msg: error.msg };
        });

        return res.status(400).json({
            success: false,
            errors: errorMessages
        });
    }

    next();
};

export default validateRequest;