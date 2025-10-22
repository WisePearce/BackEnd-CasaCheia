import db from "../infra/db.js"
import mongoose from "mongoose"
import categoryModel from "./categorieModel.js"

npm install cloudinary
# opcional para geração de URLs
npm install @cloudinary/url-gen
# opcional para integração com multer
npm install multer multer-storage-cloudinary

export default mongoose.model("product", productSchema)