import User from "../models/userModel.js"
import { userDataValidation, emailPasswordValidation } from "../config/validation.js"
import { passwordVerification } from "../config/passwordHash.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const register = async (req, resp) => {
    try {
        const dados = req.body
        console.log(dados)

        //ver se o usuario ja existe
        const email = dados.email
        const verifyUser = await User.findOne({ email: email })
        if (verifyUser) {
            return resp.status(422).json({
                status: false,
                message: "Este endereco de email, ja se encontra em uso!"
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
        resp.status(201).json({
            status: true,
            message: "usuario criado com sucesso!"
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

        //validar os campos email e password
        const { error, value } = emailPasswordValidation.validate(dados)
        if (error) {

            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }

        //ver se o usuario ja existe
        const email = dados.email
        const verifyUser = await User.findOne({ email: email })
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
                email: verifyUser.email
            },
            process.env.JWT_KEY,
            { expiresIn: '30min' }
        )

        return res.status(200).json({
            status: true,
            message: "usuario logado com sucesso!",
            user: {
                status: true,
                id: verifyUser._id,
                name: verifyUser.name,
                email: verifyUser.email
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
export { register, login } 