/**
 * @openapi
 * tags:
 *   - name: Usuários
 *     description: Gerenciamento de usuários (admin e perfil)
 *
 * components:
 *   schemas:
 *     UserListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         telefone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 5
 *           maxLength: 50
 *     TelefoneUpdateInput:
 *       type: object
 *       required: [telefone]
 *       properties:
 *         telefone:
 *           type: string
 *           description: Novo número de telefone (9 dígitos)
 *     VerifyTelefoneInput:
 *       type: object
 *       required: [telefone, code]
 *       properties:
 *         telefone:
 *           type: string
 *         code:
 *           type: string
 *           description: Código de 6 dígitos recebido por SMS
 *
 * /api/users:
 *   get:
 *     tags: [Usuários]
 *     summary: Listar usuários comuns (admin)
 *     description: Retorna apenas usuários com role "user", com paginação
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meta:
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
 *                     $ref: '#/components/schemas/UserListItem'
 *
 * /api/users/all:
 *   get:
 *     tags: [Usuários]
 *     summary: Listar todos os usuários (admin)
 *     description: Retorna todos os usuários independente do role, com paginação
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de usuários
 *
 * /api/users/me:
 *   patch:
 *     tags: [Usuários]
 *     summary: Atualizar nome do próprio perfil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Dados atualizados
 *       400:
 *         description: Nenhum campo para atualizar
 *       404:
 *         description: Usuário não encontrado
 *
 * /api/users/me/telefone:
 *   patch:
 *     tags: [Usuários]
 *     summary: Solicitar alteração de telefone (envia código SMS)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TelefoneUpdateInput'
 *     responses:
 *       200:
 *         description: Código enviado para o novo telefone
 *       400:
 *         description: Número já em uso
 *       404:
 *         description: Usuário não encontrado
 *
 * /api/users/me/verify-number:
 *   post:
 *     tags: [Usuários]
 *     summary: Confirmar alteração de telefone com código SMS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyTelefoneInput'
 *     responses:
 *       200:
 *         description: Número atualizado
 *       400:
 *         description: Código inválido ou expirado
 *       404:
 *         description: Usuário não encontrado
 *       429:
 *         description: Muitas tentativas
 */
import { Router} from "express";
import {listUsers, listAllUsers, updateUser, updateTelefone, verifyCode} from "../controllers/userController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = Router()


//rota protegida para ir para o user profile
router.get('/users', authenticateToken, listUsers);
router.get('/users/all', authenticateToken, listAllUsers);
router.patch('/users/me', authenticateTokenProfile, updateUser);
router.patch('/users/me/telefone', authenticateTokenProfile, updateTelefone);
router.post('/users/me/verify-number', authenticateTokenProfile, verifyCode);

const userRouter = router;
export default userRouter;