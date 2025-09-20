import express from "express"
import cors from "cors"
import auth from "./routes/Auth.js"
import helmet from "helmet"

const app = express()

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())
app.use('/api', auth)


export default app
