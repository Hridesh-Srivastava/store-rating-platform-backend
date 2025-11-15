import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { updatePassword, getAllUsers, getUserById, createUser } from '../controllers/userController.js';
import { validateSignup } from '../middleware/validation.js';

const router = express.Router();

router.put('/password', authMiddleware, updatePassword);
router.get('/', authMiddleware, requireRole(['system_admin']), getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.post('/', authMiddleware, requireRole(['system_admin']), validateSignup, createUser);

export default router;
