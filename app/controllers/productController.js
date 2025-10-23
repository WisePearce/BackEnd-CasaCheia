import { productValidation } from "../config/validation.js";
import productSchema from "../models/productModel.js";
export { productValidation } from "../config/validation.js"
import productUpdateValidation from "../config/productUpdateSchema.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary/cloudinary.js"

const createProduct = async (req, res) => {
    try {
        const data = req.body
        const images = req.files ? req.files.map(file => file.filename) : []
        
        const isProduction = process.env.NODE_ENV === "production"

        //caso nao tenha imagems
        if(images.length === 0){
            return res.status(400).json({
                status: false,
                message: "precisa carregar pelo menos uma foto do produto"
            })
        }

        //caso exceda o limite de imagens por produto
        if(images.length > 4) {
            return res.status(400).json({
                status: false,
                messages: "excedeu o limite maximo de imagens por produto, o limite deve ser 4 imagens"
            })
        }

        //validar os dados vindo do formulario
        const { error, value } = await productValidation.validate(data)
        
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details[0]
            })
        }
        //dados validados
        const product = value

        const verifyProduct = await productSchema.findOne({ name: product.name })
        
        //ver se ja existe um produto com este mesmo nome
        if (verifyProduct) {
            return res.status(401).json({
                status: false,
                message: "Ja existe um produto com este mesmo nome, informe outro nome por favor"
            })
        }
        //adicionar a imagem ao produto
        product.image = images

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
        console.log(error.message)
        if(error.code === "LIMITED_UNEXPECTED_FILE"){
            return res.status(400).json({
                status: false,
                message: "Limite de upload de imagens excedido"
            })  
        }
        return res.status(500).json({
            status: false,
            message: "Erro no Servidor, Nao foi possivel cadastrar o produto, contacte o suporte!"
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
        const deleteProduct = await productSchema.findByIdAndDelete({ _id: id})
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
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: "referencia do produto invalido, falha ao eliminar produto"
        })
    }
}

const searchProduct = async (req, res) => {
    try {
        const { name } = req.query

        const productName = new RegExp(name, "i")

        //buscar produto pelo nome
        const findProductByName = await productSchema.find({ name: { $regex: productName} })

        if (findProductByName.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Produto nao encontrado!"
            })
        }
        //retornar o produto encontrado
        return res.status(201).json(findProductByName)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: "Erro no Servidor, Nao foi possivel buscar o produto, contacte o suporte!"
        })
    }
}

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id
        const productData = req.body
        const images = req.files ? req.files.map(file => file.filename) : []
        
        //limitar quantidade de imagens
        if(images.length > 4) {
            return res.status(400).json({
                status: false,
                messages: "excedeu o limite maximo de imagens por produto, o limite deve ser 4 imagens"
            })
        }

        //verificar id
        if(id === null || id === undefined || id === ""){
            return res.status(400).json({
                status: false,
                message: "ID do produto é obrigatório."
            })
        }
        //buscar produto pelo id
        const dados = await productSchema.findById({ _id: id })

        if (!dados) {
            return res.status(404).json({
                status: false,
                message: "Produto não encontrado."
            })
        }
        //validar os dados vindo do formulario
        const { error, value } = await productUpdateValidation.validate(productData)

        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details[0]
            })
        }
        //dados validados
       if (value.name !== undefined) dados.name = value.name
       if (value.price !== undefined) dados.price = value.price
       if (value.category !== undefined) dados.category = value.category
       if (value.stock !== undefined) dados.stock = value.stock
       if (value.description !== undefined) dados.description = value.description
        //adicionar a imagem ao produto
        if (images) {
            dados.image = images
        }

        const updatedProduct = await dados.save()

        if (!updatedProduct) {
            return res.status(401).json({
                status: false,
                message: "atualizacao de produto mal sucessida"
            })
        }
        return res.status(201).json({
            status: true,
            message: "produto atualizado com sucesso!"
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: "Erro no Servidor, Nao foi possivel atualizar o produto, contacte o suporte!"
        })
    }
}

export { createProduct, showAll, deleteProduct, searchProduct, updateProduct }