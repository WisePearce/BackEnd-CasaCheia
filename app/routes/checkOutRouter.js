import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import checkOut from "../controllers/checkoutController.js";

const router = express.Router();

router.post('/orders/checkout', authenticateToken, checkOut );

const checkOutRouter = router;
export default checkOutRouter;