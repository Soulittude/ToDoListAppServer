import mongoose, { Document, Model, Schema, model } from 'mongoose';
import cron from 'node-cron';

export interface ITodo extends Document {
    _id: mongoose.Types.ObjectId;
    text: string;
    completed: boolean;
    user: mongoose.Types.ObjectId;
    date?: Date; // Unified date field
    recurrence?: 'daily' | 'weekly'; // Remove 'none'
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
    date: {
        type: Date,
        index: true
    },
    recurrence: {
        type: String,
        enum: ['daily', 'weekly'], // Remove 'none'
        default: undefined // No default
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
            delete ret.id; // Remove duplicate ID
            return ret;
        }
    }
});

TodoSchema.index({ user: 1, date: 1 }); // For faster user-specific date queries
TodoSchema.index({ originalTodo: 1 }); // For tracking recurring instances

// Add cron job initialization here
TodoSchema.statics.reorderTodos = async function (userId: string, ids: string[]) {
    // ... existing reorder implementation
};

// Initialize cron jobs after model definition
const Todo = model<ITodo, ITodoModel>('Todo', TodoSchema, 'todos');

// Daily cleanup job (runs at midnight)
// Fix cleanup job
// Update cleanup job to use UTC
cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 1);
    cutoffDate.setUTCHours(0, 0, 0, 0);

    console.log('Daily cleanup running for todos before:', cutoffDate.toISOString());

    const result = await Todo.deleteMany({
        recurrence: { $exists: false },
        completed: true,
        date: { $lt: cutoffDate },
        isRecurringInstance: { $ne: true }
    });

    console.log('Cleanup completed. Removed', result.deletedCount, 'todos');
});

// Recurrence generator (runs every hour)
cron.schedule('0 * * * *', async () => {
    console.log('Hourly recurrence check started...');
    const now = new Date();

    const recurringTodos = await Todo.find({
        recurrence: { $exists: true }, // Changed from checking 'none'
        $or: [
            { nextRecurrence: { $lte: now } },
            { nextRecurrence: { $exists: false } }
        ]
    });

    for (const todo of recurringTodos) {
        const newDate = calculateNextRecurrence(todo);

        await Todo.create({
            text: todo.text,
            date: newDate,
            recurrence: todo.recurrence,
            originalTodo: todo._id,
            isRecurringInstance: true,
            user: todo.user,
            order: await Todo.countDocuments({ user: todo.user }) // New items at end
        });

        todo.nextRecurrence = calculateNextRecurrence(todo, newDate);
        await todo.save();
    }
});

function calculateNextRecurrence(todo: ITodo, currentDate?: Date) {
    const date = currentDate || todo.date || new Date();
    const newDate = new Date(date);

    // Reset time to midnight UTC for consistent scheduling
    newDate.setUTCHours(0, 0, 0, 0);

    switch (todo.recurrence) {
        case 'daily':
            newDate.setUTCDate(newDate.getUTCDate() + 1);
            break;
        case 'weekly':
            newDate.setUTCDate(newDate.getUTCDate() + 7); // Fixed weekly increment
            break;
    }

    return newDate;
}

export default Todo;