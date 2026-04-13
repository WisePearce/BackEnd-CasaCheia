import { partnerValidation, partnerUpdateValidation } from "../config/validation.js";
import partnerSchema from "../models/partnersModel.js";
import mongoose from "mongoose";
import { uploadToImgBB } from "../config/multer/productUploads.js";

const getImages = async (files) => {
  if (!files || files.length === 0) return null;
  if (process.env.NODE_ENV === "production") {
    return await Promise.all(files.map((file) => uploadToImgBB(file)));
  }
  return files.map((file) => file.filename);
};

const parseBodyFields = (body, fields) => {
  fields.forEach((field) => {
    if (body[field] && typeof body[field] === "string") {
      try {
        body[field] = JSON.parse(body[field]);
      } catch {
        throw new Error(`Formato inválido para o campo ${field}.`);
      }
    }
  });
};

const partnerPipeline = [
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "partner",
      as: "products",
    },
  },
  {
    $addFields: {
      totalProducts: { $size: "$products" },
    },
  },
  {
    $project: {
      name: 1,
      email: 1,
      nif: 1,
      phone: 1,
      status: 1,
      images: 1,
      address: 1,
      createdAt: 1,
      totalProducts: 1,
      products: {
        $map: {
          input: "$products",
          as: "p",
          in: {
            _id: "$$p._id",
            name: "$$p.name",
            price: "$$p.price",
            stock: "$$p.stock",
            image: "$$p.image",
            description: "$$p.description",
          },
        },
      },
    },
  },
];

export const createPartner = async (req, resp) => {
  try {
    try {
      parseBodyFields(req.body, ["address"]);
    } catch (err) {
      return resp.status(400).json({ status: false, message: err.message });
    }

    const { error, value } = partnerValidation.validate(req.body);
    if (error) {
      return resp.status(400).json({ status: false, message: error.details[0].message });
    }

    const partnerExists = await partnerSchema.findOne({
      $or: [{ email: value.email }, { nif: value.nif }],
    });
    if (partnerExists) {
      return resp.status(400).json({
        status: false,
        message: "Já existe um parceiro cadastrado com este E-mail ou NIF.",
      });
    }

    const images = await getImages(req.files);
    const partner = await partnerSchema.create({ ...value, images });

    return resp.status(201).json({
      status: true,
      message: "Parceiro cadastrado com sucesso!",
      data: partner,
    });
  } catch (error) {
    return resp.status(500).json({
      status: false,
      message: "Erro interno no servidor ao tentar cadastrar parceiro.",
    });
  }
};

export const getPartners = async (req, resp) => {
  try {
    const partners = await partnerSchema.aggregate([
      { $sort: { createdAt: -1 } },
      ...partnerPipeline,
    ]);

    return resp.status(200).json({
      status: true,
      count: partners.length,
      data: partners,
    });
  } catch (error) {
    return resp.status(500).json({ status: false, message: "Erro ao buscar parceiros." });
  }
};

export const getPartnerById = async (req, resp) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return resp.status(400).json({ status: false, message: "O formato do ID fornecido é inválido." });
    }

    const result = await partnerSchema.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...partnerPipeline,
    ]);

    if (!result.length) {
      return resp.status(404).json({ status: false, message: "Parceiro não encontrado." });
    }

    return resp.status(200).json({ status: true, data: result[0] });
  } catch (error) {
    return resp.status(500).json({ status: false, message: "Erro ao buscar o parceiro." });
  }
};

export const updatePartner = async (req, resp) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return resp.status(400).json({ status: false, message: "O formato do ID fornecido é inválido." });
    }

    const hasBody = Object.keys(req.body).length > 0;
    const hasFiles = req.files && req.files.length > 0;

    if (!hasBody && !hasFiles) {
      return resp.status(400).json({
        status: false,
        message: "Informe pelo menos um campo para atualizar.",
      });
    }

    let value = {};

    if (hasBody) {
      try {
        parseBodyFields(req.body, ["address"]);
      } catch (err) {
        return resp.status(400).json({ status: false, message: err.message });
      }

      const { error, value: result } = partnerUpdateValidation.validate(req.body);
      if (error) {
        return resp.status(400).json({ status: false, message: error.details[0].message });
      }
      value = result;
    }

    const images = await getImages(req.files);
    if (images) value.images = images;

    const updatedPartner = await partnerSchema.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!updatedPartner) {
      return resp.status(404).json({ status: false, message: "Parceiro não encontrado para atualização." });
    }

    return resp.status(200).json({
      status: true,
      message: "Dados do parceiro atualizados!",
      data: updatedPartner,
    });
  } catch (error) {
    if (error.code === 11000) {
      const campoDuplicado = Object.keys(error.keyPattern)[0];
      return resp.status(400).json({
        status: false,
        message: `Já existe um parceiro cadastrado com este ${campoDuplicado.toUpperCase()}.`,
      });
    }
    if (error.name === "CastError") {
      return resp.status(400).json({ status: false, message: "ID com formato incorreto." });
    }
    if (error.name === "ValidationError") {
      return resp.status(400).json({ status: false, message: error.message });
    }
    return resp.status(500).json({ status: false, message: "Ocorreu um erro interno no servidor." });
  }
};

export const togglePartner = async (req, resp) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return resp.status(400).json({ status: false, message: "ID inválido." });
    }

    const partner = await partnerSchema.findById(id);
    if (!partner) {
      return resp.status(404).json({ status: false, message: "Parceiro não encontrado." });
    }

    partner.status = partner.status === "active" ? "inactive" : "active";
    await partner.save();

    return resp.status(200).json({
      status: true,
      message: `Parceiro ${partner.status === "active" ? "ativado" : "desativado"} com sucesso.`,
      data: partner,
    });
  } catch (error) {
    return resp.status(500).json({ status: false, message: "Erro interno no servidor." });
  }
};

export const deletePartner = async (req, resp) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return resp.status(400).json({ status: false, message: "O formato do ID fornecido é inválido." });
    }

    const deleted = await partnerSchema.findByIdAndDelete(id);
    if (!deleted) {
      return resp.status(404).json({ status: false, message: "Parceiro não encontrado." });
    }

    return resp.status(200).json({ status: true, message: "Parceiro removido do sistema." });
  } catch (error) {
    return resp.status(500).json({ status: false, message: "Erro ao deletar parceiro." });
  }
};

export const searchPartners = async (req, resp) => {
  try {
    const { query } = req.query;
    if (!query) {
      return resp.status(400).json({ status: false, message: "Nome ou NIF de busca vazio." });
    }

    const regex = new RegExp(query, "i");

    const partners = await partnerSchema.aggregate([
      {
        $match: {
          $or: [{ name: { $regex: regex } }, { nif: { $regex: regex } }],
        },
      },
      ...partnerPipeline,
    ]);

    return resp.status(200).json({ status: true, count: partners.length, data: partners });
  } catch (error) {
    return resp.status(500).json({ status: false, message: "Erro na busca." });
  }
};