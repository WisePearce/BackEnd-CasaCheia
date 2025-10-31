import categorySchema from "../models/categorieModel.js";
import { categoriesValidation } from "../config/validation.js"
import path from "path";
import dotenv from "dotenv";
import categorieUpdateValidation from "../config/categorieUpdateValidation.js"
dotenv.config()

//Criar nova categoria
export const createCategorie = async (req, resp) => {
    try {
        const { name, description } = req.body
        //verificar se ja existe uma categoria com esse nome
        const categorieExists = await categorySchema.findOne({ name });
        if (categorieExists) {
            return resp.status(400).json({
                status: false,
                message: "Já existe uma categoria com esse nome."
            });
        }
        console.log(req.body)

        //validar os dados
        const { error, value } = categoriesValidation.validate({ name, description });

        if (error) {
            return resp.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }

        //Os dados estao limpos entao, bora cadastrar

        const categorie = await categorySchema.create({ name, description});

        return resp.status(201).json({
            status: true,
            message: "Categoria criada com sucesso!",
            categorie
        });
    } catch (error) {
        console.log(error.message);
        return resp.status(500).json({
            status: false,
            message: "Erro no servidor, tente novamente mais tarde."
        });
    }
}
//Listar todas as categorias
export const getCategories = async (req, resp) => {
    try {
        const categories = await categorySchema.find();
        return resp.status(200).json({
            status: true,
            categories
        });
    } catch (error) {
        console.log(error.message);
        return resp.status(500).json({
            status: false,
            message: "Erro no servidor, tente novamente mais tarde."
        });
    }
}

//Obter categoria por ID
export const getCategorieById = async (req, resp) => {
    try {
        const { id } = req.params;
        const categorie = await categorySchema.findById(id);
        if (!categorie) {
            return resp.status(404).json({
                status: false,
                message: "Categoria não encontrada."
            });
        }
        return resp.status(200).json({
            status: true,
            categorie
        });
    } catch (error) {
        console.log(error.message);
        return resp.status(500).json({
            status: false,
            message: "Erro no servidor, tente novamente mais tarde."
        });
    }
}

//Atualizar categoria por ID
export const updateCategorie = async (req, resp) => {
    try {
        const { id } = req.params;

        const dados = await categorySchema.findById({ _id: id });

        if (!dados) {
            return resp.status(404).json({
                status: false,
                message: "Categoria não encontrada."
            });
        }

        //validar os dados
        const { error, value } = categorieUpdateValidation.validate(req.body);

        if (error) {
            return resp.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }
        if (value.name !== undefined) dados.name = value.name
        if (value.description !== undefined) dados.description = value.description
        
        await dados.save();
        return resp.status(200).json({
            status: true,
            message: "Categoria atualizada com sucesso!",
            dados: updateCategorie
        });
    } catch (error) {
        console.log(error.message);
        return resp.status(500).json({
            status: false,
            message: "Erro no servidor, tente novamente mais tarde."
        });
    }
}

//Deletar categoria por ID
export const deleteCategorie = async (req, resp) => {
    try {
        const { id } = req.params;
        const deletedCategorie = await categorySchema.findByIdAndDelete(id);
        if (!deletedCategorie) {
            return resp.status(404).json({
                status: false,
                message: "Categoria não encontrada."
            });
        }
        return resp.status(200).json({
            status: true,
            message: "Categoria deletada com sucesso!"
        });
    } catch (error) {
        console.log(error.message);
        return resp.status(500).json({
            status: false,
            message: "Erro no servidor, tente novamente mais tarde."
        });
    }
}
export const searchCategoriesByName = async (req, resp) => {
    try {
        const { name } = req.query;
        const regex = new RegExp(name, 'i'); // 'i' para case-insensitive
        const categories = await categorySchema.find({ name: { $regex: regex } });

        if (categories.length === 0) {
            return resp.status(404).json({
                status: false,
                message: "Nenhuma categoria encontrada com esse nome."
            });
        }

        return resp.status(200).json({
            status: true,
            categories
        });
    } catch (error) {
        console.log(error.message);
        return resp.status(500).json({
            status: false,
            message: "Erro no servidor, tente novamente mais tarde."
        });
    }
}