import express from 'express';
import { getPriceTrends } from '../controllers/priceTrendsController.js';

const router = express.Router();

router.get('/', getPriceTrends);

export default router;

