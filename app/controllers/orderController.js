// src/controllers/order.controller.js
import Order from '../models/orderModel.js';
import ItemsOrder from '../models/itemOrderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import ShippingAddress from '../models/shippingAdressModel.js';
import PaymentMethod from '../models/paymentMethodModel.js';
import Joi from 'joi';


const checkoutSchema = Joi.object({
    shippingAddressId: Joi.string().hex().length(24).required(),
    paymentMethodId: Joi.string().hex().length(24).required(),
    discount: Joi.number().min(0).optional(),
});

const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid('processing', 'shipped', 'delivered', 'canceled', 'refunded')
        .required(),
});


const generateOrderNumber = async () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    let orderNumber = `${date}-${random}`;

    // Garante unicidade
    let exists = await Order.findOne({ orderNumber });
    let attempts = 0;
    while (exists && attempts < 10) {
        random = Math.floor(1000 + Math.random() * 9000);
        orderNumber = `${date}-${random}`;
        exists = await Order.findOne({ orderNumber });
        attempts++;
    }
    return orderNumber;
};

// === CONTROLLER ===
class OrderController {
    // POST /api/orders/checkout
    static async checkout(req, res) {
        const { error } = checkoutSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { shippingAddressId, paymentMethodId, discount = 0 } = req.body;

        try {
            // 1. Busca dados relacionados
            const [cart, shippingAddress, paymentMethod] = await Promise.all([
                Cart.findOne({ user: req.user._id }).populate('items.product'),
                ShippingAddress.findById(shippingAddressId),
                PaymentMethod.findById(paymentMethodId),
            ]);

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: 'Carrinho vazio' });
            }
            if (!shippingAddress) {
                return res.status(404).json({ message: 'Endereço não encontrado' });
            }
            if (!paymentMethod) {
                return res.status(404).json({ message: 'Método de pagamento não encontrado' });
            }

            // 2. Verifica estoque
            for (const item of cart.items) {
                if (item.product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Estoque insuficiente: ${item.product.name}`,
                    });
                }
            }

            // 3. Cria ItemsOrder
            const itemsOrderDocs = await Promise.all(
                cart.items.map(async (item) => {
                    const itemsOrder = new ItemsOrder({
                        product: item.product._id,
                        name: item.product.name,
                        price: item.priceAtAdd,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                    });
                    await itemsOrder.save();
                    return itemsOrder;
                })
            );

            // 4. Calcula totais
            const subtotal = cart.totalAmount;
            const total = subtotal - discount;

            if (total < 0) {
                return res.status(400).json({ message: 'Desconto maior que o subtotal' });
            }

            // 5. Gera orderNumber
            const orderNumber = await generateOrderNumber();

            // 6. Cria pedido
            const order = new Order({
                orderNumber,
                user: req.user._id,
                items: itemsOrderDocs.map(i => i._id),
                shippingAddress: shippingAddress._id,
                discount,
                subtotal,
                total,
                status: 'pending', // ou 'paid' se já cobrado
                paymentMethod: paymentMethod._id,
                shippedAt: null,
                deliveredAt: null,
            });

            await order.save();

            // 7. Atualiza estoque
            for (const item of cart.items) {
                await Product.findByIdAndUpdate(item.product._id, {
                    $inc: { stock: -item.quantity },
                });
            }

            // 8. Limpa carrinho
            await Cart.deleteOne({ user: req.user._id });

            // 9. Popula resposta
            await order.populate([
                { path: 'user', select: 'name email' },
                { path: 'items', populate: { path: 'product' } },
                { path: 'shippingAddress' },
                { path: 'paymentMethod' },
            ]);

            res.status(201).json({
                success: true,
                message: 'Pedido criado com sucesso',
                order,
            });
        } catch (err) {
            console.error('Checkout error:', err);
            res.status(500).json({ message: 'Erro ao processar pedido' });
        }
    }

    // GET /api/orders
    static async getUserOrders(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const query = { user: req.user._id };
            if (status) query.status = status;

            const orders = await Order.find(query)
                .populate([
                    { path: 'items', populate: { path: 'product', select: 'name image' } },
                    { path: 'shippingAddress' },
                    { path: 'paymentMethod' },
                ])
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const total = await Order.countDocuments(query);

            res.json({
                success: true,
                orders,
                pagination: { page: +page, limit: +limit, total },
            });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar pedidos' });
        }
    }

    // GET /api/orders/:id
    static async getOrderById(req, res) {
        try {
            const order = await Order.findOne({
                _id: req.params.id,
                user: req.user._id,
            }).populate([
                { path: 'items', populate: { path: 'product' } },
                { path: 'shippingAddress' },
                { path: 'paymentMethod' },
            ]);

            if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });

            res.json({ success: true, order });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar pedido' });
        }
    }

    // PATCH /api/orders/:id/status (admin)
    static async updateStatus(req, res) {
        const { error } = updateStatusSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { status } = req.body;

        try {
            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });

            // Regras de transição
            const validTransitions = {
                pending: ['processing', 'canceled'],
                processing: ['shipped', 'canceled'],
                shipped: ['delivered', 'refunded'],
            };

            if (!validTransitions[order.status]?.includes(status)) {
                return res.status(400).json({
                    message: `Transição inválida: ${order.status} → ${status}`,
                });
            }

            order.status = status;
            if (status === 'shipped') order.shippedAt = new Date();
            if (status === 'delivered') order.deliveredAt = new Date();

            await order.save();

            res.json({ success: true, message: 'Status atualizado', order });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao atualizar status' });
        }
    }
}

export default OrderController;