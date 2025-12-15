import { Router} from "express";
import {signup, signin, logout, profile, updateUser, updatePassword} from "../controllers/authController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = Router()
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', authenticateToken, logout);
router.patch('/profile/password', authenticateTokenProfile, updatePassword);
//rota protegida para ir para o user profile
router.get('/profile', authenticateTokenProfile, profile);
router.patch('/profile', authenticateTokenProfile, updateUser);

const authRouter = router;
export default authRouter;