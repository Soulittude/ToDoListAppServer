import mongoose, { Document, Model, Schema, model } from 'mongoose';

// 1. Define Document Interface with explicit _id
export interface ITodo extends Document {
    _id: mongoose.Types.ObjectId; // Explicit _id definition
    text: string;
    completed: boolean;
    user: mongoose.Types.ObjectId;
    dueDate?: Date;
    recurrence?: 'daily' | 'weekly';
    nextOccurrence?: Date | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Define Static Methods Interface
interface ITodoModel extends Model<ITodo> {
    reorderTodos(userId: string, ids: string[]): Promise<void>;
}

// 3. Schema definition remains the same
const TodoSchema = new Schema<ITodo>({
    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 500
    },
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        index: true // For faster querying
    },
    recurrence: {
        type: String,
        enum: ['daily', 'weekly'],
        default: null
    },
    nextOccurrence: {
        type: Date,
        default: null
    },
    order: {
        type: Number,
        default: 0,
        index: true
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// 4. Update the reorderTodos method with proper typing
TodoSchema.statics.reorderTodos = async function (userId: string, ids: string[]) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const todos: ITodo[] = await this.find({ user: userId }).session(session);
        const idMap = new Map(ids.map((id, index) => [id, index]));

        const bulkOps = todos.map((todo) => ({
            updateOne: {
                filter: { _id: todo._id },
                update: {
                    $set: {
                        order: idMap.get(todo._id.toString()) || 0
                    }
                }
            }
        }));

        await this.bulkWrite(bulkOps, { session });
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// 5. Create Model
const Todo = model<ITodo, ITodoModel>('Todo', TodoSchema, 'todos');
export default Todo;