import mongoose from 'mongoose'
import UserModel from "./userModel.js";
import { required } from 'joi';

const shippingSchema = new mongoose.Schema({
    contactName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    street: {
        type: String,
        requiered: true
    },
    cordenadas: {
        type: String,
        required: true,
        
    }
}, { timestamps: true });

export default mongoose.model('shippingAdress', shippingSchema);