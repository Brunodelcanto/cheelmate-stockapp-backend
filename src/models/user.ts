import mongoose, { Document, Schema} from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'vendedor';
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<User>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'vendedor'], default: 'admin' },
    },
    {
        timestamps: true
    }
)

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre('save', async function(){
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw error;
    }
})

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model<User>("User", UserSchema);
export default User;
