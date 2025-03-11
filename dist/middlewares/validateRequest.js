"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// Middleware to validate request using express-validator results
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        // Format validation errors
        const formattedErrors = errors.array().map(error => ({
            msg: error.msg,
            ...('path' in error && { param: error.path }),
            ...('location' in error && { location: error.location })
        }));
        // Create error object for errorHandler
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = formattedErrors;
        return next(error);
    }
    next();
};
exports.default = validateRequest;
