import mongoose, {Schema, Document, Types} from 'mongoose';

interface ColorVariant {
    color: Types.ObjectId; // Referencia al Color
    amount: number; 
    priceCost: number;
    priceSell: number;
}

export interface Product extends Document {
    name: string;
    category: Types.ObjectId; // Referencia a la categoría
    variants: ColorVariant[]; // Array de variantes de color
    minStockAlert: number;
    isActive: boolean;
    image: {
        url: string;
        public_id: string;
    };
}

// Schema con validaciones
const ProductSchema = new Schema<Product>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true},
        variants: [{
            color: { type: Schema.Types.ObjectId, ref: 'Color', required: true },
            amount: { type: Number, required: true, min: 0 },
            priceCost: { type: Number, required: true, min: 0 },
            priceSell: { type: Number, required: true, min: 0 }
        }],
        minStockAlert: { type: Number, required: true, min: 0, default: 5 },
        isActive: { type: Boolean, default: true },
        image: {
            url: { type: String, required: true },
            public_id: { type: String, required: true }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, // Para incluir virtuals en la salida JSON
        toObject: { virtuals: true } // Para incluir virtuals en la salida de objetos
    }
);

// Virtual para calcular la ganancia total estimada del stock
ProductSchema.virtual('totalProfit').get(function() {
    return this.variants.reduce((acc, v) => acc + (v.priceSell - v.priceCost) * v.amount, 0);
});

const Product = mongoose.model<Product>("Product", ProductSchema);
export default Product;
