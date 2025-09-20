import User from "../models/user.model.js"
const create = async (req, resp) => {
    const dados = req.body

    try {
        const user = User.create(dados)
        resp.status(201).json({    
            status: true,
            message: "usuario criado"
        })
    } catch (error) {
        resp.status(500).json({
            status: false,
            message: error.message
        })
    }
}
export default create