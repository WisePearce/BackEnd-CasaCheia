import { productValidation } from "../config/validation.js";
import productSchema from "../models/productModel.js";
export { productValidation } from "../config/validation.js"
import mongoose from "mongoose";

const createProduct = async (req, res) => {
    try {
        const product = req.body

        //validar os dados vindo do formulario
        const { error, value } = await productValidation.validate(product)

        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details[0]
            })
        }

        const productName = product.name

        //ver se ja existe um produto com este mesmo nome
        const verifyProduct = await productSchema.findOne({ name: productName })
        if (verifyProduct) {
            return res.status(401).json({
                status: false,
                message: "Ja existe um produto com este mesmo nome, informe outro nome por favor"
            })
        }

        //verificar se existe alguma imagem do produto
        if(req.file) {
            product.image = `/uploads/product/${req.file.filename}`
        }

        //cadastrar novo produto
        const newProduct = await productSchema.create(product)

        if (!newProduct) {
            return res.status(401).json({
                status: false,
                message: "insercao de produto mal sucessida"
            })
        }
        return res.status(201).json({
            status: true,
            message: "produto cadastro com sucesso!"
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}
const showAll = async (req, res) => {
    try {
        const allProducts = await productSchema.find()
        if (!allProducts) {
            return res.status(404).json({
                status: false,
                message: "Nenhum Produto encontrado!"
            })
        }
        return res.status(200).json(allProducts)
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id

        //buscar e deletar produto
        const deleteProduct = await productSchema.findByIdAndDelete({ _id: id })
        if (!deleteProduct) {
            return res.status(404).json({
                status: false,
                message: "falha ao eliminar produto, produto nao existe"
            })
        }
        return res.status(201).json({
            status: true,
            message: "produto eliminado com sucesso!"
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "referencia do produto invalido, falha ao eliminar produto"
        })
    }
}

const searchProduct = async (req, res) => {
    try {
        const name = req.params.name

        const productName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

        //buscar produto pelo nome
        const findProductByName = await productSchema.findOne({ name: productName })
        if (!findProductByName) {
            return res.status(404).json({
                status: false,
                message: "Produto nao encontrado!"
            })
        }
        return res.status(201).json(findProductByName)
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

export { createProduct, showAll, deleteProduct, searchProduct }