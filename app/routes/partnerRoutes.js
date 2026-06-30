/**
 * @openapi
 * tags:
 *   - name: Parceiros
 *     description: Gerenciamento de parceiros/fornecedores (admin apenas)
 *
 * components:
 *   schemas:
 *     PartnerAddress:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *         city:
 *           type: string
 *           default: Luanda
 *         province:
 *           type: string
 *     PartnerResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         nif:
 *           type: string
 *         phone:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         address:
 *           $ref: '#/components/schemas/PartnerAddress'
 *         totalProducts:
 *           type: integer
 *         products:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PartnerInput:
 *       type: object
 *       required: [name, email, nif, phone, address]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         nif:
 *           type: string
 *           minLength: 9
 *           maxLength: 14
 *         phone:
 *           type: string
 *           description: 9 dígitos
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 *         address:
 *           type: string
 *           description: JSON stringified do endereço
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *     PartnerUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         nif:
 *           type: string
 *         phone:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         address:
 *           type: string
 *           description: JSON stringified do endereço
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *
 * /api/partners:
 *   get:
 *     tags: [Parceiros]
 *     summary: Listar todos os parceiros
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de parceiros
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
 *                     $ref: '#/components/schemas/PartnerResponse'
 *
 *   post:
 *     tags: [Parceiros]
 *     summary: Criar novo parceiro
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PartnerInput'
 *     responses:
 *       201:
 *         description: Parceiro cadastrado
 *       400:
 *         description: E-mail ou NIF já existente
 *
 * /api/partners/search:
 *   get:
 *     tags: [Parceiros]
 *     summary: Buscar parceiros por nome ou NIF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados da busca
 *       400:
 *         description: Nome ou NIF de busca vazio
 *
 * /api/partners/{id}:
 *   get:
 *     tags: [Parceiros]
 *     summary: Obter parceiro por ID
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
 *         description: Dados do parceiro
 *       404:
 *         description: Parceiro não encontrado
 *
 *   patch:
 *     tags: [Parceiros]
 *     summary: Atualizar parceiro
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
 *             $ref: '#/components/schemas/PartnerUpdateInput'
 *     responses:
 *       200:
 *         description: Parceiro atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Parceiro não encontrado
 *
 *   delete:
 *     tags: [Parceiros]
 *     summary: Remover parceiro
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
 *         description: Parceiro removido
 *       404:
 *         description: Parceiro não encontrado
 *
 * /api/partners/{id}/toggle:
 *   patch:
 *     tags: [Parceiros]
 *     summary: Alternar status (active/inactive) do parceiro
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
 *         description: Status alterado
 *       404:
 *         description: Parceiro não encontrado
 */
import { Router } from "express";
import {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
  searchPartners,
  togglePartner,
} from "../controllers/partnerController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer/productUploads.js";

const route = Router();

route.get("/partners/search", authenticateToken, searchPartners);
route.get("/partners", authenticateToken, getPartners);
route.get("/partners/:id", authenticateToken, getPartnerById);
route.post("/partners", authenticateToken, upload.array("images", 4), createPartner);
route.patch("/partners/:id", authenticateToken, upload.array("images", 4), updatePartner);
route.patch("/partners/:id/toggle", authenticateToken, togglePartner);
route.delete("/partners/:id", authenticateToken, deletePartner);

const partnerRoutes = route;
export default partnerRoutes;