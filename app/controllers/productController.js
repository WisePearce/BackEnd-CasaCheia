import productSchema from "../models/productModel.js";
import mongoose from "mongoose";

const createProduct = async (req, res) => {
    try {
        const product = req.body
        const newProduct = await productSchema.create(product)
        if(!newProduct){
            return res.status(401).json({
                status: false,
                message: "insercao de produto mal sucessida"
            })
        }
        return res.status(201).json({
            status: true,
            message: "produto cadastro realizado com sucesso!"
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

export default createProduct