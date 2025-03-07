import { Document, Schema, model } from 'mongoose';

// A. TypeScript Interface (For type checking)
export interface ITodo extends Document {
    text: string;
    completed: boolean;
}

// B. Database Schema (For MongoDB rules)
const TodoSchema = new Schema<ITodo>({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt/updatedAt fields
});

// C. Create Model (For database operations)
export default model<ITodo>('Todo', TodoSchema, 'TodoCollection');