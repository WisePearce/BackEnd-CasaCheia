import db from "../infra/db.js"
import mongoose from "mongoose"
import categoryModel from "./categorieModel.js"

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
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