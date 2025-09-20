import dotenv from 'dotenv'
import app from "./app/app.js";

dotenv.config()
const port = process.env.PORT

app.listen(port, () => {
    console.log(`spervidor rodando no enderece : http://localhost:${port}`)
})