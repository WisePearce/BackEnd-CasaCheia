import express from "express"
import {createProduct, showAll, deleteProduct, searchProduct} from "../controllers/productController.js"
import  upload  from "../middlewares/uploadMiddleware.js"

const routes = express.Router()

const product = routes.post('/products', upload.single("image"), createProduct)
const show = routes.get('/products', showAll)
const deleteOneProduct = routes.delete('/products/:id', deleteProduct)
const findOneProduct = routes.get('/products/:name', searchProduct)

export  {product, show, deleteOneProduct, findOneProduct}