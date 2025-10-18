import {  Router } from "express";
import { createCategorie, getCategories, getCategorieById, updateCategorie, deleteCategorie } from "../controllers/categorieController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const route = Router();

//Rota para criar nova categoria
route.post('/categories', authenticateToken, createCategorie);

//Rota para obter todas as categorias
route.get('/categories', getCategories);

//Rota para obter uma categoria por ID
route.get('/categories/:id', getCategorieById);

//Rota para atualizar uma categoria por ID
route.patch('/categories/:id', authenticateToken, updateCategorie);

//Rota para deletar uma categoria por ID
route.delete('/categories/:id', authenticateToken, deleteCategorie);

//buscar categorias por nome (query param)
//Exemplo: /categories/search?name=eletronicos
route.get('/categories/search')



const categorieRoutes = route;
export default categorieRoutes;