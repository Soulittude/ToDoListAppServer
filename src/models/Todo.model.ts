import mongoose, { Document, Model, Schema, model } from 'mongoose';
import cron from 'node-cron';

export interface ITodo extends Document {
    _id: mongoose.Types.ObjectId;
    text: string;
    completed: boolean;
    user: mongoose.Types.ObjectId;
    dueDate?: Date;
    recurrence?: 'daily' | 'weekly' | 'none';
    originalTodo?: mongoose.Types.ObjectId;
    isRecurringInstance?: boolean;
    nextRecurrence?: Date;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ITodoModel extends Model<ITodo> {
    reorderTodos(userId: string, ids: string[]): Promise<void>;
}

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
    dueDate: Date,
    recurrence: {
        type: String,
        enum: ['daily', 'weekly', 'none'],
        default: 'none'
    },
    originalTodo: {
        type: Schema.Types.ObjectId,
        ref: 'Todo'
    },
    isRecurringInstance: {
        type: Boolean,
        default: false
    },
    nextRecurrence: Date,
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

// Add cron job initialization here
TodoSchema.statics.reorderTodos = async function (userId: string, ids: string[]) {
    // ... existing reorder implementation
};

// Initialize cron jobs after model definition
const Todo = model<ITodo, ITodoModel>('Todo', TodoSchema, 'todos');

// Daily cleanup job (runs at midnight)
cron.schedule('0 0 * * *', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await Todo.deleteMany({
        recurrence: 'none',
        completed: true,
        dueDate: { $lt: yesterday },
        isRecurringInstance: { $ne: true }
    });
});

// Recurrence generator (runs every hour)
cron.schedule('0 * * * *', async () => {
    const now = new Date();

    const recurringTodos = await Todo.find({
        recurrence: { $ne: 'none' },
        $or: [
            { nextRecurrence: { $lte: now } },
            { nextRecurrence: { $exists: false } }
        ]
    });

    for (const todo of recurringTodos) {
        const newDueDate = calculateNextRecurrence(todo);

        await Todo.create({
            text: todo.text,
            dueDate: newDueDate,
            recurrence: todo.recurrence,
            originalTodo: todo._id,
            isRecurringInstance: true,
            user: todo.user,
            order: todo.order
        });

        todo.nextRecurrence = calculateNextRecurrence(todo, newDueDate);
        await todo.save();
    }
});

function calculateNextRecurrence(todo: ITodo, currentDate?: Date) {
    const date = currentDate || todo.dueDate || new Date();
    const newDate = new Date(date);

    switch (todo.recurrence) {
        case 'daily':
            newDate.setDate(newDate.getDate() + 1);
            break;
        case 'weekly':
            newDate.setDate(newDate.getDate() + 7);
            break;
    }

    return newDate;
}

export default Todo;