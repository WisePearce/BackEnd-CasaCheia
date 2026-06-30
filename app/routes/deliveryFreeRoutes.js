/**
 * @openapi
 * tags:
 *   - name: Entrega
 *     description: Cálculo de taxa de entrega
 *
 * /api/delivery:
 *   post:
 *     tags: [Entrega]
 *     summary: Calcular taxa de entrega
 *     description: Calcula a distância entre o cliente e a loja e retorna o valor da entrega
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Latitude do cliente
 *               longitude:
 *                 type: number
 *                 description: Longitude do cliente
 *     responses:
 *       200:
 *         description: Taxa de entrega calculada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     distanceKm:
 *                       type: string
 *                     valor_entrega:
 *                       type: number
 *                     entrega_free:
 *                       type: boolean
 *       400:
 *         description: Coordenadas obrigatórias
 *       404:
 *         description: Loja não configurada
 */
import { Router } from 'express';
import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js';
import { getDeliveryFee } from '../controllers/deliveryController.js';

const router = Router();

router.post('/delivery', authenticateTokenProfile, getDeliveryFee);

const deliveryRouter = router;

export default deliveryRouter;