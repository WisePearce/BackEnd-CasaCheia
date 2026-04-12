import { Router } from "express";
import {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
  searchPartners,
  togglePartner,
} from "../controllers/partnerController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer/productUploads.js";

const route = Router();

route.get("/partners/search", authenticateToken, searchPartners);
route.get("/partners", authenticateToken, getPartners);
route.get("/partners/:id", authenticateToken, getPartnerById);
route.post("/partners", authenticateToken, upload.array("images", 4), createPartner);
route.patch("/partners/:id", authenticateToken, upload.array("images", 4), updatePartner);
route.patch("/partners/:id/toggle", authenticateToken, togglePartner);
route.delete("/partners/:id", authenticateToken, deletePartner);

const partnerRoutes = route;
export default partnerRoutes;