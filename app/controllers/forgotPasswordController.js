import User from "../models/userModel.js";
import telefoneValidationSchema from "../config/validations/telefoneValidationSchema.js";
import generateCode from "../config/utils/randomCode.js";
import sendMessages from "../config/services/ombalaService.js"; 
import redisClient from "../config/services/redis.js";
import hashCode from "../config/utils/hashCode.js";
import { telefonePasswordValidation } from "../config/validation.js";
import argon2 from "argon2";
import { hash_password } from "../config/passwordHash.js";

const forgotPassword = async (req, res) => {

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

        //ver se o usuario existe
        if(!user){
            return res.status(404).json({
                status: false,
                message: "Usuário não encontrado"
            });
        }

        //gerar token de recuperação de senha e enviar por SMS ou emai
        const codeToSend = generateCode();
        const hashedCode = await hashCode(codeToSend);
        const redisResult = await redisClient.setEx(`forgot-password:${user.telefone}`, 3600, JSON.stringify({
            code: hashedCode,
            attempts: 0
        })); // Expira em 10 minutos

        //enviando o codigo por sms ao cliente
        const send = await sendMessages(`Seu código de recuperação de senha é: ${codeToSend}`, 'CASA-CHEIA', user.telefone);


        return res.status(200).json({
            status: true,
            message: "Código de recuperação de senha enviado com sucesso", 
        })

    } catch (error) {
        console.error("Erro ao processar a solicitação de recuperação de senha: ", error);
        return res.status(500).json({
            status: false,
            message: "Erro interno do servidor"
        });
    }
}

const resetPassword = async (req, res) => {
    try {
        if(req.body == undefined || Object.keys(req.body).length === 0){
            return res.status(400).json({
                status: false,
                message: "Os campos telefone, código e nova senha são obrigatórios"
            });
        }

        const { telefone, code, password } = req.body;

        if(!code || code.trim() === "" || code === undefined){
            return res.status(400).json({
                status: false,
                message: "Precisa inserir o código de recuperação enviado ao seu telefone"
            });
        }

        const { error , value} = telefonePasswordValidation.validate({ telefone, password });

        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }
        //verificar se o codigo existe no redis
        const redisData = await redisClient.get(`forgot-password:${value.telefone}`);

        if(!redisData){
            return res.status(400).json({
                status: false,
                message: "Codigo de recuperação expirado ou telefone inválido."
            });
        }

        const parseRedisData = JSON.parse(redisData);

        //verificar as tentativas
        if(parseRedisData.attempts >=3) {
            await redisClient.del(`forgot-password:${value.telefone}`);
            console.error("Número máximo de tentativas excedido para o código de recuperação");
            return res.status(429).json({
                status: false,
                message: "Muitas tentativas invalidas. Solicite um novo codigo de recuperação"
            })
        }

        //validar o codigo pelo hash
        const iscodeValid = await argon2.verify(parseRedisData.code, code);
        
        if(!iscodeValid){
            console.log("Codigo de verificação inválido");
            //incrementar as tentativas
            parseRedisData.attempts += 1;
            //mater o ttl original

            const ttl = await redisClient.ttl(`forgot-password:${value.telefone}`);
            await redisClient.setEx(`forgot-password:${value.telefone}`, ttl, JSON.stringify(parseRedisData));
            return res.status(400).json({
                status: false,
                message: "Código de recuperação inválido"
            });
        }

        //codigo valido, atualizar a password do usuario
        const hashedPassword = await hash_password(value.password);

        const updatePassword = await User.updateOne({ telefone: value.telefone }, { $set: { password: hashedPassword }});

        //deletar o registro do redis

        await redisClient.del(`forgot-password:${value.telefone}`);

        return res.status(200).json({
            status: true,
            message: "Senha redefinida com sucesso"
        });

    } catch (error) {
        console.error("Erro ao redefinir a senha: ", error);
        return res.status(500).json({
            status: false,
            message: "Erro interno do servidor"
        });
    }
}

export { 
    forgotPassword, 
    resetPassword 
};