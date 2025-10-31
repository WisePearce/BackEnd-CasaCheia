dotenv.config()
import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.APY_KEY,
    api_secret: process.env.API_SECRET
})
export default cloudinary