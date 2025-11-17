// src/controllers/order.controller.js
import Order from '../models/orderModel.js';
import ItemsOrder from '../models/itemOrderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
//import ShippingAddress from '../models/shippingAdressModel.js';
//import PaymentMethod from '../models/paymentMethodModel.js';
import Joi from 'joi';

/**
 *  Cria um novo pedido e os seus itens
 */
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log(session)
    process.exit()
    const userId = req.user._id

    try {
        const { items, shippingAddress, discount = 0, paymentMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('O pedido deve conter pelo menos um item.');
        }

        // Calcula subtotal e total
        let subtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Produto ${item.product} não encontrado.`);
            subtotal += product.price * item.quantity;
        }

        const total = subtotal - discount;

        // Gera número de pedido único
        const orderNumber = `ORD-${Date.now()}`;

        // Cria o pedido
        const order = await Order.create([{
            orderNumber,
            userId,
            shippingAddress,
            discount,
            subtotal,
            total,
            paymentMethod,
            status: 'pending'
        }], { session });

        // Cria os itens associados
        const orderItems = items.map(i => ({
            order: order[0]._id,
            product: i.product,
            sku: i.sku,
            price: i.price,
            quantity: i.quantity
        }));

        await ItemsOrder.insertMany(orderItems, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: 'Pedido criado com sucesso.',
            order: order[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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