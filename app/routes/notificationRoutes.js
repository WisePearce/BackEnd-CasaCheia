/**
 * @openapi
 * tags:
 *   - name: Notificações
 *     description: |
 *       Notificações in-app armazenadas no MongoDB.
 *       Cada utilizador vê APENAS as suas próprias notificações.
 *       Clientes: recebem sobre novos produtos (new_product), promoções (promotion) e status do pedido (status_update).
 *       Admins: recebem sobre novos pedidos (new_order) e atualizações de status (status_update).
 *
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         type:
 *           type: string
 *           enum: [new_order, new_product, promotion, status_update]
 *           description: |
 *             new_order = Novo pedido realizado (admins)
 *             new_product = Novo produto adicionado (clientes)
 *             promotion = Produto com preço reduzido (clientes)
 *             status_update = Status do pedido atualizado (admins + clientes)
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         data:
 *           type: object
 *         read:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *     NotificationsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *     MarkAsReadResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Notification'
 *
 * /api/profile/notifications:
 *   get:
 *     tags: [Notificações]
 *     summary: Listar notificações não lidas do utilizador autenticado
 *     description: |
 *       Retorna as notificações não lidas do utilizador autenticado.
 *
 *       Cada utilizador (admin ou cliente) vê APENAS as suas próprias notificações.
 *       O sistema cria uma cópia individual da notificação para cada utilizador.
 *
 *       Quem recebe notificações:
 *         - Clientes: quando o admin cria um novo produto (tipo "new_product"),
 *           quando o preço de um produto baixa (tipo "promotion"),
 *           e quando o status do seu pedido é atualizado (tipo "status_update")
 *         - Admins: quando um novo pedido é realizado (tipo "new_order")
 *           e quando o status de um pedido é atualizado (tipo "status_update")
 *
 *       Fluxo para o utilizador:
 *         1. Abrir o app/dashboard
 *         2. Chamar este endpoint para buscar notificações não lidas
 *         3. Exibir na UI (badge, lista, pop-up)
 *         4. Quando o utilizador visualizar, chamar PATCH /api/profile/notifications/{id}/read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações não lidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationsResponse'
 *
 * /api/profile/notifications/{id}/read:
 *   patch:
 *     tags: [Notificações]
 *     summary: Marcar notificação como lida
 *     description: |
 *       Marca uma notificação específica como lida.
 *
 *       Após o utilizador visualizar a notificação na UI, deve chamar este endpoint
 *       para que ela não apareça mais na lista de não lidas.
 *
 *       Cada utilizador marca APENAS as suas próprias notificações como lidas.
 *       Um admin marcar como lida não afeta a notificação de outro admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "ID da notificação (ex: 60f...)"
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarkAsReadResponse'
 *       404:
 *         description: Notificação não encontrada
 */
import { Router } from "express";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";
import { getUserNotifications, markNotificationAsRead } from "../controllers/notificationController.js";

const router = Router();

router.get("/profile/notifications", authenticateTokenProfile, getUserNotifications);
router.patch("/profile/notifications/:id/read", authenticateTokenProfile, markNotificationAsRead);

export default router;
