import mongoose from 'mongoose'
import User from '../models/userModel.js'
import product from '../models/productModel.js'

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,                 // Índice para buscas rápidas
    },
    items: [{
        product: {                   // Nome mais claro
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantidade mínima é 1'],
            default: 1,
        },
        priceAtAdd: {                // Snapshot explícito
            type: Number,
            required: true,
            min: [0, 'Preço não pode ser negativo'],
        }
    }],
    totalAmount: {                 // Nome mais claro que "bill"
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
    // Garante um carrinho por usuário
    // (opcional: use upsert no controller)
});

// Índice composto para garantir unicidade por usuário
cartSchema.index({ user: 1 }, { unique: true });

// Middleware: recalcula total sempre
cartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
    next();
});

export default mongoose.model('Cart', cartSchema);