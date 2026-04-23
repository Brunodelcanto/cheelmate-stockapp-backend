import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISaleItem {
    productId: Types.ObjectId; // Referencia al producto
    variantId: Types.ObjectId; // El ID del color especifico vendido
    name: string;
    quantity: number;
    priceAtSale: number;
    priceCostAtSale: number;
}

export interface Sale extends Document {
    items: ISaleItem[]; // Array de productos vendidos
    totalAmount: number;
    totalProfit: number;
    customerName: string; // Nombre del cliente (opcional)
    comment?: string;
    createdAt: Date;
}

const SaleSchema = new Schema<Sale>(
    {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                variantId: { type: Schema.Types.ObjectId, ref: 'Color', required: true },
                name: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                priceAtSale: { type: Number, required: true, min: 0 },
                priceCostAtSale: { type: Number, required: true, min: 0 }
            }
        ],
        totalAmount: { type: Number, required: true},
        totalProfit: { type: Number, required: true },
        customerName: { type: String, trim: true },
        comment: { type: String, trim: true }
    },
    {
        timestamps: true //aunque usamos createdAt, esto nos da updatedAt por si editamos la nota
    }
);

const Sale = mongoose.model<Sale>("Sale", SaleSchema);
export default Sale;