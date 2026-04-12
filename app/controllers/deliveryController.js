// controllers/deliveryController.js
import storeSchema from '../models/myStoreModel.js';
import { calculateDistance, calculateDeliveryFee } from '../config/utils/deliveryFree.js';

export const getDeliveryFee = async (req, res) => {
  try {
    //pegando as coordenadas do cliente
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: false,
        message: 'Coordenadas do cliente são obrigatórias',
      });
    }

    const store = await storeSchema.findOne();
    if (!store) {
      return res.status(404).json({
        status: false,
        message: 'Coordenadas da loja não configuradas',
      });
    }
    //calcular a distancia entre o cliente e a loja
    const distanceKm = calculateDistance(
      store.latitude,
      store.longitude,
      latitude,
      longitude
    );

    //calcuar o valor da entrega com base na distancia do cliente em relação a loja.
    const fee = calculateDeliveryFee(distanceKm);

    return res.status(200).json({
      status: true,
      data: {
        distanceKm: distanceKm.toFixed(2),
        valor_entrega: fee,
        entrega_free: fee === 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
    });
  }
};