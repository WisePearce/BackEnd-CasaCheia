import { productValidation } from "../config/validation.js";
import productSchema from "../models/productModel.js";
export { productValidation } from "../config/validation.js"
import productUpdateValidation from "../config/productUpdateSchema.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { uploadToImgBB } from "../config/multer/productUploads.js";
import partnerSchema from "../models/partnersModel.js";
import categorySchema from "../models/categoryModel.js";
dotenv.config()
const createProduct = async (req, res) => {
  try {
    const data = req.body

    let images = null
    if (process.env.NODE_ENV === "production") {
      const uploadPromises = req.files.map(file => uploadToImgBB(file));
      images = await Promise.all(uploadPromises);
    } else {
      images = req.files.map(file => file.path)
    }
    const isProduction = process.env.NODE_ENV === "production"

    //validar os dados vindo do formulario
    const { error, value } = productValidation.validate(data)

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0]
      })
    }

    //validar o id do partner
    if (!mongoose.Types.ObjectId.isValid(value.partner)) {
      return res.status(400).json({
        status: false,
        message: "O formato do ID do partner (fornecedor) é inválido."
      });
    }

        //validar o id da categoria
    if (!mongoose.Types.ObjectId.isValid(value.category)) {
      return res.status(400).json({
        status: false,
        message: "O formato do ID da Categoria é inválido."
      });
    }

    //dados validados
    const product = value

    const verifyProduct = await productSchema.findOne({ name: product.name })

    //ver se ja existe um produto com este mesmo nome
    if (verifyProduct) {
      return res.status(404).json({
        status: false,
        message: "Ja existe um produto com este mesmo nome, informe outro nome por favor"
      })
    }
    //verificar se o partner(parceiro) realmente existe
    const verifyPartner = await partnerSchema.findOne({ _id: product.partner })

    if (!verifyPartner) {
      return res.status(404).json({
        status: false,
        message: "partner(fornecedor) não encontrado"
      })
    }

    //verificar se a categoria realmente existe
    const verifyCategory = await categorySchema.findOne({ _id: product.category })
    if (!verifyCategory) {
      return res.status(404).json({
        status: false,
        message: "Categoria não encontrada"
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
    if (error.code === "LIMITED_UNEXPECTED_FILE") {
      return res.status(400).json({
        status: false,
        message: "Limite de upload de imagens excedido"
      })
    }
    console.log("teste: ",error)
    return res.status(500).json({
      status: false,
      message: "Erro no Servidor, Nao foi possivel cadastrar o produto, contacte o suporte!"
    })
  }
}

const showAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allProducts = await productSchema.find()
      .populate('category', 'name description') // Traz nome e descrição da categoria
      .populate('partner', 'name email nif')     // Traz dados essenciais do parceiro
      .skip(skip) // Adicionei a variável skip aqui
      .limit(limit);

      console.log("Angola teste: ", allProducts);

    const formatted = allProducts.map(p => ({
      ...p.toObject(),
      price: parseFloat(p.price.toString())
    }));

    const totalProducts = await productSchema.countDocuments();

    return res.status(200).json({
      products: formatted,
      pagina_atual: page,
      total_paginas: Math.ceil(totalProducts / limit),
      total_produtos: totalProducts
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id
    if (id === null || mongoose.Types.ObjectId.isValid(id) === false) {
      return res.status(400).json({
        status: false,
        message: "ID do produto inválido."
      })
    }

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
    console.log(error.message)
    return res.status(500).json({
      status: false,
      message: "referencia do produto invalido, falha ao eliminar produto"
    })
  }
}


const searchProduct = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.trim() === "") {
      return res.status(400).json({ status: false, message: "O nome é obrigatório." });
    }

    const productName = new RegExp(name, "i");

    const findProductByName = await productSchema.find({ name: { $regex: productName } })
      .populate('category', 'name') // Essencial para o front-end saber a categoria
      .populate('partner', 'name phone');

        console.log("Angola teste: ",findProductByName);

    if (findProductByName.length === 0) {
      return res.status(404).json({ status: false, message: "Produto não encontrado!" });
    }

    // Formatar o preço para Decimal caso necessário
    const formatted = findProductByName.map(p => ({
      ...p.toObject(),
      price: parseFloat(p.price.toString())
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}


const updateProduct = async (req, res) => {
  try {
    const id = req.params.id
    const productData = req.body
    let images = req.files
    if (!(images === undefined || images === null)) {
      if (process.env.NODE_ENV === "production") {
        images = req.files.map(file => file.path)
      } else {
        images = req.files.map(file => file.filename)
      }
    }

    //verificar id
    if (id === null || id === undefined || id === "") {
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
    const { error, value } = productUpdateValidation.validate(productData)

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0]
      });
    }
    //dados validados
    if (value.name !== undefined) dados.name = value.name
    if (value.price !== undefined) dados.price = value.price
    if (value.category !== undefined) dados.category = value.category
    if (value.stock !== undefined) dados.stock = value.stock
    if (value.description !== undefined) dados.description = value.description
    //adicionar a imagem ao produto

    if (!(images === undefined || images === null)) {
      //limitar quantidade de imagens
      if (images.length > 4) {
        return res.status(400).json({
          status: false,
          messages: "excedeu o limite maximo de imagens por produto, o limite deve ser 4 imagens"
        })
      }
      if (images) {
        dados.image = images
      }
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

const productPaginaction = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await productSchema.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('category', 'name') // Essencial para o front-end saber a categoria
      .populate('partner', 'name phone')
      .exec();

  
      console.log("teste: ", products)

    const formatted = products.map(p => ({
      ...p.toObject(),
      price: parseFloat(p.price.toString())
    }))

    const count = await productSchema.countDocuments();

    res.status(200).json({
      formatted,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      status: false,
      message: "Erro no Servidor, Nao foi possivel buscar os produtos, contacte o suporte!"
    });
  }
}

const showById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "ID inválido." });
    }

    const product = await productSchema.findById(id)
      .populate('category') // Traz todos os campos da categoria
      .populate('partner');  // Traz todos os campos do parceiro

      console.log("teste: ", product)

    if (!product) {
      return res.status(404).json({ status: false, message: "Produto não encontrado." });
    }

    const formattedProduct = {
      ...product.toObject(),
      price: parseFloat(product.price.toString())
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

export { createProduct, showAll, deleteProduct, searchProduct, updateProduct, productPaginaction, showById }