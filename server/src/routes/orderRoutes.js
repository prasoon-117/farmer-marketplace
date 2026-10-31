import express from 'express';
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Buyer places order
router.post('/', authenticateToken, requireRole('buyer'), createOrder);

// Buyer order history
router.get('/my-orders', authenticateToken, requireRole('buyer'), getMyOrders);

// Farmer incoming orders
router.get('/farmer-orders', authenticateToken, requireRole('farmer'), getFarmerOrders);

// Order details (buyer, participating farmer, or admin)
router.get('/:id', authenticateToken, getOrderById);

// Update status (requested -> accepted -> ready -> completed or cancelled)
router.patch('/:id/status', authenticateToken, updateOrderStatus);

export default router;

