import { Router } from 'express';
import { createBanner, getBanners, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import asyncUpload from "../middlewares/uploadMiddleware.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer/productUploads.js";

const router = Router();

router.get('/banners', getBanners);
router.post('/banners', authenticateToken, asyncUpload(upload.array('images', 4)), createBanner);
router.put('/banners/:id', authenticateToken, asyncUpload(upload.array('images', 4)), updateBanner);
router.delete('/banners/:id', authenticateToken, deleteBanner);

const bannerRouter = router;
export default bannerRouter;