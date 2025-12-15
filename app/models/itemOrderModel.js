import mongoose from 'mongoose'

const itemsOrderSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sku: { type: String, required: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('itemsOrder', itemsOrderSchema, 'itemsorders');