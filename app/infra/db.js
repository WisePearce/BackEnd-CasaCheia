import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

async function connectDB() {

    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}ecomerce`, {
            maxPoolSize: 10
        }
        )
        console.log('conected to database')
    } catch (error) {
        console.log(`error on connection`)
        process.exit()
    }
}

export default connectDB