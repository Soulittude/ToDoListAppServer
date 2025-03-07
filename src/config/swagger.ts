import swaggerJsdoc from 'swagger-jsdoc';

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
    apis: ['./src/routes/*.ts'], // Path to your route files
};

export default swaggerJsdoc(options);