import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true // Isto já cria um índice único automaticamente
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        // Se você não busca APENAS pelo usuário isoladamente com frequência, 
        // o índice composto abaixo já resolve.
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
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 }); // Busca pedidos de um user do mais novo ao mais antigo
orderSchema.index({ status: 1, createdAt: -1 }); // Filtra por status (ex: 'pending') por data

export default mongoose.model('Order', orderSchema);