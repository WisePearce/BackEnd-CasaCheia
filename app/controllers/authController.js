import User from "../models/userModel.js"
import { userDataValidation, telefonePasswordValidation, nameTelefoneValidation, telefoneValidation } from "../config/validation.js"
import updateSchema from "../config/updateSchema.js"
import { passwordVerification, hash_password } from "../config/passwordHash.js"
import jwt from "jsonwebtoken"
import Token from "../models/tokenModel.js"
import changePassword from "../config/changePassword.js"
import redisClient from "../config/services/redis.js";
import sendMessages from "../config/services/ombalaService.js";
import authenticateToken from "../middlewares/authMiddleware.js"
import argon2 from "argon2";
import dotenv from "dotenv";
import generateCode from "../config/utils/randomCode.js";

dotenv.config()

const signup = async (req, resp) => {
    try {
        const dados = req.body

        if (dados === undefined) {
            console.log(`erro nos campos para fazer cadastro ${dados}`)
            return resp.status(400).json({
                status: false,
                message: "define o name, telefone, password, role (admin ou user) de forma correta!!!"
            })
        }
        //validar os dados vindo do usuario
        const { error, value } = userDataValidation.validate(dados)

        if (error) {
            return resp.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }

        //ver se o usuario ja existe
        const telefone = value.telefone
        const verifyUser = await User.findOne({ telefone: telefone })
        if (verifyUser) {
            return resp.status(422).json({
                status: false,
                message: "Use outro numero de telefone porfavor!"
            })
        }
        //gerar codigo de 6 digitos e fazer o hash
        const codeToSend = generateCode();
        const hashedCode = await argon2.hash(codeToSend);

        //redis aqui entra em accao para guardar o hash por 10 minutos
        const parseRedisData = await redisClient.setEx(`new-user: ${telefone}`, 3600, JSON.stringify({
            code: hashedCode,
            attempts: 0,
            userData: value
        }));

        //enviar o codigo da sms de 6 digitos para o usuario
        const send = await sendMessages(`Seu código de abertura da conta é: ${codeToSend}`, 'Casa Cheia', telefone);


        //enviar resposta para o cliente
        return resp.status(200).json({
            status: true,
            message: "Codigo de verificacao enviado com sucesso! por favor verifique seu telefone.",
            telefone: telefone
        });

    } catch (error) {
        resp.status(500).json({
            status: false,
            message: "erro interno no servidor",
            error: error.message
        })
    }
}

