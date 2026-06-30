/**
 * @openapi
 * tags:
 *   - name: Banners
 *     description: Gerenciamento de banners da aplicação
 *
 * components:
 *   schemas:
 *     BannerResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           maxItems: 4
 *         description:
 *           type: string
 *         active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/banners:
 *   get:
 *     tags: [Banners]
 *     summary: Listar banners ativos
 *     responses:
 *       200:
 *         description: Lista de banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BannerResponse'
 *
 *   post:
 *     tags: [Banners]
 *     summary: Criar novo banner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Banner criado
 *       400:
 *         description: Imagem é obrigatória
 *
 * /api/banners/{id}:
 *   put:
 *     tags: [Banners]
 *     summary: Atualizar banner
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
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner atualizado
 *       400:
 *         description: Nenhum campo informado
 *       404:
 *         description: Banner não encontrado
 *
 *   delete:
 *     tags: [Banners]
 *     summary: Eliminar banner
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
 *         description: Banner removido
 *       404:
 *         description: Banner não encontrado
 */
import { Router } from 'express';
import { createBanner, getBanners, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import asyncUpload from "../middlewares/uploadMiddleware.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer/productUploads.js";

const router = Router();

router.get('/banners', getBanners);
router.post('/banners', authenticateToken, asyncUpload(upload.array('images', 4)), createBanner);
router.put('/banners/:id', authenticateToken, asyncUpload(upload.array('images', 4)), updateBanner);
router.delete('/banners/:id', authenticateToken, deleteBanner);

const bannerRouter = router;
export default bannerRouter;