import User from "../models/userModel.js"
import { userDataValidation, telefonePasswordValidation } from "../config/validation.js"
import { passwordVerification } from "../config/passwordHash.js"
import jwt from "jsonwebtoken"
import Token from "../models/tokenModel.js"
import authenticateToken from "../middlewares/authMiddleware.js"
import dotenv from "dotenv"

dotenv.config()

const register = async (req, resp) => {
    try {
        const dados = req.body
        console.log(dados)

        //ver se o usuario ja existe
        const telefone = dados.telefone
        const verifyUser = await User.findOne({ telefone: telefone })
        if (verifyUser) {
            return resp.status(422).json({
                status: false,
                message: "Use outro numero de telefone porfavor!"
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
            { expiresIn: '30min' }
        )
        //resposta para o cliente -> front
        resp.status(201).json({
            status: true,
            message: "usuario criado com sucesso e autenticado com sucesso!",
            user: {
                id: user._id,
                name: user.name,
                telefone: user.telefone,
                role: user.role,
                createdAt: user.createdAt
            },
            token
        })

    } catch (error) {
        resp.status(500).json({
            status: false,
            message: "erro interno no servidor",
            error: error.message
        })
    }
}

const login = async (req, res) => {
    try {
        const dados = req.body

        //validar os campos telefone e password
        const { error, value } = telefonePasswordValidation.validate(dados)
        if (error) {

            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }

        //ver se o usuario ja existe
        const telefone = dados.telefone
        const verifyUser = await User.findOne({ telefone: telefone })
        if (!verifyUser) {
            return res.status(404).json({
                status: false,
                message: "Usuario nao encontrado!"
            })
        }

        //verificar se as passwords batem certo
        const hash = verifyUser.password
        const isMatch = await passwordVerification(hash, dados.password)
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Email ou password incorreta!"
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
            { expiresIn: '30min' }
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
                { expiresIn: "15m" }
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
            status: true,
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

        const id = req.user['id']
        const user = await User.findById({ _id: id }).select("-password -_id")
        return res.json(user)
        process.exit()
        return res.status(200).json({
            status: true,
            user
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}


export { register, login, refreshToken, logout, profile } 