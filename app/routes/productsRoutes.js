import express from "express";
import {
  createProduct,
  showAll,
  showById,
  searchProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import asyncUpload from "../middlewares/uploadMiddleware.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer/productUploads.js";

const routes = express.Router();

routes.get("/products", showAll);
routes.get("/products/search", searchProduct);
routes.get("/products/:id", showById);
routes.post("/products", authenticateToken, asyncUpload(upload.array("images", 4)), createProduct);
routes.patch("/products/:id", authenticateToken, upload.array("images", 4), updateProduct);
routes.delete("/products/:id", authenticateToken, deleteProduct);

const productRoutes = routes;
export default productRoutes;