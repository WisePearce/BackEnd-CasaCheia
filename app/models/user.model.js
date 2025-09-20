import Joi from "joi";
import hash_password from "../config/password.hash.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "E-mail inválido"]
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true})


//Middleware para hash da senha
userSchema.pre("save", hash_password)

//gerar TOKEN JWT
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        {id: this._id, role: this.role},
        process.env.JWT_KEY || "minhaChaveSecretaGuardada",
        {expiresIn: "20min"}
    )
}

export default mongoose.model("User", userSchema)