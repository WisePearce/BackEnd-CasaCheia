import userSchema from "../models/user.model.js";

// Criar usuário
export const create = async (req, res) => {
    try {
        const dados = req.body;
        const novoUsuario = await userSchema.create(dados);
        return res.status(201).json(novoUsuario);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Listar todos os usuários
export const findAll = async (req, res) => {
    try {
        const usuarios = await userSchema.find();
        return res.json(usuarios);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Buscar usuário por ID
export const findOne = async (req, res) => {
    try {
        const usuario = await userSchema.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        return res.json(usuario);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Atualizar usuário
export const update = async (req, res) => {
    try {
        const usuarioAtualizado = await userSchema.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!usuarioAtualizado) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        return res.json(usuarioAtualizado);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Remover usuário
export const remove = async (req, res) => {
    try {
        const usuarioRemovido = await userSchema.findByIdAndDelete(req.params.id);
        if (!usuarioRemovido) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        return res.json({ message: "Usuário removido com sucesso" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};