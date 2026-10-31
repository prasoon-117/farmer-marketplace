import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../db/index.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, phone, location, farm_name, bio, avatar_url FROM users WHERE id = ?',
      args: [decoded.id],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
      error: err.message,
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, phone, location, farm_name, bio, avatar_url FROM users WHERE id = ?',
      args: [decoded.id],
    });
    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

