import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import checkOut from "../controllers/checkoutController.js";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = express.Router();

router.post('/orders/checkout', authenticateTokenProfile, checkOut );

const checkOutRouter = router;
export default checkOutRouter;