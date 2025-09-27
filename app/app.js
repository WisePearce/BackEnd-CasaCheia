import express from "express"
import cors from "cors"
import {signin, loginUser, logoutUser, profileUser} from "./routes/authRoutes.js"
import helmet from "helmet"

const app = express()

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())
//endereco base: http://localhost:3000/api/v1/s
app.use('/api.casacheia/auth', signin)
app.use('/api.casacheia/auth', loginUser)
app.use('/api.casacheia/auth', logoutUser)
app.use('/api.casacheia', profileUser)

app.get('/', (req, res) => {
    res.json({message: "tudo ok"})
})

export default app
