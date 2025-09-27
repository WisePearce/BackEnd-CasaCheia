import {hash_password} from "../config/passwordHash.js";
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
    telefone: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 9
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true})



//Middleware para hash da senha
userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next()

  try {
    this.password = await hash_password(this.password) // usa a tua função
    next()
  } catch (err) {
    next(err)
  }
})


export default mongoose.model("User", userSchema)