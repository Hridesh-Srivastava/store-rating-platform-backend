import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { validateSignup } from '../middleware/validation.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', login);

export default router;
