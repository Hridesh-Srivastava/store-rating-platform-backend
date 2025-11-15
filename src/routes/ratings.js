import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { submitRating, getUserRatingForStore, getStoreRatings } from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', authMiddleware, submitRating);
router.get('/store/:storeId/user', authMiddleware, getUserRatingForStore);
router.get('/store/:storeId', getStoreRatings);

export default router;
