import { Router } from 'express';
import authenticateToken from '../middlewares/authMiddleware.js';
import { getDeliveryFee } from '../controllers/deliveryController.js';

const router = Router();

router.post('/delivery', authenticateToken, getDeliveryFee);

const deliveryRouter = router;

export default deliveryRouter;