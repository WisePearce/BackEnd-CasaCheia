import cartModel from "../models/cartModel.js";
import itemsOrder from "../models/itemOrderModel.js";

const getCart = async (req, res) => {
    //geting userId
    const idUser = req.id;

    try {
        //geting cartUser
        const cart = await cartModel.findOne({user: idUser});
        //se nao retornar nada
        if(!cart){
            return res.status(404).json({
                status: false,
                message: "nenhum carrinho encontrado!"
            })
        }
    } catch (error){
        return res.status(500).json({
            status: false,
            message: "Erro interno no Servidor!"
        })
    }
}

export default getCart;