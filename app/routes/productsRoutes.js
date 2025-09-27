import express from "express"
import createProduct from "../controllers/productController.js"

const routes = express.Router()

const product = routes.post('/products', createProduct)

export default product