import express from "express";
import  { forgotPassword, resetPassword } from "../controllers/forgotPasswordController.js";

const router = express.Router();

// Rotas para recuperação e redefinição de senha
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

const passwordRouter = router;

export default passwordRouter;