import User from "../models/userModel.js"
import userDataValidation from "../config/validation.js"

const register = async (req, resp) => {
    try {
        const dados = req.body
        console.log(dados)

        //ver se o usuario ja existe
        const email = dados.email
        const verifyUser = await User.findOne({email: email})
        if(verifyUser){
            return resp.status(422).json({
                status: false,
                message: "Este endereco de email, ja se encontra em uso!"
            })
        }

        //validar os dados vindo do usuario
        const {error, value} = userDataValidation.validate(dados)

        if(error) {
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
export default register