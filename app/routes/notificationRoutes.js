/**
 * @swagger
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
 *     summary: Listar notificações não lidas
 *     description: >
 *       Retorna as notificações não lidas do utilizador autenticado (clientes e admins).
 *       Útil para o admin dashboard buscar notificações que chegaram enquanto estava offline.
 *       As notificações vêm ordenadas da mais recente para a mais antiga (máx. 50).
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
 *     description: Marca uma notificação específica como lida. Usa-se depois de o admin visualizar a notificação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da notificação
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
