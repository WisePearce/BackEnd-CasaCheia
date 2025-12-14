import itemOrderModel from "../models/itemOrderModel.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
//import paymentMethodModel from "../models/paymentMethodModel.js";
import shippingAddressSchema from "../config/validations/shippingAdress.js";
import productModel from "../models/productModel.js";

const checkOut = async (req, res) => {
    //tipo de pagamento
    const payment = req.body.payment;

    //id do usuario vindo do payload
    const userId = req.id;

    //endereco de entrega
    const {contactName, phoneNumber, street, city, coordinates} = req.body;

    try {

        if(payment==undefined || payment == ''){
            console.log(`payment: ${payment}`);
            return res.status(400).json({
                status: false,
                message: "Precisa informar um metodo de pagamento"
            })
        }
        console.log(payment);

        //validar os campos de endereco de entrega

        const {error, value} = shippingAddressSchema.validate({
            contactName,
            phoneNumber, 
            street, 
            city, 
            coordinates
        });

        if(error){
            console.log(error.details[0].message);

            return res.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }

        //buscar carrinho do cliente

        const cart = await cartModel.findOne({user: userId});

        if(cart.items.length == 0){
            console.log(`dados do carrinho: ${cart}`);

            return res.status(404).json({
                status: false,
                message: "Carrinho vazio ou nao Encontrado!"
            })
        }


        //numero de pedido
        const random = Math.floor(100 + Math.random() * 900);

        const orderNumber = `ORD-${Date.now()}-${random}`;

        //totalAmount-> valor total dos produtos

        const { totalAmount } = cart;

        const order = await orderModel.create({
            "orderNumber": orderNumber,
            "user": userId,
            "shippingAddress": {
                "contactName": contactName,
                "phoneNumber": phoneNumber, 
                "street": street, 
                "city": city, 
                //"coordinates": coordinates
            },
            "subtotal": totalAmount,
            "total": totalAmount,
            "paymentMethod": payment,
            "status": "pending"
        });

        if(!order){
            console.log(`resposta do pedido: ${order}`);

            return res.status(404).json({
                status: false,
                message: "Pedido mal Succedido!"
            })
        }
        
        for(const items of cart.items){
            await itemOrderModel.create({
                "order": order._id,
                "product": items.product,
                "price": items.priceAtAdd,
                "quantity": items.quantity
            })
        }

        //limpar o carrinho
        cart.items = [];
        cart.totalAmount = 0;

        await cart.save();

        return res.status(201).json({
            status: true,
            message: "Pedido bem Succedido!",
            "Numero do Pedido": orderNumber,
            "Id_Pedido": order._id
        })

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Erro interno no servidor, Chame o suporte tecnico!"
        })
    }
}

export default checkOut;