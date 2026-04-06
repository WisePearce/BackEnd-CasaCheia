import storeSchema from '../models/myStoreModel.js'
import { createStoreValidator, updateStoreValidator } from '../config/validations/coordenatesStoreValidation.js';

// Criar coordenadas da loja
export const createStoreCoordinats = async (req, res) => {
  try {
    // Validação
    const { error } = createStoreValidator(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Erro de validação',
        errors: error.details.map(e => e.message)
      });
    }

    const { name, latitude, longitude } = req.body;

    // Verifica se já existe uma loja
    const lojaExistente = await storeSchema.findOne();
    if (lojaExistente) {
      return res.status(400).json({
        status: false,
        message: 'Já existe uma loja cadastrada'
      });
    }

    const loja = await storeSchema.create({ name, latitude, longitude });

    res.status(201).json({
      status: true,
      message: 'Coordenadas criadas com sucesso',
      data: loja
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

// Buscar coordenadas da loja
export const findCoordinats = async (req, res) => {
  try {
    const loja = await storeSchema.findOne();

    if (!loja) {
      return res.status(404).json({
        status: false,
        message: 'Coordenadas não encontradas'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Coordenadas da loja encontradas',
      data: loja
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

// Atualizar coordenadas da loja
export const updateStoreCoordinats = async (req, res) => {
  try {
    // Validação
    const { error } = updateStoreValidator(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Erro de validação',
        errors: error.details.map(e => e.message)
      });
    }

    const { name, latitude, longitude } = req.body;

    const loja = await storeSchema.findOneAndUpdate(
      {},
      { name, latitude, longitude },
      { new: true, runValidators: true }
    );

    if (!loja) {
      return res.status(404).json({
        status: false,
        message: 'Coordenadas não encontradas'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Coordenadas atualizadas com sucesso',
      data: loja
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

// Deletar coordenadas da loja
export const deleteStoreCoordinats = async (req, res) => {
  try {
    const loja = await storeSchema.findOneAndDelete();

    if (!loja) {
      return res.status(404).json({
        status: false,
        message: 'Coordenadas não encontradas'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Coordenadas deletadas com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};