import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { initDatabase } from './db/index.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import trendsRoutes from './routes/trendsRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'HACK-P309 Farmer Marketplace API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trends', trendsRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: config.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(config.PORT, () => {
      console.log(`🌾 Farmer Marketplace API running on http://localhost:${config.PORT}`);
      console.log(`📡 Health Check: http://localhost:${config.PORT}/api/health`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

// Export app for test suites
export { app };

if (process.argv[1]?.endsWith('server.js')) {
  startServer();
}
