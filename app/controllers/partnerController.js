import { partnerValidation, partnerUpdateValidation } from "../config/validation.js";
import partnerSchema from "../models/partnersModel.js";
import mongoose from "mongoose";
// Criar novo parceiro
export const createPartner = async (req, resp) => {
  try {
    // 1. Validar os dados de entrada com Joi
    const { error, value } = partnerValidation.validate(req.body);

    if (error) {
      return resp.status(400).json({
        status: false,
        message: error.details[0].message
      });
    }

    // 2. Verificar duplicidade (E-mail ou NIF)
    const partnerExists = await partnerSchema.findOne({
      $or: [{ email: value.email }, { nif: value.nif }]
    });

    if (partnerExists) {
      return resp.status(400).json({
        status: false,
        message: "Já existe um parceiro cadastrado com este E-mail ou NIF."
      });
    }

    // 3. Criar parceiro
    const partner = await partnerSchema.create(value);

    return resp.status(201).json({
      status: true,
      message: "Parceiro cadastrado com sucesso!",
      partner
    });

  } catch (error) {
    console.log("Erro ao criar parceiro:", error);
    return resp.status(500).json({
      status: false,
      message: "Erro interno no servidor ao tentar cadastrar parceiro."
    });
  }
}

// Listar todos os parceiros
export const getPartners = async (req, resp) => {
  try {
    const partners = await partnerSchema.find().sort({ createdAt: -1 });
    return resp.status(200).json({
      status: true,
      count: partners.length,
      partners
    });
  } catch (error) {
    return resp.status(500).json({
      status: false,
      message: "Erro ao buscar parceiros."
    });
  }
}

// Obter parceiro por ID
export const getPartnerById = async (req, resp) => {
  try {
    const { id } = req.params;
    const partner = await partnerSchema.findById(id);

    if (!partner) {
      return resp.status(404).json({
        status: false,
        message: "Parceiro não encontrado."
      });
    }

    return resp.status(200).json({
      status: true,
      partner
    });
  } catch (error) {
    return resp.status(500).json({
      status: false,
      message: "Erro ao buscar o parceiro."
    });
  }
}

// Atualizar parceiro
export const updatePartner = async (req, resp) => {
  try {
    const { id } = req.params;

    //validar o id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return resp.status(400).json({
        status: false,
        message: "O formato do ID fornecido é inválido."
      });
    }

    // Validar corpo da requisição (pode ser um Joi específico para update ou o mesmo com .unknown())
    const { error, value } = partnerUpdateValidation.validate(req.body);

    if (error) {
      return resp.status(400).json({
        status: false,
        message: error.details[0].message
      });
    }

    const updatedPartner = await partnerSchema.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!updatedPartner) {
      return resp.status(404).json({
        status: false,
        message: "Parceiro não encontrado para atualização."
      });
    }

    return resp.status(200).json({
      status: true,
      message: "Dados do parceiro atualizados!",
      partner: updatedPartner
    });
  } catch (error) {
    console.log("teste: ", error)
    // --- TRATAMENTO DE ERROS ESPECÍFICOS PARA NÃO CAIR A APP ---

    // Erro de Chave Duplicada (NIF ou Email já existem em outro parceiro)
    if (error.code === 11000) {
      const campoDuplicado = Object.keys(error.keyPattern)[0];
      return resp.status(400).json({
        status: false,
        message: `Já existe um parceiro cadastrado com este ${campoDuplicado.toUpperCase()}.`
      });
    }

    // Erro de Cast (Caso o ID passe na primeira validação mas falhe no cast interno)
    if (error.name === 'CastError') {
      return resp.status(400).json({
        status: false,
        message: "ID com formato incorreto para o banco de dados."
      });
    }

    // Erro de Validação do Mongoose (runValidators: true)
    if (error.name === 'ValidationError') {
      return resp.status(400).json({
        status: false,
        message: error.message
      });
    }

    // Log apenas para erros desconhecidos (ajuda no debug do servidor)
    console.error("Erro inesperado:", error);

    return resp.status(500).json({
      status: false,
      message: "Ocorreu um erro interno no servidor."
    });
  }
}

// Deletar parceiro
export const deletePartner = async (req, resp) => {
  try {
    const { id } = req.params;
        //validar o id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return resp.status(400).json({
        status: false,
        message: "O formato do ID fornecido é inválido."
      });
    }
    const deleted = await partnerSchema.findByIdAndDelete(id);

    if (!deleted) {
      return resp.status(404).json({
        status: false,
        message: "Parceiro não encontrado."
      });
    }

    return resp.status(200).json({
      status: true,
      message: "Parceiro removido do sistema."
    });
  } catch (error) {
    return resp.status(500).json({
      status: false,
      message: "Erro ao deletar parceiro."
    });
  }
}

// Buscar parceiro por Nome ou NIF
export const searchPartners = async (req, resp) => {
  try {
    const { query } = req.query;
    if (!query) {
      return resp.status(400).json({ status: false, message: "nome ou nif de busca vazio." });
    }

    const regex = new RegExp(query, 'i');
    const partners = await partnerSchema.find({
      $or: [
        { name: { $regex: regex } },
        { nif: { $regex: regex } }
      ]
    });

    return resp.status(200).json({
      status: true,
      partners
    });
  } catch (error) {
    return resp.status(500).json({ status: false, message: "Erro na busca." });
  }
}