// Extend Express Request type
declare namespace Express {
    export interface Request {
        user?: any;  // Add custom properties here
    }
}