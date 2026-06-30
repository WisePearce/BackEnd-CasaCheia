/**
 * @openapi
 * tags:
 *   - name: Coordenadas da Loja
 *     description: Gerenciamento das coordenadas da loja (admin apenas)
 *
 * components:
 *   schemas:
 *     StoreCoordinates:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     StoreCoordinatesInput:
 *       type: object
 *       required: [name, latitude, longitude]
 *       properties:
 *         name:
 *           type: string
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *
 * /api/coordinates:
 *   post:
 *     tags: [Coordenadas da Loja]
 *     summary: Criar coordenadas da loja (apenas 1 registro)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreCoordinatesInput'
 *     responses:
 *       201:
 *         description: Coordenadas criadas
 *       400:
 *         description: Já existe uma loja cadastrada
 *
 *   get:
 *     tags: [Coordenadas da Loja]
 *     summary: Obter coordenadas da loja
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coordenadas da loja
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StoreCoordinates'
 *       404:
 *         description: Coordenadas não encontradas
 *
 *   put:
 *     tags: [Coordenadas da Loja]
 *     summary: Atualizar coordenadas da loja
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreCoordinatesInput'
 *     responses:
 *       200:
 *         description: Coordenadas atualizadas
 *       404:
 *         description: Coordenadas não encontradas
 *
 *   delete:
 *     tags: [Coordenadas da Loja]
 *     summary: Remover coordenadas da loja
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coordenadas deletadas
 *       404:
 *         description: Coordenadas não encontradas
 */
import express from 'express';
import authenticateToken from "../middlewares/authMiddleware.js"
import {
  deleteStoreCoordinats,
  createStoreCoordinats,
  findCoordinats,
  updateStoreCoordinats
} from '../controllers/storeCoordinatsController.js'

const router = express.Router();

router.post('/coordinates', authenticateToken, createStoreCoordinats);
router.get('/coordinates', authenticateToken, findCoordinats);
router.put('/coordinates', authenticateToken, updateStoreCoordinats);
router.delete('/coordinates', authenticateToken, deleteStoreCoordinats);

export default router;