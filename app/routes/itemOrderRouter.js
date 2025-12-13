import getCart from "../controllers/itemOrderController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get('/order-items', authenticateToken, getCart);

const orderItemsRouter = router;

export default orderItemsRouter;