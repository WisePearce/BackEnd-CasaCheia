/**
 * @openapi
 * tags:
 *   - name: Categorias
 *     description: Gerenciamento de categorias de produtos
 *
 * components:
 *   schemas:
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ativo, inativo]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CategoryInput:
 *       type: object
 *       required: [name, description]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 4
 *           maxLength: 50
 *         description:
 *           type: string
 *           maxLength: 255
 *     CategoryUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *
 * /api/categories:
 *   get:
 *     tags: [Categorias]
 *     summary: Listar todas as categorias
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryResponse'
 *
 *   post:
 *     tags: [Categorias]
 *     summary: Criar nova categoria
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Nome já existe ou dados inválidos
 *
 * /api/categories/search:
 *   get:
 *     tags: [Categorias]
 *     summary: Buscar categorias por nome
 *     description: Busca case-insensitive por nome da categoria
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categorias encontradas
 *       400:
 *         description: Nome da categoria é obrigatório
 *       404:
 *         description: Nenhuma categoria encontrada
 *
 * /api/categories/{id}:
 *   get:
 *     tags: [Categorias]
 *     summary: Obter categoria por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados da categoria
 *       404:
 *         description: Categoria não encontrada
 *
 *   patch:
 *     tags: [Categorias]
 *     summary: Atualizar categoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateInput'
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 *
 *   delete:
 *     tags: [Categorias]
 *     summary: Eliminar categoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoria deletada
 *       404:
 *         description: Categoria não encontrada
 */
import { Router } from "express";
import { createCategorie, getCategories, getCategorieById, updateCategorie, deleteCategorie, searchCategoriesByName } from "../controllers/categorieController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const route = Router();

//Rota para criar nova categoria
route.post('/categories', authenticateToken, createCategorie);

//Rota para obter todas as categorias
route.get('/categories', getCategories);

//buscar categorias por nome (query param)
//Exemplo: /categories/search?name=eletronicos
route.get('/categories', searchCategoriesByName);

//Rota para obter uma categoria por ID
route.get('/categories/:id', getCategorieById);

//Rota para atualizar uma categoria por ID
route.patch('/categories/:id', authenticateToken, updateCategorie);

//Rota para deletar uma categoria por ID
route.delete('/categories/:id', authenticateToken, deleteCategorie);




const categorieRoutes = route;
export default categorieRoutes;