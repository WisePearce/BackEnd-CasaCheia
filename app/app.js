import express from "express"
import auth from "./routes/Auth.js"

const app = express()

//middlewares
app.use('/api', auth)


export default app
