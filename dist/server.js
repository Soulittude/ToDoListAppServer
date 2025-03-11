"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const todo_routes_1 = __importDefault(require("./routes/todo.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, 'access.log'), { flags: 'a' });
// 1. Essential Middlewares
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000'
})); // CORS policy
app.use(express_1.default.json()); // Parse JSON bodies
app.use(process.env.NODE_ENV === 'production'
    ? (0, morgan_1.default)('combined', { stream: accessLogStream })
    : (0, morgan_1.default)('dev'));
// 2. Optional Middlewares
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// 3. Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// 4. Routes
app.use('/api/todos', todo_routes_1.default);
app.use('/api/users', user_routes_1.default);
// 5. Error Handler (MUST be last middleware)
app.use(errorHandler_1.default);
//Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
(0, db_1.default)().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
