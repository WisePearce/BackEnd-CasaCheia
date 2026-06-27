import mongoose from 'mongoose';
import User from './userModel';

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['new_order', 'new_product', 'promotion'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

//indice para fazer busca mais rapida

notificationSchema.index({ user: 1, createdAt: -1});

export default mongoose.model('Notification', notificationSchema);