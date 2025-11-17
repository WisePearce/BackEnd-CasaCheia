import Order from '../models/orderModel.js'
import itemsOrder from '../models/itemOrderModel.js'
import Cart from '../models/cartModel.js'
import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import shippingAdressSchema from "../config/validations/shippingAdress.js"
import paymentMethodSchema from "../config/validations/paymentMethod.js"
import Joi from 'joi'

/**
 *  Cria um novo pedido e os seus itens
 */
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(404).send({
                status: false,
                message: 'usuario nao econtrado'
            })
        }
        const userOrder = req.body;
        if ( userOrder === undefined) {
            console.log(`erro de pedido ${userOrder}`)
            return res.status(400).json({
                status: false,
                message: "verifique os dados se foram bem informados"
            })
        }

        //verificar o endereco de entrega
        if ( userOrder.shippingAddress === undefined ) {
            console.log(`endereco de entrega nao informado ${userOrder.shippingAddress}`)
            return res.status(400).json({
                status: false,
                message: "verifique o endereco de entrega"
            })
        }

        //verificar o metodo de pagamento
        if ( userOrder.paymentMethod === undefined ) {
            console.log(`erro de metodo pagamento ${userOrder.paymentMethod}`)
            return res.status(400).json({
                status: false,
                message: "informe o metodo de pagamento!!!"
            })
        }

        //validacao dos campos do endereco
        let { error, value} = shippingAdressSchema.validate(userOrder.shippingAddress)
        if(error){
            console.log(error)
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }

        console.log(value)

        //validacao dos campos do metodo de pagamento!!
        const validatePaymentSchema = paymentMethodSchema.validate(userOrder.paymentMethod)
        if(validatePaymentSchema.error) {
            console.log(validatePaymentSchema.error)
            return res.status(400).json({
                status: false,
                message: validatePaymentSchema.error.details[0].message
            })
        }
        console.log(validatePaymentSchema.value)

        //buscar carrinho do usuario com seus produtos para fazer o pedido
        const existsCart = await Cart.findOne({ user: userId })

        if (!existsCart) {
            return res.status(404).send({
                status: false,
                message: 'carrinho vazio'
            })
        }

        //pegar todas informacaes do carrinho
        const {_id, user, items, totalAmount } = existsCart
        //console.log(existsCart)
        // Calcula subtotal e total
        let subtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Produto ${item.product} não encontrado.`);
            subtotal += product.price * item.quantity;
        }
        //verificar o desconto
        let total
        if( !(userOrder.discount === undefined) ) {
            total = subtotal - userOrder.discount;
        }

        total = subtotal
        // Gera número de pedido único
        const orderNumber = `ORN-${Date.now()}`

        // Cria o pedido
        const order = await Order.create({
            orderNumber,
            userId,
            shippingAddress: userOrder.shippingAddress,
            discount: userOrder.discount,
            subtotal: subtotal,
            total: total,
            paymentMethod: userOrder.paymentMethod,
            status: 'pending'
        });
        console.log(order)
        process.exit()
        // Cria os itens associados
        const orderItems = items.map(i => ({
            order: order[0]._id,
            product: i.product,
            sku: i.sku,
            price: i.price,
            quantity: i.quantity
        }));

        const itemssevad = await itemsOrder.insertMany(orderItems);
        console.log(`teste: ${itemssevad}`);
        process.exit()
        return res.status(201).json({
            message: 'Pedido criado com sucesso.',
            order: order[0]
        });

    } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        return res.status(500).json({
            status: false,
            message: 'Erro ao criar pedido'

        });
    }
};

/**
 * 📦 Lista todos os pedidos (com populate dos itens e produtos)
 */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('shippingAddress')
            .populate('paymentMethod')
            .lean();

        for (const order of orders) {
            order.items = await OrderItem.find({ order: order._id })
                .populate('product', 'name price sku');
        }

        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

/**
 * 🔍 Obtém um pedido por ID (com itens)
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user', 'name email')
            .populate('shippingAddress')
            .populate('paymentMethod')
            .lean();

        if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

        order.items = await OrderItem.find({ order: id })
            .populate('product', 'name price sku');

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

/**
 * 🧾 Atualiza status, total ou outros campos do pedido
 */
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const order = await Order.findByIdAndUpdate(id, updates, { new: true });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
};

/**
 * ❌ Remove pedido e seus itens
 */
export const deleteOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        await OrderItem.deleteMany({ order: id }, { session });
        const order = await Order.findByIdAndDelete(id, { session });

        if (!order) throw new Error('Pedido não encontrado.');

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Pedido excluído com sucesso.' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: 'Erro ao excluir pedido.' });
    }
}

export {
    createOrder
}