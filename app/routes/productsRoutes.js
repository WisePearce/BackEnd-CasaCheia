import express from "express"
import {createProduct, showAll, deleteProduct, searchProduct} from "../controllers/productController.js"

const routes = express.Router()

const product = routes.post('/products', createProduct)
const show = routes.get('/products', showAll)
const deleteOneProduct = routes.delete('/products/:id', deleteProduct)
const findOneProduct = routes.get('/products/:name', searchProduct)

export  {product, show, deleteOneProduct, searchProduct}