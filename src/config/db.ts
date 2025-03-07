import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        // Required for Mongoose 7+ in TypeScript
        mongoose.set('strictQuery', true);

        await mongoose.connect(process.env.MONGO_URI!);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Connection Error:', error);
        process.exit(1);
    }
};

export default connectDB;