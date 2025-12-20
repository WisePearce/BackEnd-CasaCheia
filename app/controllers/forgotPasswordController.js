import User from "../models/userModel.js";
import telefoneValidationSchema from "../config/validations/telefoneValidationSchema.js";
import ombalaService from "../config/services/ombalaService.js";
import generateCode from "../config/utils/randomCode.js";
import sendMessages from "../config/services/ombalaService.js"; 

const forgotPasswordController = async (req, res) => {

    try {

        if(req.body == undefined || Object.keys(req.body).length === 0){
            return res.status(400).json({
                status: false,
                message: "O campo telefone é obrigatório"
            });
        }
        const { error, value } = telefoneValidationSchema.validate(req.body); 
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }

        //buscar usuario pelo telefone
        const user = await User.findOne({ telefone: value.telefone }); 

        console.log("Usuario encontrado: ", user, value.telefone);
        //ver se o usuario existe
        if(!user){
            return res.status(404).json({
                status: false,
                message: "Usuário não encontrado"
            });
        }

        //gerar token de recuperação de senha e enviar por SMS ou emai
        const codeToSend = generateCode();


        return res.status(200).json({
            status: true,
            message: "Usuário encontrado", 
        })

    } catch (error) {
        console.error("Erro ao processar a solicitação de recuperação de senha: ", error);
        return res.status(500).json({
            status: false,
            message: "Erro interno do servidor"
        });
    }
}

export default forgotPasswordController;