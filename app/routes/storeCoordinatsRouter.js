import express from 'express';
import authenticateToken from "../middlewares/authMiddleware.js"
import {
  deleteStoreCoordinats,
  createStoreCoordinats,
  findCoordinats,
  updateStoreCoordinats
} from '../controllers/storeCoordinatsController.js'

const router = express.Router();

router.post('/coordinates', authenticateToken, createStoreCoordinats);
router.get('/coordinates', authenticateToken, findCoordinats);
router.put('/coordinates', authenticateToken, updateStoreCoordinats);
router.delete('/coordinates', authenticateToken, deleteStoreCoordinats);

export default router;