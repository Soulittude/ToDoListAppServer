# Todo App - Backend (Server)

REST API backend for the Todo application with authentication and background tasks.

## Features
### Core Functionality:

- JWT Authentication

- CRUD operations for todos

- Recurring task generation

- Automatic task cleanup

- Rate limiting

- Detailed API documentation (Swagger)

### Background Services:

- 🕒 Hourly recurring task check

- 🗑️ Daily cleanup of completed tasks

- 🔐 Secure password hashing

### Database:

- MongoDB Atlas integration

- Indexed queries

- Data validation

- Soft delete pattern

## Technologies
- Node.js 20

- Express.js

- MongoDB/Mongoose

- JWT Authentication

- Swagger UI

- Node-Cron

- Winston (Logging)

- Express Validator

## API Documentation
Access Swagger UI at ```http://localhost:5000/api-docs```

## Setup
### 1. Clone Repository
```
git clone https://github.com/your-username/todo-app-backend.git
cd todo-app-backend
```
### 2. Install Dependencies
```
npm install
```
### 3. Environment Setup
Create ```.env``` file:
```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:3000
```
### 4. Run Development Server
```
npm run dev
```

## Cron Jobs
```
Schedule	Description:
0 0 * * *	Daily cleanup of old completed tasks
0 * * * *	Hourly recurring task generation
```
## Database Indexes
```user```: User ID for faster queries

```date```: Optimize date-based operations

```originalTodo```: Efficient recurring task lookups

## Deployment
### 1. Production Build
```
npm run build
```
### 2. Start Server
```
npm start
```
