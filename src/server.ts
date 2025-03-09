import express from 'express';
import connectDB from './config/db';
import dotenv from 'dotenv';
import todoRoutes from './routes/todo.routes';
import userRoutes from './routes/user.routes';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Essential Middlewares
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000'
})); // CORS policy
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Request logging

// 2. Optional Middlewares
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// 3. Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 4. Routes
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

// 5. Error Handler (MUST be last middleware)
app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});