import orderModel from "../models/orderModel.js";
import itemsOrder from "../models/itemOrderModel.js";
import mongoose from "mongoose";

const getOrder = async (req, res) => {
    //pegar id do suario pelo requisicao(Payload)
    const userId = req.user.id;

    try {
        const order = await orderModel.find({ user: userId });

        //ver se o usuario nao tem nenhum pedido
        if (order.length == 0) {
            return res.status(404).json({
                status: false,
                message: "Nenhum pedido encontrado!"
            })
        }

        //pegar os produtos deste pedido  e juntar com o pedido  para retornar
        const results = await orderModel.aggregate([
            // 1️⃣ Apenas pedidos do usuário
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId)
                }
            },

            // 2️⃣ Join orders → itemsorders
            {
                $lookup: {
                    from: "itemsorders",
                    localField: "_id",
                    foreignField: "order",
                    as: "items"
                }
            },

            // 3️⃣ Explode os items para poder fazer outro lookup
            {
                $unwind: {
                    path: "$items",
                    preserveNullAndEmptyArrays: true
                }
            },

            // 4️⃣ Join items → products (para pegar o nome)
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "product"
                }
            },

            // 5️⃣ product vira objeto (não array)
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },

            // 6️⃣ Reagrupar tudo de volta por pedido
            {
                $group: {
                    _id: "$_id",
                    orderNumber: { $first: "$orderNumber" },
                    total: { $first: "$total" },
                    status: { $first: "$status" },
                    items: {
                        $push: {
                            productId: "$items.product",
                            productName: "$product.name",
                            price: "$items.price",       // 👈 preço do carrinho
                            quantity: "$items.quantity"
                        }
                    }
                }
            }
        ]);

        const finalResult = JSON.stringify(results, null, 2)
        console.log(finalResult);

        return res.status(200).json(results);


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Erro Interno no Servidor!"
        })
    }
}
const getAllOrders = async (req, res) => {
    try {
        const results = await orderModel.aggregate([
            {
                $lookup: {
                    from: 'itemsorders',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'produtos'
                }
            },
            { $unwind: { path: '$produtos', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'produtos.product',
                    foreignField: '_id',
                    as: 'produtos.details'
                }
            },
            {
                $addFields: {
                    'produtos.productName': { $arrayElemAt: ['$produtos.details.name', 0] },
                    'produtos.price': '$produtos.price'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    orderNumber: { $first: '$orderNumber' },
                    total: { $first: '$total' },
                    status: { $first: '$status' },
                    user: { $first: '$user' },
                    produtos: { $push: '$produtos' }
                }
            },
            { $project: { orderNumber: 1, total: 1, status: 1, user: 1, produtos: { productName: 1, price: 1, quantity: 1 } } }
        ]);

        return res.status(200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Erro ao buscar pedidos' });
    }
}

const updateStatusOrder = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
        // validar status permitido
        const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: 'Status inválido'
            });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                status: false, 
                message: 'Pedido não encontrado' 
            });
        }
        order.status = status;
        await order.save();

        return res.status(200).json({ 
            status: true, 
            message: 'Status atualizado com sucesso', 
            orderId, 
            novoStatus: status 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            status: false, 
            message: 'Erro ao atualizar status' 
        });
    }
}
export {
    getOrder,
    getAllOrders,
    updateStatusOrder
}