import { Router } from 'express';
import authenticateTokenProfile from '../middlewares/authProfileMiddleware.js';
import { getDeliveryFee } from '../controllers/deliveryController.js';

const router = Router();

router.post('/delivery', authenticateTokenProfile, getDeliveryFee);

const deliveryRouter = router;

export default deliveryRouter;