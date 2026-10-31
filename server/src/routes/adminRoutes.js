import express from 'express';
import {
  getDashboardStats,
  getAllProducts,
  moderateProduct,
  getAllUsers,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/products', getAllProducts);
router.patch('/products/:id/moderate', moderateProduct);
router.get('/users', getAllUsers);

export default router;
