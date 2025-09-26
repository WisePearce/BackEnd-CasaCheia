import jwt from 'jsonwebtoken'
import dotenv from "dotenv"

const verifyToken = (req, res, next) => {

    const authHeader = req.headers["authorization"] 
    const token  = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({
            status: false,
            message: "Acesso negado. token nao informado!"
        })
    }

    jwt.verify(token, process.env.JWT_KEY, (error, user) => {
        if(error){
            return res.status(403).json({
                status: false,
                message: "token invalido ou expirado."
            })
        }
        req.user = user
        next()
    })

}