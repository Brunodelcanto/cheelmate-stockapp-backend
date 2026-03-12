import mongoose, { Schema, Document } from 'mongoose';

// Interface principal
export interface Category extends Document {
    name: string,
    isActive: boolean
}

// Schema con validaciones
const CategorySchema = new Schema<Category>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model<Category>("Category", CategorySchema);

export default Category;