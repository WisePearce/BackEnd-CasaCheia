/**
 * @openapi
 * tags:
 *   - name: Autenticação
 *     description: Registro, login, perfil e gerenciamento de conta
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     SignupInput:
 *       type: object
 *       required: [name, telefone, password]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 5
 *           maxLength: 50
 *           example: João Silva
 *         telefone:
 *           type: string
 *           description: 9 dígitos numéricos
 *           example: 923456789
 *         password:
 *           type: string
 *           minLength: 8
 *           example: senha123
 *     VerifyCodeInput:
 *       type: object
 *       required: [telefone, code]
 *       properties:
 *         telefone:
 *           type: string
 *           example: 923456789
 *         code:
 *           type: string
 *           description: Código de 6 dígitos recebido por SMS
 *           example: 123456
 *     LoginInput:
 *       type: object
 *       required: [telefone, password]
 *       properties:
 *         telefone:
 *           type: string
 *           example: 923456789
 *         password:
 *           type: string
 *           example: senha123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             status:
 *               type: boolean
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             telefone:
 *               type: string
 *         token:
 *           type: string
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             telefone:
 *               type: string
 *             role:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *     UpdatePasswordInput:
 *       type: object
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 8
 *     FcmTokenInput:
 *       type: object
 *       required: [fcmToken]
 *       properties:
 *         fcmToken:
 *           type: string
 *     LogoutInput:
 *       type: object
 *       required: [token]
 *       properties:
 *         token:
 *           type: string
 *           description: Refresh token
 *
 * /api/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Enviar código de verificação SMS para registro
 *     description: Envia um código de 6 dígitos por SMS para validar o telefone do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       200:
 *         description: Código enviado com sucesso
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
 *                 telefone:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Telefone já em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/register/verify:
 *   post:
 *     tags: [Autenticação]
 *     summary: Verificar código SMS e criar conta
 *     description: Valida o código recebido por SMS e cria a conta do usuário. Retorna JWT e refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyCodeInput'
 *     responses:
 *       201:
 *         description: Conta criada e autenticada com sucesso
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
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 telefone:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: Código inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Muitas tentativas inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Autenticar usuário
 *     description: Realiza login e retorna JWT (4h de validade) + refresh token (7 dias)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Telefone ou password incorreta
 *       404:
 *         description: Usuário não encontrado
 *
 * /api/logout:
 *   post:
 *     tags: [Autenticação]
 *     summary: Realizar logout
 *     description: Invalida o refresh token no banco de dados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutInput'
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Falha ao realizar logout
 *
 * /api/profile:
 *   get:
 *     tags: [Autenticação]
 *     summary: Obter perfil do usuário autenticado
 *     description: Retorna os dados do perfil sem a senha
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       500:
 *         description: Erro interno
 *
 * /api/profile/password:
 *   patch:
 *     tags: [Autenticação]
 *     summary: Atualizar senha
 *     description: Altera a senha do usuário autenticado (requer senha atual)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordInput'
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha atual incorreta
 *       404:
 *         description: Usuário não encontrado
 *
 * /api/profile/fcm-token:
 *   patch:
 *     tags: [Autenticação]
 *     summary: Registrar token FCM para notificações push
 *     description: Associa um token FCM ao dispositivo do usuário para receber notificações push
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FcmTokenInput'
 *     responses:
 *       200:
 *         description: FCM token registado com sucesso
 *       400:
 *         description: fcmToken inválido
 *       404:
 *         description: Usuário não encontrado
 */
import { Router} from "express";
import {signup, signin, logout, profile, updatePassword, verifyCode, updateFcmToken} from "../controllers/authController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = Router()
router.post('/register', signup);
router.post('/register/verify', verifyCode);
router.post('/login', signin);
router.post('/logout', authenticateToken, logout);

router.patch('/profile/password', authenticateTokenProfile, updatePassword);

//rota protegida para ir para o user profile
router.get('/profile', authenticateTokenProfile, profile);

//rota para registar/atualizar token FCM para push notifications
router.patch('/profile/fcm-token', authenticateTokenProfile, updateFcmToken);

const authRouter = router;
export default authRouter;