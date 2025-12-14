import mongoose from 'mongoose';
const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    method: {
        type: String,
        required: true,
        enum: ['tpa', 'express', 'transferencia'],
        default: 'tpa'
    } ,
    status: {
        type: String,
        required: true,
        enum: ['pending', 'complete', 'cancelled'],
        default: 'pending'
    },
    description: {
        type: String,
        required: false,
        optional: true
    }
}, { timestamps: true });

export default mongoose.model('paymentMethod', paymentMethodSchema);