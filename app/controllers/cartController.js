import Cart from '../models/cartModel.js'
import product from '../models/productModel.js'
import mongoose from 'mongoose'

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Produtos inválidos',
            });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const results = await Promise.all(
            items.map(async ({ productId, quantity }) => {
                if (!mongoose.Types.ObjectId.isValid(productId)) {
                    return {
                        status: false,
                        message: 'ID do produto inválido',
                        productId,
                    };
                }

                const verifyProduct = await product.findById(productId);
                if (!verifyProduct) {
                    return {
                        status: false,
                        message: 'Produto não encontrado!',
                        productId,
                    };
                }

                if (verifyProduct.stock < quantity) {
                    return {
                        status: false,
                        message: 'Estoque insuficiente',
                        productId,
                    };
                }

                return {
                    status: true,
                    productId,
                    productData: verifyProduct,
                    quantity
                };
            })
        );

        // Filtra erros
        const errors = results.filter(r => !r.status);

        if (errors.length > 0) {
            return res.status(400).json({
                status: false,
                message: 'Erro ao adicionar produto(s) ao carrinho',
                errors,
            });
        }

        // Adiciona os produtos válidos no carrinho
        results.forEach(({ productId, productData, quantity }) => {
            const existingIndex = cart.items.findIndex(item =>
                item.product.equals(productId)
            );

            if (existingIndex > -1) {
                cart.items[existingIndex].quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    priceAtAdd: productData.price,
                });
            }
        });

        await cart.save();
        await cart.populate('items.product');

        return res.status(200).json({
            status: true,
            message: 'Produto(s) adicionado(s) ao carrinho',
            cart,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Erro interno do servidor',
            error: error.message,
        });
    }
}
const getCart = async (req, res) => {
        try {
            const id = req.user.id
            const cart = await Cart.find({ user: id })
            if (cart.length < 1) {
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

            if (Array.isArray(items) && items.length === 0) {
                console.log(items)
                return res.status(400).json({
                    status: false,
                    message: 'Produtos invalidos'
                })
            }
            for (const { productId, quantity } of items) {
                if (!(mongoose.Types.ObjectId.isValid(productId))) {
                    console.log("id de producto invalido")
                    return res.status(400).json({
                        status: false,
                        message: 'id do producto invalido',
                        product: productId
                    })
                }
                let cart = await Cart.findOne({ user: userId })

                if (cart.length < 1) {
                    return res.status(404).json({
                        status: false,
                        message: "Seu carrinho esta vazio!"
                    })
                }
                const existingProduct = cart.items.findIndex(item => item.product.toString() === productId)
                console.log(`producto encontrado: ${existingProduct}`)
                if (!(existingProduct > -1 && cart.items[existingProduct].quantity >= quantity)) {
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