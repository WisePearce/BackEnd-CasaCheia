import Cart from '../models/cartModel.js'
import product from '../models/productModel.js'
import mongoose from 'mongoose'

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId, quantity } = req.body
        if( productId === undefined && quantity === undefined ) {
            console.log(req.body)
            return res.status(400).json({
                status: false,
                message: 'por favor adicione produto com quantidade no seu carrinho'
            })
        }
        if(!(mongoose.Types.ObjectId.isValid(productId))) {
            console.log("id de producto invalido")
            return res.status(400).json({
                status: false,
                message: 'id do producto invalido'
            })
        }
        const verifyProduct = await product.findById(productId)
        console.log(verifyProduct)
        if(!verifyProduct) {
            console.log('produto nao encontrado!', productId)
            return res.status(404).json({
                status: false,
                message: "produto nao encontrado!"
            })
        }
        if(verifyProduct.stock < quantity){
            console.log("stock insuficiente ", verifyProduct.stock)
            return res.status(400).json({
                status: false,
                message: "Estoque insuficiente",
            })
        }

        let cart = await Cart.findOne({ user: userId })
        if(!cart){
            cart = new Cart({user: userId, items: []})
        }

        const existingCart = cart.items.findIndex( item => item.product.toString() === productId)

        if(existingCart > -1){
            cart.items[existingCart].quantity += quantity
        } else {
            cart.items.push({
                product: productId,
                quantity: quantity,
                priceAtAdd: verifyProduct.price
            })
        }

        await cart.save()
        await cart.populate('items.product')
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

const getCart = async (req, res) => {
    try {
        const id = req.user.id
        const cart = await Cart.find({ user:id })
        if(cart.length < 1){
            return res.status(404).json({
                status: false,
                message: "Seu carrinho esta vazio!"
            })
        }
        return res.status(200).json({
            status: true,
            carrinho: cart
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: false,
            message: "erro interno no servidor!"
        })
    }
}
const removeCart = async (req, res) => {
    const id = req.user._id
    const productId = req.params.productId
    const cart = await Cart.findById({ user: id })
    if(!cart){
        return res.status(404).json({
            status: false,
            message: "produto nao encontrado!"
        })
    }

}
export {
    addToCart,
    getCart,
    //removeCart
}