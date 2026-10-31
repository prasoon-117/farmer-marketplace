import express from 'express';
import { register, login, me, demoLogin, getDemoAccounts } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.post('/demo-login', demoLogin);
router.get('/demo-accounts', getDemoAccounts);

export default router;
