import express from "express"
import {createProduct, showAll, deleteProduct, searchProduct, updateProduct, productPaginaction, showById} from "../controllers/productController.js"
import asyncUpload from "../middlewares/uploadMiddleware.js"
import authenticateToken from "../middlewares/authMiddleware.js"
import upload from "../config/multer/productUploads.js"

const routes = express.Router()

//pagination de produtos
//routes.get('/products/pagination', productPaginaction)
routes.get('/products/pagination', productPaginaction)

//routes para cadastrar produtos authenticateToken,
routes.post('/products',  authenticateToken, asyncUpload(upload.array('images', 4)), createProduct)

//routes para atualizar produtos authenticateToken,j
routes.patch('/products/:id',  authenticateToken, asyncUpload(upload.array('images', 4)), updateProduct)    

//routes para buscar um produto pelo nome
routes.get('/products', searchProduct)

//routes para listar todos os produtos
routes.get('/products', showAll)

//router para buscar produtos pelo id
routes.get('/products/:id', showById)


//routes para deletar produtos
routes.delete('/products/:id', authenticateToken, deleteProduct)


//routes para produtos
const productRoutes = routes
//rxportar as rotas
export default productRoutes