import dotenv from 'dotenv'
import app from "./app/app.js";
import connectDB from './app/infra/db.js';

dotenv.config()
const port = process.env.PORT

//conexao ao banco de dados
connectDB()

app.listen(port, () => {
    console.log(`spervidor rodando no enderece : http://localhost:${port}`)
})