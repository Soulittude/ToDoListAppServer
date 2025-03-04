import { Document, Schema, model } from 'mongoose';

interface ITodo extends Document {
  title: string;
  description?: string;
  completed: boolean;
}

const TodoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
});

export default model<ITodo>('Todo', TodoSchema);