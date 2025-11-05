import { addToCart, getCart } from "../controllers/cartController.js";
import express from 'express'
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";

const router = express.Router()

//route for cart
//mostrar carrinho do cliente
router.get('/cart', authenticateTokenProfile, getCart)

//adicionar produtos no carrinho
router.post('/cart', authenticateTokenProfile, addToCart)

//remover produtos do carrinho
//router.delete('/cart', authMiddleware, removeCart)
const cartRouter = router
export default cartRouter