import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "canceled"],
  confirmed: ["shipped", "canceled"],
  shipped: ["delivered"],
  delivered: [],
  canceled: [],
};

const STATUS_LABELS = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  shipped: "Em entrega",
  delivered: "Entregue",
  canceled: "Cancelado",
};

const getOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "ID de utilizador inválido." });
    }

    const results = await orderModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: "itemsorders", localField: "_id", foreignField: "order", as: "items" } },
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "product.categoryDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          orderNumber: { $first: "$orderNumber" },
          status: { $first: "$status" },
          paymentMethod: { $first: "$paymentMethod" },
          shippingAddress: { $first: "$shippingAddress" },
          createdAt: { $first: "$createdAt" },
          shippedAt: { $first: "$shippedAt" },
          deliveredAt: { $first: "$deliveredAt" },
          subtotal: { $first: "$subtotal" },
          deliveryFee: { $first: "$deliveryFee" },
          discount: { $first: "$discount" },
          total: { $first: "$total" },
          items: {
            $push: {
              productId: "$items.product",
              productName: "$product.name",
              category: { $arrayElemAt: ["$product.categoryDetails.name", 0] },
              image: { $arrayElemAt: ["$product.image", 0] },
              unitPrice: "$items.price",
              quantity: "$items.quantity",
              totalItem: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
      },
      {
        $project: {
          orderNumber: 1,
          createdAt: 1,
          shippedAt: 1,
          deliveredAt: 1,
          status: 1,
          statusLabel: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "pending"] }, then: "Aguardando confirmação" },
                { case: { $eq: ["$status", "confirmed"] }, then: "Confirmado" },
                { case: { $eq: ["$status", "shipped"] }, then: "Em entrega" },
                { case: { $eq: ["$status", "delivered"] }, then: "Entregue" },
                { case: { $eq: ["$status", "canceled"] }, then: "Cancelado" },
              ],
              default: "Desconhecido",
            },
          },
          paymentMethod: 1,
          entrega: {
            contactName: "$shippingAddress.contactName",
            phoneNumber: "$shippingAddress.phoneNumber",
            street: "$shippingAddress.street",
            city: "$shippingAddress.city",
            coordinates: "$shippingAddress.coordinates",
          },
          items: 1,
          totalItens: { $size: "$items" },
          resumoFinanceiro: {
            subtotal: "$subtotal",
            deliveryFee: { $ifNull: ["$deliveryFee", 0] },
            discount: { $ifNull: ["$discount", 0] },
            total: "$total",
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      status: true,
      message: results.length === 0 ? "Nenhum pedido encontrado." : "Pedidos encontrados.",
      total: results.length,
      data: results,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: false, message: "Erro interno no servidor." });
  }
};

const getAllOrders = async (req, res) => {

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const { status: filterStatus } = req.query;

  const matchStage = filterStatus ? { status: filterStatus } : {};

  try {
    const [results, total] = await Promise.all([
      orderModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $lookup: { from: "itemsorders", localField: "_id", foreignField: "order", as: "produtos" } },
        { $unwind: { path: "$produtos", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "products",
            localField: "produtos.product",
            foreignField: "_id",
            as: "produtos.details",
          },
        },
        {
          $addFields: {
            "produtos.productName": { $arrayElemAt: ["$produtos.details.name", 0] },
            "produtos.image": { $arrayElemAt: [{ $arrayElemAt: ["$produtos.details.image", 0] }, 0] },
            "produtos.totalItem": { $multiply: ["$produtos.price", "$produtos.quantity"] },
          },
        },
        {
          $group: {
            _id: "$_id",
            orderNumber: { $first: "$orderNumber" },
            status: { $first: "$status" },
            paymentMethod: { $first: "$paymentMethod" },
            shippingAddress: { $first: "$shippingAddress" },
            createdAt: { $first: "$createdAt" },
            shippedAt: { $first: "$shippedAt" },
            deliveredAt: { $first: "$deliveredAt" },
            subtotal: { $first: "$subtotal" },
            deliveryFee: { $first: "$deliveryFee" },
            discount: { $first: "$discount" },
            total: { $first: "$total" },
            user: {
              $first: {
                name: { $arrayElemAt: ["$userDetails.name", 0] },
                email: { $arrayElemAt: ["$userDetails.email", 0] },
                phone: { $arrayElemAt: ["$userDetails.phone", 0] },
              },
            },
            produtos: {
              $push: {
                productName: "$produtos.productName",
                image: "$produtos.image",
                unitPrice: "$produtos.price",
                quantity: "$produtos.quantity",
                totalItem: "$produtos.totalItem",
              },
            },
          },
        },
        {
          $project: {
            orderNumber: 1,
            createdAt: 1,
            shippedAt: 1,
            deliveredAt: 1,
            status: 1,
            statusLabel: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "pending"] }, then: "Aguardando confirmação" },
                  { case: { $eq: ["$status", "confirmed"] }, then: "Confirmado" },
                  { case: { $eq: ["$status", "shipped"] }, then: "Em entrega" },
                  { case: { $eq: ["$status", "delivered"] }, then: "Entregue" },
                  { case: { $eq: ["$status", "canceled"] }, then: "Cancelado" },
                ],
                default: "Desconhecido",
              },
            },
            paymentMethod: 1,
            user: 1,
            entrega: {
              contactName: "$shippingAddress.contactName",
              phoneNumber: "$shippingAddress.phoneNumber",
              street: "$shippingAddress.street",
              city: "$shippingAddress.city",
            },
            produtos: 1,
            totalItens: { $size: "$produtos" },
            resumoFinanceiro: {
              subtotal: "$subtotal",
              deliveryFee: { $ifNull: ["$deliveryFee", 0] },
              discount: { $ifNull: ["$discount", 0] },
              total: "$total",
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      orderModel.countDocuments(matchStage),
    ]);

    return res.status(200).json({
      status: true,
      message: "Pedidos encontrados.",
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: results,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: false, message: "Erro ao buscar pedidos." });
  }
};

const updateStatusOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ status: false, message: "ID do pedido inválido." });
  }

  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: false, message: "Pedido não encontrado." });
    }

    const allowedTransitions = STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Transição inválida. De "${order.status}" só é possível ir para: ${allowedTransitions.join(", ") || "nenhum estado"}.`,
      });
    }

    order.status = status;
    if (status === "shipped") order.shippedAt = new Date();
    if (status === "delivered") order.deliveredAt = new Date();

    await order.save();

    return res.status(200).json({
      status: true,
      message: "Status atualizado com sucesso.",
      data: {
        id_pedido: orderId,
        novo_status: status,
        statusLabel: STATUS_LABELS[status],
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Erro ao atualizar status." });
  }
};

export { getOrder, getAllOrders, updateStatusOrder };