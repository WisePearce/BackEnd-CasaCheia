import orderModel from "../models/orderModel.js";
import itemsOrder from "../models/itemOrderModel.js";
import mongoose from "mongoose";

const getOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    const results = await orderModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "itemsorders",
          localField: "_id",
          foreignField: "order",
          as: "items"
        }
      },
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          orderNumber: { $first: "$orderNumber" },
          total: { $first: "$total" },
          subtotal: { $first: "$subtotal" },
          discount: { $first: "$discount" },
          status: { $first: "$status" },
          paymentMethod: { $first: "$paymentMethod" },
          shippingAddress: { $first: "$shippingAddress" }, // ✅ adicionado
          createdAt: { $first: "$createdAt" },
          items: {
            $push: {
              productId: "$items.product",
              productName: "$product.name",
              price: "$items.price",
              quantity: "$items.quantity"
            }
          }
        }
      },
      { $sort: { createdAt: -1 } } // ✅ mais recente primeiro
    ]);

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Nenhum pedido encontrado!"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Pedidos encontrados",
      data: results
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Erro Interno no Servidor!"
    });
  }
};

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
          shippingAddress: { $first: '$shippingAddress' }, // ✅ adicionado
          createdAt: { $first: '$createdAt' },
          produtos: { $push: '$produtos' }
        }
      },
      {
        $project: {
          orderNumber: 1,
          total: 1,
          status: 1,
          user: 1,
          shippingAddress: 1, // ✅ adicionado
          createdAt: 1,
          produtos: { productName: 1, price: 1, quantity: 1 }
        }
      },
      { $sort: { createdAt: -1 } } // ✅ mais recente primeiro
    ]);

    return res.status(200).json({
      status: true,
      message: "Pedidos encontrados",
      data: results
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Erro ao buscar pedidos'
    });
  }
};

const updateStatusOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
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
      id_pedido: orderId,
      novo_status: status
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Erro ao atualizar status'
    });
  }
};

export {
  getOrder,
  getAllOrders,
  updateStatusOrder
};