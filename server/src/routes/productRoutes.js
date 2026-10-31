import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
  getCategoriesAndLocations,
} from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/meta/categories-and-locations', getCategoriesAndLocations);
router.get('/farmer/my-products', authenticateToken, requireRole('farmer'), getFarmerProducts);
router.get('/:id', getProductById);

// Farmer only
router.post('/', authenticateToken, requireRole('farmer'), createProduct);

// Farmer (owner) or Admin
router.put('/:id', authenticateToken, requireRole('farmer', 'admin'), updateProduct);
router.delete('/:id', authenticateToken, requireRole('farmer', 'admin'), deleteProduct);

export default router;
