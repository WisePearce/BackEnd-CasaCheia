import { productValidation } from "../config/validation.js";
import productUpdateValidation from "../config/productUpdateSchema.js";
import productSchema from "../models/productModel.js";
import partnerSchema from "../models/partnersModel.js";
import categorySchema from "../models/categoryModel.js";
import { uploadToImgBB } from "../config/multer/productUploads.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const getImages = async (files) => {
  if (!files || files.length === 0) return null;
  if (process.env.NODE_ENV === "production") {
    return await Promise.all(files.map((file) => uploadToImgBB(file)));
  }
  return files.map((file) => file.filename);
};

const createProduct = async (req, res) => {
  try {
    const { error, value } = productValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: error.details[0].message });
    }

    if (!mongoose.Types.ObjectId.isValid(value.partner)) {
      return res.status(400).json({ status: false, message: "ID do parceiro inválido." });
    }

    if (!mongoose.Types.ObjectId.isValid(value.category)) {
      return res.status(400).json({ status: false, message: "ID da categoria inválido." });
    }

    const [productExists, partnerExists, categoryExists] = await Promise.all([
      productSchema.findOne({ name: value.name }),
      partnerSchema.findById(value.partner),
      categorySchema.findById(value.category),
    ]);

    if (productExists) {
      return res.status(400).json({ status: false, message: "Já existe um produto com este nome." });
    }
    if (!partnerExists) {
      return res.status(404).json({ status: false, message: "Parceiro não encontrado." });
    }
    if (!categoryExists) {
      return res.status(404).json({ status: false, message: "Categoria não encontrada." });
    }

    const images = await getImages(req.files);
    value.image = images;

    const newProduct = await productSchema.create(value);

    return res.status(201).json({
      status: true,
      message: "Produto cadastrado com sucesso!",
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Erro no servidor. Não foi possível cadastrar o produto.",
    });
  }
};

const showAll = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productSchema
        .find()
        .populate("category", "name description")
        .populate("partner", "name email nif images")
        .skip(skip)
        .limit(limit),
      productSchema.countDocuments(),
    ]);

    const formatted = products.map((p) => ({
      ...p.toObject(),
      price: parseFloat(p.price.toString()),
    }));

    return res.status(200).json({
      status: true,
      data: formatted,
      pagina_atual: page,
      total_paginas: Math.ceil(total / limit),
      total_produtos: total,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const showById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "ID inválido." });
    }

    const product = await productSchema
      .findById(id)
      .populate("category")
      .populate("partner");

    if (!product) {
      return res.status(404).json({ status: false, message: "Produto não encontrado." });
    }

    return res.status(200).json({
      status: true,
      data: {
        ...product.toObject(),
        price: parseFloat(product.price.toString()),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ status: false, message: "O nome é obrigatório." });
    }

    const products = await productSchema
      .find({ name: { $regex: new RegExp(name, "i") } })
      .populate("category", "name")
      .populate("partner", "name phone images");

    if (products.length === 0) {
      return res.status(404).json({ status: false, message: "Produto não encontrado." });
    }

    const formatted = products.map((p) => ({
      ...p.toObject(),
      price: parseFloat(p.price.toString()),
    }));

    return res.status(200).json({ status: true, count: formatted.length, data: formatted });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "ID do produto inválido." });
    }

    const hasBody = Object.keys(req.body).length > 0;
    const hasFiles = req.files && req.files.length > 0;

    if (!hasBody && !hasFiles) {
      return res.status(400).json({ status: false, message: "Informe pelo menos um campo para atualizar." });
    }

    const product = await productSchema.findById(id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Produto não encontrado." });
    }

    if (hasBody) {
      const { error, value } = productUpdateValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ status: false, message: error.details[0].message });
      }

      if (value.partner && !mongoose.Types.ObjectId.isValid(value.partner)) {
        return res.status(400).json({ status: false, message: "ID do parceiro inválido." });
      }

      if (value.category && !mongoose.Types.ObjectId.isValid(value.category)) {
        return res.status(400).json({ status: false, message: "ID da categoria inválido." });
      }

      if (value.name !== undefined) product.name = value.name;
      if (value.price !== undefined) product.price = value.price;
      if (value.category !== undefined) product.category = value.category;
      if (value.stock !== undefined) product.stock = value.stock;
      if (value.partner !== undefined) product.partner = value.partner;
      if (value.description !== undefined) product.description = value.description;
    }

    const images = await getImages(req.files);
    if (images) product.image = images;

    await product.save();

    return res.status(200).json({
      status: true,
      message: "Produto atualizado com sucesso!",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Erro no servidor. Não foi possível atualizar o produto.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "ID do produto inválido." });
    }

    const deleted = await productSchema.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Produto não encontrado." });
    }

    return res.status(200).json({ status: true, message: "Produto eliminado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Erro ao eliminar produto." });
  }
};

export { createProduct, showAll, showById, searchProduct, updateProduct, deleteProduct };