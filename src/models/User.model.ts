import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

export default model<IUser>('User', UserSchema);