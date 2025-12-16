import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js';
import authenticateToken from "../middlewares/authMiddleware.js";
import { getOrder, getAllOrders, updateStatusOrder} from '../controllers/orderController.js';
import express from 'express'

//router
const router  = express.Router()

//listar pedidos individuais de cada cliente
router.get('/orders/my-orders', authenticateTokenProfile, getOrder);

//listar todos os pedidos no Admin
router.get('/orders/all', authenticateToken, getAllOrders);

router.patch('/orders/:orderId/status', authenticateToken, updateStatusOrder);

const orderRouter = router;
export default orderRouter;