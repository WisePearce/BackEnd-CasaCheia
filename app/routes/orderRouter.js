/**
 * @openapi
 * tags:
 *   - name: Pedidos
 *     description: Gerenciamento de pedidos
 *
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         productName:
 *           type: string
 *         category:
 *           type: string
 *         image:
 *           type: string
 *         unitPrice:
 *           type: number
 *         quantity:
 *           type: integer
 *         totalItem:
 *           type: number
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, canceled]
 *         statusLabel:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         entrega:
 *           type: object
 *           properties:
 *             contactName:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalItens:
 *           type: integer
 *         resumoFinanceiro:
 *           type: object
 *           properties:
 *             subtotal:
 *               type: number
 *             deliveryFee:
 *               type: number
 *             discount:
 *               type: number
 *             total:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         shippedAt:
 *           type: string
 *           format: date-time
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *     StatusUpdateInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [confirmed, shipped, delivered, canceled]
 *
 * /api/orders/my-orders:
 *   get:
 *     tags: [Pedidos]
 *     summary: Listar pedidos do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedidos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponse'
 *
 * /api/orders/all:
 *   get:
 *     tags: [Pedidos]
 *     summary: Listar todos os pedidos (admin)
 *     description: Lista paginada com filtro opcional por status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, canceled]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponse'
 *
 * /api/orders/{orderId}/status:
 *   patch:
 *     tags: [Pedidos]
 *     summary: Atualizar status do pedido (admin)
 *     description: "Máquina de estados: pending → confirmed → shipped → delivered. Qualquer estado pode ir para canceled."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdateInput'
 *     responses:
 *       200:
 *         description: Status atualizado
 *       400:
 *         description: Transição inválida
 *       404:
 *         description: Pedido não encontrado
 */
import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js';
import authenticateToken from "../middlewares/authMiddleware.js";
import { getOrder, getAllOrders, updateStatusOrder} from '../controllers/orderController.js';
import express from 'express'

//router
const router  = express.Router()

//listar pedidos individuais de cada cliente
router.get('/orders/my-orders', authenticateTokenProfile, getOrder);

//listar todos os pedidos no Admin
router.get('/orders/all', authenticateToken, getAllOrders);

router.patch('/orders/:orderId/status', authenticateToken, updateStatusOrder);

const orderRouter = router;
export default orderRouter;