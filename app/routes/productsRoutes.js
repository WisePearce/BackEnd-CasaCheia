/**
 * @openapi
 * tags:
 *   - name: Produtos
 *     description: Gerenciamento de produtos (CRUD + busca)
 *
 * components:
 *   schemas:
 *     ProductResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         partner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             nif:
 *               type: string
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *         stock:
 *           type: integer
 *         image:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required: [name, price, category, stock, description]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 4
 *           maxLength: 50
 *         price:
 *           type: number
 *           exclusiveMinimum: 0
 *         category:
 *           type: string
 *           description: ID da categoria (24 caracteres)
 *         partner:
 *           type: string
 *           description: ID do parceiro (24 caracteres)
 *         stock:
 *           type: integer
 *           minimum: 0
 *         description:
 *           type: string
 *           maxLength: 255
 *     ProductUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         partner:
 *           type: string
 *         stock:
 *           type: integer
 *         description:
 *           type: string
 *
 * /api/products:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar todos os produtos
 *     description: Retorna produtos com paginação, populando categoria e parceiro
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página (máx 100)
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductResponse'
 *                 pagina_atual:
 *                   type: integer
 *                 total_paginas:
 *                   type: integer
 *                 total_produtos:
 *                   type: integer
 *
 *   post:
 *     tags: [Produtos]
 *     summary: Criar novo produto
 *     description: Cria um produto com upload de imagens (máx 4 arquivos, 5MB cada)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, category, stock, description]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               partner:
 *                 type: string
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Parceiro ou categoria não encontrada
 *
 * /api/products/search:
 *   get:
 *     tags: [Produtos]
 *     summary: Buscar produtos por nome
 *     description: Busca case-insensitive pelo nome do produto
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados da busca
 *       400:
 *         description: Nome é obrigatório
 *       404:
 *         description: Produto não encontrado
 *
 * /api/products/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Obter produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do produto
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Produto não encontrado
 *
 *   patch:
 *     tags: [Produtos]
 *     summary: Atualizar produto
 *     description: Atualiza parcialmente um produto (campos e/ou imagens)
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
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdateInput'
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       400:
 *         description: ID inválido ou nenhum campo informado
 *       404:
 *         description: Produto não encontrado
 *
 *   delete:
 *     tags: [Produtos]
 *     summary: Eliminar produto
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
 *         description: Produto eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Produto não encontrado
 */
import express from "express";
import {
  createProduct,
  showAll,
  showById,
  searchProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import asyncUpload from "../middlewares/uploadMiddleware.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer/productUploads.js";

const routes = express.Router();

routes.get("/products", showAll);
routes.get("/products/search", searchProduct);
routes.get("/products/:id", showById);
routes.post("/products", authenticateToken, asyncUpload(upload.array("images", 4)), createProduct);
routes.patch("/products/:id", authenticateToken, upload.array("images", 4), updateProduct);
routes.delete("/products/:id", authenticateToken, deleteProduct);

const productRoutes = routes;
export default productRoutes;