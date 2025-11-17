import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js'
import { createOrder } from '../controllers/orderController.js'
import express from 'express'

//router
const router  = express.Router()

//create order
router.post('/order', authenticateTokenProfile, createOrder)

//export router
const orderRouter = router
export default orderRouter
