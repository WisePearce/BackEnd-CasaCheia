/**
 * @openapi
 * tags:
 *   - name: Carrinho
 *     description: Gerenciamento do carrinho de compras do usuário
 *
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: ID do produto
 *         quantity:
 *           type: integer
 *           minimum: 1
 *         priceAtAdd:
 *           type: number
 *     CartInput:
 *       type: object
 *       required: [items]
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     CartResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         message:
 *           type: string
 *         cart:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product:
 *                     type: object
 *                   quantity:
 *                     type: integer
 *                   priceAtAdd:
 *                     type: number
 *             totalAmount:
 *               type: number
 *
 * /api/cart:
 *   get:
 *     tags: [Carrinho]
 *     summary: Ver carrinho do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *
 *   post:
 *     tags: [Carrinho]
 *     summary: Adicionar produtos ao carrinho
 *     description: Adiciona ou incrementa quantidade de produtos no carrinho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartInput'
 *     responses:
 *       200:
 *         description: Produto(s) adicionado(s) ao carrinho
 *       400:
 *         description: Produtos inválidos ou estoque insuficiente
 *
 *   delete:
 *     tags: [Carrinho]
 *     summary: Remover produtos do carrinho
 *     description: Reduz a quantidade ou remove completamente os itens do carrinho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartInput'
 *     responses:
 *       200:
 *         description: Produto(s) removido(s) do carrinho
 *       400:
 *         description: Erro ao remover produto(s)
 *       404:
 *         description: Carrinho não encontrado
 */
import { addToCart, getCart, removeCart } from "../controllers/cartController.js";
import express from 'express'
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = express.Router()

//route for cart
//mostrar carrinho do cliente
router.get('/cart', authenticateTokenProfile, getCart)

//adicionar produtos no carrinho
router.post('/cart', authenticateTokenProfile, addToCart)

//remover produtos do carrinho
router.delete('/cart', authenticateTokenProfile, removeCart)
const cartRouter = router
export default cartRouter