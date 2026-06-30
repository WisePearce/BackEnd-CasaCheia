/**
 * @openapi
 * tags:
 *   - name: Recuperação de Senha
 *     description: Fluxo de recuperação de senha via SMS
 *
 * components:
 *   schemas:
 *     ForgotPasswordInput:
 *       type: object
 *       required: [telefone]
 *       properties:
 *         telefone:
 *           type: string
 *           description: Número de telefone (9 dígitos)
 *     ResetPasswordInput:
 *       type: object
 *       required: [telefone, code, password]
 *       properties:
 *         telefone:
 *           type: string
 *         code:
 *           type: string
 *           description: Código de 6 dígitos recebido por SMS
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Nova senha
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Recuperação de Senha]
 *     summary: Solicitar código de recuperação de senha
 *     description: Envia um código de 6 dígitos por SMS para o telefone do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Código enviado com sucesso
 *       400:
 *         description: Telefone inválido
 *       404:
 *         description: Usuário não encontrado
 *
 * /api/auth/reset-password:
 *   post:
 *     tags: [Recuperação de Senha]
 *     summary: Redefinir senha com código SMS
 *     description: Valida o código e atualiza a senha do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Código inválido ou expirado
 *       429:
 *         description: Muitas tentativas inválidas
 */
import express from "express";
import  { forgotPassword, resetPassword } from "../controllers/forgotPasswordController.js";

const router = express.Router();

// Rotas para recuperação e redefinição de senha
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

const passwordRouter = router;

export default passwordRouter;