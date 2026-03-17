import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Substitui o 'index: true' e garante um carrinho único por user
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product', // Certifique-se que o nome do modelo exportado é 'product' (minúsculo)
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantidade mínima é 1'],
      default: 1,
    },
    priceAtAdd: {
      type: Number,
      required: true,
      min: [0, 'Preço não pode ser negativo'],
    }
  }],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});


cartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  next();
});

export default mongoose.model('Cart', cartSchema);