import mongoose from 'mongoose';

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
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude mínima é -90'],
        max: [90, 'Latitude máxima é 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude mínima é -180'],
        max: [180, 'Longitude máxima é 180']
      }
    }
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

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);