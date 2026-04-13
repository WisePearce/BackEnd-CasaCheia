import itemOrderModel from "../models/itemOrderModel.js";
import Order from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import mongoose from "mongoose";
import shippingAddressSchema from "../config/validations/shippingAdress.js";
import sendMessages from "../config/services/ombalaService.js";
import storeSchema from "../models/myStoreModel.js";
import { calculateDistance, calculateDeliveryFee } from "../config/utils/deliveryFree.js";

const checkOut = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  if (!req.body) {
    return res.status(400).json({
      status: false,
      message: "Dados do pedido inválidos.",
    });
  }

  const { payment, contactName, phoneNumber, street, city, coordinates } = req.body;
  const userId = req.user.id;

  try {
    // 1. Validar método de pagamento
    if (!payment || payment.trim() === "") {
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: "É obrigatório informar um método de pagamento.",
      });
    }

    // 2. Validar ID do utilizador
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: "ID do utilizador inválido.",
      });
    }

    // 3. Validar endereço de entrega
    const { error } = shippingAddressSchema.validate({
      contactName,
      phoneNumber,
      street,
      city,
      coordinates,
    });

    if (error) {
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }

    // 4. Buscar carrinho do cliente
    const cart = await cartModel.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({
        status: false,
        message: "Carrinho não encontrado ou vazio.",
      });
    }

    // 5. Forçar recálculo do totalAmount
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity, 0
    );

    // 6. Calcular taxa de entrega
    const store = await storeSchema.findOne();
    if (!store) {
      await session.abortTransaction();
      return res.status(500).json({
        status: false,
        message: "Configuração da loja não encontrada. Contacte o suporte.",
      });
    }

    if (!coordinates?.latitude || !coordinates?.longitude) {
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: "Coordenadas do cliente são obrigatórias.",
      });
    }

    const distanceKm = calculateDistance(
      store.latitude,
      store.longitude,
      coordinates.latitude,
      coordinates.longitude
    );
    const deliveryFee = calculateDeliveryFee(distanceKm);
    // 7. Gerar número único de pedido
    const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 8. Salvar subtotal antes de limpar o carrinho
    const subtotal = cart.totalAmount;

    // 9. Criar o pedido
    const order = new Order({
      orderNumber,
      user: userId,
      shippingAddress: {
        contactName,
        phoneNumber,
        street,
        city,
        coordinates: {
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        },
      },
      subtotal,
      deliveryFee,
      discount: 0,
      total: subtotal + deliveryFee,
      paymentMethod: payment,
      status: "pending",
    });

    await order.save({ session });

    // 10. Guardar os itens do pedido
    const orderItems = cart.items.map((item) => ({
      order: order._id,
      product: item.product,
      price: item.priceAtAdd,
      quantity: item.quantity,
    }));

    await itemOrderModel.insertMany(orderItems, { session });

    // 11. Limpar o carrinho
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    // 12. Confirmar transação
    await session.commitTransaction();

    // 13. Enviar SMS (fora da transação)
    sendMessages(
      "Encomenda confirmada! Um atendente entrará em contacto brevemente.",
      "Casa Cheia",
      phoneNumber
    ).catch(() => { });

    return res.status(201).json({
      status: true,
      message: "Pedido realizado com sucesso.",
      data: {
        numero_pedido: orderNumber,
        id_pedido: order._id,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
      },
    });

  } catch (error) {
    await session.abortTransaction();
    console.log(error.message);
    return res.status(500).json({
      status: false,
      message: "Erro interno no servidor. Contacte o suporte técnico.",
    });
  } finally {
    session.endSession();
  }
};

export default checkOut;