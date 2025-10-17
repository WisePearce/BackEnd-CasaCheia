import express from "express"
import cors from "cors"
import {signin, loginUser, logoutUser, profileUser, update} from "./routes/authRoutes.js"
import helmet from "helmet"
import {product, show, deleteOneProduct, findOneProduct} from "./routes/productsRoutes.js"
import dotenv from "dotenv"

const app = express()
dotenv.config()
//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())

//endereco base: http://localhost:3000/api/v1/supdate
//routes para usuario
app.use('/api.casacheia/auth', signin)
app.use('/api.casacheia/auth', loginUser)
app.use('/api.casacheia/auth', logoutUser)
app.use('/api.casacheia', profileUser)
app.use('/api.casacheia', update)


//routes para produtos
app.use('/api.casacheia', product)
app.use('/api.casacheia', show)
app.use('/api.casacheia', deleteOneProduct)
app.use('/api.casacheia', findOneProduct)


//rota index
app.get('/', (req, res) => {
    res.send("API Casa-Cheia")
})

export default app
