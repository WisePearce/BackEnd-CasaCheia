import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true,
    min: [-90, 'Latitude mínima é -90'],
    max: [90, 'Latitude máxima é 90']
  },
  longitude: {
    type: Number,
    required: true,
    min: [-180, 'Longitude mínima é -180'],
    max: [180, 'Longitude máxima é 180']
  }
}, {
  timestamps: true,
});

export default mongoose.model('Store', storeSchema);