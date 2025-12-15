import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js'
import { getOrder, getAllOrders} from '../controllers/orderController.js'
import express from 'express'

//router
const router  = express.Router()

//listar pedidos individuais de cada cliente
router.get('/orders/my-orders', authenticateTokenProfile, getOrder);

router.get('/orders/all', authenticateTokenProfile, getAllOrders);

const orderRouter = router;
export default orderRouter;