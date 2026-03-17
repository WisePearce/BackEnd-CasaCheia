import db from "../infra/db.js"
import mongoose from "mongoose"
import categoryModel from "./categoryModel.js"
import partner from './partnersModel.js';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: categoryModel,
        required: true
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: partner,
      required: true
    },
    stock: {
        type: Number,
        required: true
    },
    image: {
        type: [String],
        required: false
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true }
)

export default mongoose.model("product", productSchema)