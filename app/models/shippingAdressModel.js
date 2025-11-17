import mongoose from 'mongoose'
import UserModel from "./userModel.js";

const shippingSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        unique: true,
    },
    cordenadas: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export default mongoose.model('shippingAdress', shippingSchema);