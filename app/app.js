import express from "express"
import cors from "cors"
import {signin, loginUser, logoutUser, profileUser, update, password} from "./routes/authRoutes.js"
import helmet from "helmet"
import productRoutes from "./routes/productsRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import categorieRoutes from "./routes/categorieRoutes.js";
import dotenv from "dotenv"
import cartRouter from "./routes/cartRoutes.js";

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
app.use('/api.casacheia', password)


//routes para produtos
app.use('/api.casacheia', productRoutes);

//routes para carrinho
app.use('/api.casacheia', cartRouter)

//rote para categorias
app.use('/api.casacheia', categorieRoutes);

//rota index
app.get('/', (req, res) => {
    res.send("API Casa-Cheia")
})

export default app
