import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

// Middleware to validate request using express-validator results
const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      msg: error.msg,
      ...('path' in error && { param: error.path }),
      ...('location' in error && { location: error.location })
    }));

    // Create error object for errorHandler
    const error: Error & { statusCode?: number; errors?: any[] } = new Error('Validation failed');
    error.statusCode = 400;
    error.errors = formattedErrors;

    return next(error);
  }

  next();
};

export default validateRequest;