import mongoose from "mongoose";
import db from "../infra/db.js"

const categorySchema = new mongoose.model("category", {
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    }
}, {timestamps: true}
)

export default categorySchema