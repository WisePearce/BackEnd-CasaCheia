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