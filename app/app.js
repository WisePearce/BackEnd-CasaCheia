import express from "express"
import cors from "cors"
import {signin, loginUser, logoutUser, profileUser, update, password} from "./routes/authRoutes.js"
import helmet from "helmet"
import productRoutes from "./routes/productsRoutes.js"
import categorieRoutes from "./routes/categorieRoutes.js";
import dotenv from "dotenv"

const app = express()
dotenv.config()
//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())

//routes para usuario
app.use('/api/auth', signin)
app.use('/api/auth', loginUser)
app.use('/api/auth', logoutUser)
app.use('/api', profileUser)
app.use('/api', update)
app.use('/api', password)


//routes para produtos
app.use('/api.casacheia', productRoutes);

//rote para categorias
app.use('/api.casacheia', categorieRoutes);

//rota index
app.get('/', (req, res) => {
    res.send("API Casa-Cheia")
})

export default app