const signin = async (req, res) => {
    try {
        const data = req.body
        if (data === undefined) {
            console.log(`erro nos campos para fazer login ${data}`)
            return res.status(400).json({
                status: false,
                message: "define os campos telefone e password de forma correta!!!"
            })
        }
        //validar os campos telefone e password
        const { error, value } = telefonePasswordValidation.validate(data)
        if (error) {
            console.log(error.details[0].message)
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        //ver se o usuario ja existe
        const telefone = data.telefone
        const verifyUser = await User.findOne({ telefone: telefone })
        if (!verifyUser) {
            return res.status(404).json({
                status: false,
                message: "Usuario nao encontrado!"
            })
        }

        //verificar se as passwords batem certo
        const hash = verifyUser.password
        const isMatch = await passwordVerification(hash, data.password)
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "telefone ou password incorreta!"
            })
        }

        //dados do ususario correto, ele vai ser autenticado gerando um token !
        const token = jwt.sign(
            {
                id: verifyUser._id,
                telefone: verifyUser.telefone,
                role: verifyUser.role
            },
            process.env.JWT_KEY,
            { expiresIn: '4h' }
        )
        //gerar o refresh token para o cliente (user) e salvar no banco de dados
        const userRefreshToken = jwt.sign(
            {
                id: verifyUser._id,
                telefone: verifyUser.telefone
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        )

        //salvar o refreshToken no banco
        await Token.create({
            userId: verifyUser._id,
            token: userRefreshToken
        })

        return res.status(200).json({
            status: true,
            message: "usuario logado com sucesso!",
            user: {
                status: true,
                id: verifyUser._id,
                name: verifyUser.name,
                telefone: verifyUser.telefone
            },
            token
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "erro interno no servidor",
            error: error.message
        })
    }
}
const refreshToken = async (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) {
        return res.status(401).json({
            status: false,
            message: "Token de atualização não fornecido."
        });
    }

    try {
        // verifica se existe no banco
        const storedToken = await Token.findOne({ token: refreshToken })

        if (!storedToken) {
            return res.status(403).json({
                status: false,
                message: "Refresh token inválido."
            })
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    status: false,
                    message: "Refresh token expirado."
                });
            }

            // gera novo access token
            const accessToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "50m" }
            );

            res.json({ status: true, accessToken })
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
};
const logout = async (req, res) => {

    try {
        const refreshToken = req.body.token
        //deletando o refresh token do banco de dados
        const tokenDeleted = await Token.deleteOne({ token: refreshToken })

        if (!tokenDeleted.deletedCount) {
            return res.status(401).json({
                status: false,
                message: "falha ao realizar logout!"
            })
        }
        return res.status(200).json({
            message: "logout realizado com sucesso!"
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error
        })
    }
}
const profile = async (req, res) => {
    try {

        const payload = req.user
        console.log(payload)

        const user = await User.findById({ _id: payload.id }).select("-password -_id")
        return res.status(200).json({
            status: true,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}
const updateUser = async (req, res) => {
    try {
        const dados = req.body

        if (dados === undefined || Object.keys(dados).length === 0) {
            console.log(`erro nos campos para atualizar dados ${dados}`)
            return res.status(400).json({
                status: false,
                message: "define o name ou telefone de forma correta para fazer o update!!!",
                nota: "telefone deve ser unico, para usar como credencial de login"
            })
        }

        const payload = req.user
        const { error, value } = updateSchema.validate(dados)

        if (error) {
            console.log("Erro de validacao dos campos")
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        if (value.telefone == undefined && value.name == undefined) {
            console.log("Nenhum campo para atualizar")
            return res.status(400).json({
                status: false,
                message: "Nenhum campo para atualizar"
            })
        }
        const verUser = await User.findById(payload.id);
        if (!verUser) {
            console.log("Usuario nao encontrado para atualizar os dados!")
            return res.status(404).json({
                status: false,
                message: "Usuario nao encontrado para atualizar os dados!"
            })
        }
        if (value.name) verUser.name = value.name.trim();

        if (value.telefone) {
            const user = await User.find({ telefone: value.telefone });
            if (user.length !== 0) {
                console.log(user, "Numero de telefone Invalido!")
                return res.status(400).json({
                    status: false,
                    message: "Numero de telefone Invalido!"
                })
            }
            verUser.telefone = value.telefone.trim();
        }

        // Salva as alterações
        await verUser.save();
        return res.json({ message: 'Dados atualizado com sucesso!' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: 'Erro interno no servidor, contacte o suporte tecnico' });
    }

}
const updatePassword = async (req, res) => {
    try {
        const payload = req.user
        if (req.body === undefined || Object.keys(req.body).length === 0 || !req.body.newPassword || !req.body.currentPassword) {
            console.log("erro nos campos para atualizar password")
            return res.status(400).json({
                status: false,
                message: "define a nova senha e a atual para fazer o update!!!"
            })
        }
        const { newPassword, currentPassword } = req.body

        //validar os campos

        const { error, value } = changePassword.validate({ newPassword, currentPassword })

        if (error) {
            console.log(error)
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }

        const userFounded = await User.findById(payload.id)
        console.log(userFounded)

        if (!userFounded) {
            console.log(userFounded)
            return res.status(404).json({
                status: false,
                message: "dados nao encontrado"
            })
        }

        //verificar a password
        const passwordMatch = await passwordVerification(userFounded.password, currentPassword)

        console.log("teste: ", passwordMatch)

        if (!passwordMatch) {
            console.log("password atual incorreta")
            return res.status(401).json({
                status: false,
                message: "sua senha antiga esta incorreta!"
            })
        }

        //adicionado a nova password no user
        userFounded.password = newPassword
        //salvar nova senha no banco de dados
        await userFounded.save()

        return res.status(200).json({
            status: true,
            message: "password atualizada com sucesso!"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "erro interno no servidor"
        })
    }
}

const verifyCode = async (req, resp) => {
    try {
        //verificar se o telefone e o codigo foram enviados
        if (req.body === undefined || Object.keys(req.body).length === 0) {
            console.log("erro nos campos para verificar codigo")
            return resp.status(400).json({
                status: false,
                message: "define o telefone e o codigo de forma correta!!!"
            })
        }

        const { telefone, code } = req.body;
        if (!telefone || !code) {
            return resp.status(400).json({
                status: false,
                message: "Telefone e código são obrigatórios."
            });
        }

        //validar telefone
        const { error, value } = telefoneValidation.validate({telefone});
        if (error) {
            console.log(`Erro de validacao do campo telefone: ${error}`);
            return resp.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }
        //recuperar os dados do redis
        const redisData = await redisClient.get(`new-user: ${telefone}`);
        if (!redisData) {
            return resp.status(400).json({
                status: false,
                message: "Código expirado ou inválido | verifique o numero de telefone. Por favor, registre-se novamente."
            });
        }
        const parseData = JSON.parse(redisData);

        //verficar o numero de tentativas
        if (parseData.attempts >= 3) {
            await redisClient.del(`new-user: ${telefone}`);
            console.error("Número máximo de tentativas excedido para o código de verificação");
            return resp.status(429).json({
                status: false,
                message: "Número máximo de tentativas excedido. Por favor, registre-se novamente."
            });
        }

        //verificar o codigo
        const isCodeValid = await argon2.verify(parseData.code, code);

        if (!isCodeValid) {
            parseData.attempts += 1;
            //atualizar o numero de tentativas no redis
            await redisClient.setEx(`new-user: ${telefone}`, 60 * 50, JSON.stringify(parseData));
            console.log("Codigo de verificação inválido");
            return resp.status(400).json({
                status: false,
                message: "Código de verificação inválido."
            });
        }
        //pegar os dados do usuario para cadastrar
        const dados = new Object(parseData.userData);
        console.log(dados);
        console.log(typeof dados);

        //Os dados estao limpos entao, bora cadastrar
        const user = await User.create(dados)
        //gerar token para autenticacao
        const token = jwt.sign(
            {
                id: user._id,
                telefone: user.telefone,
                role: user.role
            },
            process.env.JWT_KEY,
            { expiresIn: '4h' }
        )

        //gerar o refresh token para o cliente (user) e salvar no banco de dados
        const userRefreshToken = jwt.sign(
            {
                id: user._id,
                telefone: user.telefone,
                role: user.role
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        )

        //salvar o refreshToken no banco
        await Token.create({
            userId: user._id,
            token: userRefreshToken
        })

        //resposta para o cliente -> front
        resp.status(201).json({
            status: true,
            message: "usuario criado com sucesso e autenticado com sucesso!",
            id: user._id,
            name: user.name,
            telefone: user.telefone,
            role: user.role,
            createdAt: user.createdAt,
            "token": token
        })
    } catch (error) {
        console.log(error);
        resp.status(500).json({
            status: false,
            message: "Erro interno no servidor"
        });
    }

}

export {
    signup,
    signin,
    refreshToken,
    logout,
    profile,
    updateUser,
    updatePassword,
    verifyCode
};