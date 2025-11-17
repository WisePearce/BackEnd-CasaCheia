import mongoose from 'mongoose';
const paymentMethodSchema = new mongoose.Schema({
    type: {
        payment: {
            type: String,
            required: true,
            enum: ['cashOnDelivery', 'express'],
            default: 'cashOnDelivery'
        } ,
        status: {
            type: String,
            required: true,
            enum: ['pending', 'complete', 'cancelled'],
            default: 'pending'
        },
        description: {
            type: String,
            required: false
        }
    }
}, { timestamps: true })

export default mongoose.model('paymentMethod', paymentMethodSchema);