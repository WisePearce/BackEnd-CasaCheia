import express from "express"
import cors from "cors"
import { swaggerUi, swaggerSpec } from '../swegger.js' 
import {signin, loginUser, logoutUser, profileUser, update, password} from "./routes/authRoutes.js"
import helmet from "helmet"
import productRoutes from "./routes/productsRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import categorieRoutes from "./routes/categorieRoutes.js";
import dotenv from "dotenv"
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRouter.js";

const app = express()
dotenv.config()
//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())

//endereco base: http://localhost:3000/api/
//routes para usuario
app.use('/api/auth', signin)
app.use('/api/auth', loginUser)
app.use('/api/auth', logoutUser)
app.use('/api', profileUser)
app.use('/api', update)
app.use('/api', password)


//routes para produtos
app.use('/api', productRoutes);

//routes para carrinho
app.use('/api', cartRouter)

//rote para categorias
app.use('/api', categorieRoutes);

//routes para order (pedidos)
app.use('/api', orderRouter)

//api documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

//rota index
app.get('/', (req, res) => {
    res.send("API Casa-Cheia")
})

export default app
