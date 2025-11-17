import mongoose from 'mongoose'
import UserModel from "./userModel.js";

const shippingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export default mongoose.model('shippingAdress', shippingSchema);