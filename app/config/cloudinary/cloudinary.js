dotenv.config()
import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.APY_KEY,
    api_secret: process.env.API_SECRET
})
console.log("teste da config: ", cloudinary)
console.log(process.env.CLOUDINARY_NAME,  process.env.APY_KEY, process.env.API_SECRET)
export default cloudinary