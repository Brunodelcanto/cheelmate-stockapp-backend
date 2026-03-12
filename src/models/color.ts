import mongoose, { Schema, Document } from 'mongoose';

// Interface principal
export interface Color extends Document {
    name: string;
    hex: string;
    isActive: boolean;
}

// Schema con validaciones
const ColorSchema = new Schema<Color>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        hex: { type: String, required: true, unique: true, trim: true}, // codigo hex para la paleta visual
        isActive: { type: Boolean, default: true}
    },
    {
        timestamps: true
    }
);

const Color = mongoose.model<Color>("Color", ColorSchema);

export default Color;