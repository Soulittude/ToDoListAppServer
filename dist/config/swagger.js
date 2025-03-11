"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo API',
            version: '1.0.0',
            description: 'API for managing todo items',
        },
        servers: [
            { url: 'http://localhost:5000' }
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to your route files.
};
exports.default = (0, swagger_jsdoc_1.default)(options);
