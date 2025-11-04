import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'

const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body
        const product = await productModel.findById(productId)
        if(!product) {
            console.log('Product not found ', productId)
            return res.status(404).json({
                status: false,
                message: "produto nao encontrado!"
            })
        }
        if(product.stock < quantity){
            console.log("stock insuficiente ", product.stock)
            return res.status(400).json({
                status: false,
                message: "Estoque insuficiente",
            })
        }

        let cart = await Cart.findOne({ user: userId })
        if(!cart){
            cart = new Cart({user: userId, items: []})
        }

        const existingCart = cart.items.find( i => i.product.toString() === productId)
        if(existingCart){
            existingCart.quantity += quantity
            existingCart.subtotal = existingCart.priceAtAdd * existingCart.quantity
        } else {
            cart.items.push({
                productId,
                quantity,
                priceAtAdd: product.price,
                subtotal: product.price * quantity,
            })
        }

        await cart.save()
        await cart.populate('items.products')
        return res.status(200).json({
            status: true,
            carrinho: cart
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "erro interno no servidor! entre em contacto com o suporte."
        })
    }
}