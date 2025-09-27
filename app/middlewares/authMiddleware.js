import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

//validar o Token pelo header da application
const authenticateToken = (req, res, next) => {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    //verificar se foi informado algum token
    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Nenhum token informado"
        })
    }

    //validar o token informado
    const tokenValidation = jwt.verify(token, process.env.JWT_KEY, (error, user) => {
        if (error) {
            return res.status(403).json({
                status: false,
                message: "token invalido"
            })
        }
        // guardar os dados do payload do user 
        req.user = user
        next()
    })

}

export default authenticateToken