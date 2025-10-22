import express from "express"
import {createProduct, showAll, deleteProduct, searchProduct} from "../controllers/productController.js"
import asyncUpload from "../middlewares/uploadMiddleware.js"
import authenticateToken from "../middlewares/authMiddleware.js"
import upload from "../config/multer/productUploads.js"

const routes = express.Router()

//routes para cadastrar produtos
const product = routes.post('/products', authenticateToken, asyncUpload(upload.array('images', 4)), createProduct)

//routes para listar todos os produtos
const show = routes.get('/products', showAll)

//routes para atualizar produtos
const updateProduct = routes.patch('/products/:id', authenticateToken, asyncUpload(upload.single), createProduct)    

//routes para deletar produtos
const deleteOneProduct = routes.delete('/products/:id', authenticateToken, deleteProduct)

//routes para buscar um produto pelo nome
const findOneProduct = routes.get('/products/:name', searchProduct)


//rxportar as rotas
export  {product, show, deleteOneProduct, findOneProduct}