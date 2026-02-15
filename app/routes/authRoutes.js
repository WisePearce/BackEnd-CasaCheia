import { Router} from "express";
import {signup, signin, logout, profile, updatePassword, verifyCode} from "../controllers/authController.js";
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

const authRouter = router;
export default authRouter;