import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
//nome do banco
const database = process.env.DB_NAME;
console.log(database)

async function connectDB() {

    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}database`, {
            maxPoolSize: 10
        }
        )
        console.log('conected to database')
    } catch (error) {
        console.log(`error on connection`)
    }
}

export default connectDB