/**
 * @openapi
 * tags:
 *   - name: Itens do Pedido
 *     description: Consulta de itens de pedidos (admin)
 *
 * /api/order-items:
 *   get:
 *     tags: [Itens do Pedido]
 *     summary: Listar itens de pedidos (admin)
 *     description: Endpoint para consulta administrativa de itens de pedidos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Itens encontrados
 *       404:
 *         description: Nenhum carrinho encontrado
 */
import getCart from "../controllers/itemOrderController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get('/order-items', authenticateToken, getCart);

const orderItemsRouter = router;

export default orderItemsRouter;