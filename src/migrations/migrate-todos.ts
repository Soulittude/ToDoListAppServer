import mongoose from 'mongoose';
import Todo from '../models/Todo.model';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            retryWrites: true,
            w: "majority"
        });
        console.log('Connected to MongoDB');

        // 1. Migrate Date Fields
        await migrateDateFields();

        // 2. Cleanup Recurrence Values
        await cleanupRecurrence();

        // 3. Remove Duplicate ID Fields
        await removeDuplicateIds();

        // 4. Initialize Order Values
        await initializeOrderValues();

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

async function migrateDateFields() {
    // Move dueDate/specificDate to date field
    await Todo.updateMany(
        {
            $or: [
                { dueDate: { $exists: true } },
                { specificDate: { $exists: true } }
            ]
        },
        [
            { $set: { date: { $ifNull: ["$dueDate", "$specificDate"] } } },
            { $unset: ["dueDate", "specificDate"] }
        ]
    ).exec();
    console.log('Migrated date fields');
}

async function cleanupRecurrence() {
    // Remove 'none' values and unset recurrence where needed
    await Todo.updateMany(
        { recurrence: 'none' },
        { $unset: { recurrence: "" } }
    ).exec();
    console.log('Cleaned up recurrence values');
}

async function removeDuplicateIds() {
    // Remove virtual 'id' field from existing documents
    await Todo.updateMany(
        { id: { $exists: true } },
        { $unset: { id: "" } }
    ).exec();
    console.log('Removed duplicate ID fields');
}

async function initializeOrderValues() {
    // Set order=0 for documents missing order
    await Todo.updateMany(
        { order: { $exists: false } },
        { $set: { order: 0 } }
    ).exec();
    console.log('Initialized order values');
}

migrate();