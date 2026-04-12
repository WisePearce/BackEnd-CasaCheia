import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome do parceiro é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'O email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    nif: {
      type: String,
      required: [true, 'O NIF é obrigatório'],
      unique: true,
      trim: true,
    },
    images: {
        type: [String],
        required: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    address: {
      street: String,
      city: { type: String, default: 'Luanda' },
      province: String,
    },
    phone: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true, // Cria automaticamente createdAt e updatedAt
  }
);

export default mongoose.model('Partner', partnerSchema);

