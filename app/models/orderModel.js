import mongoose from 'mongoose'
const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shippingAddress: {
        contactName: String,
        phoneNumber: String,
        street: String,
        city: String,
        coordinates: String
    },
    discount: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod'
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null }
}, { timestamps: true})

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Order', orderSchema)