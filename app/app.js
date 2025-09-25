import express from "express"
import cors from "cors"
import {signin, loginUser} from "./routes/Auth.js"
import helmet from "helmet"

const app = express()

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())
//caminho: http://localhost:3000/api/v1/sigin
app.use('/api/v1', signin)
app.use('/api/v1', loginUser)

app.get('/', (req, res) => {
    res.json({message: "tudo ok"})
})

export default app
