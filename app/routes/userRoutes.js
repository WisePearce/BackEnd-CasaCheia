import { Router} from "express";
import {listUsers, listAllUsers} from "../controllers/userController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = Router()


//rota protegida para ir para o user profile
router.get('/users', authenticateTokenProfile, listUsers);
router.get('/users/all', authenticateTokenProfile, listAllUsers);

const userRouter = router;
export default userRouter;