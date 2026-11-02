import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
//nome do banco
//const database = process.env.DB_NAME;
//console.log(database)

async function connectDB() {

    try {
        const conn = await mongoose.connect(`${process.env.NODE_ENV==="development" ? process.env.MONGODB_URL_DEV : process.env.MONGODB_URL}`, {
            maxPoolSize: 10
        }
        )
        console.log('conected to database')
    } catch (error) {
        console.log(`error on connection`)
        console.log(error)
    }
}

export default connectDB