/**
 * @openapi
 * tags:
 *   - name: Checkout
 *     description: Finalização de pedidos
 *
 * /api/orders/checkout:
 *   post:
 *     tags: [Checkout]
 *     summary: Finalizar pedido (checkout)
 *     description: Processa o pagamento, calcula taxa de entrega, cria o pedido e limpa o carrinho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payment, contactName, phoneNumber, street, city, coordinates]
 *             properties:
 *               payment:
 *                 type: string
 *                 description: Método de pagamento
 *                 example: tpa
 *               contactName:
 *                 type: string
 *                 description: Nome do contato para entrega
 *               phoneNumber:
 *                 type: string
 *                 description: Telefone para contato da entrega
 *               street:
 *                 type: string
 *                 description: Endereço de entrega
 *               city:
 *                 type: string
 *                 description: Cidade de entrega
 *               coordinates:
 *                 type: object
 *                 required: [latitude, longitude]
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       201:
 *         description: Pedido realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     numero_pedido:
 *                       type: string
 *                     id_pedido:
 *                       type: string
 *                     subtotal:
 *                       type: number
 *                     deliveryFee:
 *                       type: number
 *                     total:
 *                       type: number
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Carrinho vazio ou loja não configurada
 */
import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import checkOut from "../controllers/checkoutController.js";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = express.Router();

router.post('/orders/checkout', authenticateTokenProfile, checkOut );

const checkOutRouter = router;
export default checkOutRouter;