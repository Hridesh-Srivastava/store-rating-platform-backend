import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { createStore, getAllStores, getStoreById } from '../controllers/storeController.js';

const router = express.Router();

router.post('/', authMiddleware, requireRole(['system_admin']), createStore);
router.get('/', getAllStores);
router.get('/:id', getStoreById);

export default router;
