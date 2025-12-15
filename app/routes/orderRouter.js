import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js'
import { getOrder, getAllOrders, updateStatusOrder} from '../controllers/orderController.js'
import express from 'express'

//router
const router  = express.Router()

//listar pedidos individuais de cada cliente
router.get('/orders/my-orders', authenticateTokenProfile, getOrder);

//listar todos os pedidos no Admin
router.get('/orders/all', authenticateTokenProfile, getAllOrders);

router.patch('/orders/:orderId/status', authenticateTokenProfile, updateStatusOrder);

const orderRouter = router;
export default orderRouter;