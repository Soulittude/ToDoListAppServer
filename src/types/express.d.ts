// Extend Express Request type
declare namespace Express {
    export interface Request {
        userId?: string;
        user?: JwtPayload;
    }
}