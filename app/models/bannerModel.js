import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  images: {
    type: [String],
    required: true,
    validate: {
      validator: (val) => val.length >= 1 && val.length <= 4,
      message: 'O banner deve ter entre 1 e 4 imagens',
    },
  },
  description: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Banner', bannerSchema);