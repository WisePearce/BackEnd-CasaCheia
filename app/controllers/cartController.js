import Cart from '../models/cartModel.js'
import product from '../models/productModel.js'
import mongoose from 'mongoose'

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id
        const { items } = req.body
        if( Array.isArray(items) && items.length === 0 ) {
            console.log(items)
            return res.status(400).json({
                status: false,
                message: 'Produtos invalidos'
            })
        }
        //process.exit()
        for ( const { productId, quantity } of items){
            if(!(mongoose.Types.ObjectId.isValid(productId))){
                    console.log("id de producto invalido")
                    return res.status(400).json({
                        status: false,
                        message: 'id do producto invalido',
                        product: productId
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
                message: "novo produto adicionado",
            })
        }

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
    try {
        const userId = req.user.id
        const { items } = req.body

        if( Array.isArray(items) && items.length === 0 ) {
            console.log(items)
            return res.status(400).json({
                status: false,
                message: 'Produtos invalidos'
            })
        }
        for ( const { productId, quantity } of items){
            if(!(mongoose.Types.ObjectId.isValid(productId))){
                console.log("id de producto invalido")
                return res.status(400).json({
                    status: false,
                    message: 'id do producto invalido',
                    product: productId
                })
            }
            let cart = await Cart.findOne({ user:userId })

            if(cart.length < 1){
                return res.status(404).json({
                    status: false,
                    message: "Seu carrinho esta vazio!"
                })
            }
            const existingProduct = cart.items.findIndex( item => item.product.toString() === productId)
            console.log(`producto encontrado: ${existingProduct}`)
            if(!(existingProduct > -1 && cart.items[existingProduct].quantity >= quantity) ){
                console.log(`quantidade encontrado: ${cart[0].items[existingProduct].quantity}`)
                return res.status(400).json({
                    status: false,
                    message: 'quantidade insuficiente'
                })
            }
            cart.items[existingProduct].quantity -= quantity
            await cart.save()
            await cart.populate('items.product')
            return res.status(200).json({
                status: true,
                message: "produto reduzido",
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "erro interno no servidor! entre em contacto com o suporte."
        })
    }
}
export {
    addToCart,
    getCart,
    removeCart
}