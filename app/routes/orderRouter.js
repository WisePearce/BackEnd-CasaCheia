import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js'
import { createOrder } from '../controllers/orderController.js'
import express from 'express'

//router
const router  = express.Router()

//get order
router.get('/order', authenticateTokenProfile)

//export router
const orderRouter = router
export default orderRouter
