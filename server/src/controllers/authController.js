import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { config } from '../config/env.js';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, role, phone, location, farm_name, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'farmer' or 'buyer'.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if email exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const avatar_url =
      role === 'farmer'
        ? 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const insertResult = await db.execute({
      sql: `INSERT INTO users (name, email, password_hash, role, phone, location, farm_name, bio, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, name, email, role, phone, location, farm_name, bio, avatar_url`,
      args: [
        name.trim(),
        email.toLowerCase().trim(),
        password_hash,
        role,
        phone || null,
        location || null,
        farm_name || null,
        bio || null,
        avatar_url,
      ],
    });

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
      error: err.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: err.message,
    });
  }
}

export async function me(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

// Quick 1-click Demo Login for Hackathon presentation
export async function demoLogin(req, res) {
  try {
    const { role = 'farmer', email } = req.body;
    let query = 'SELECT * FROM users WHERE role = ? LIMIT 1';
    let args = [role];

    if (email) {
      query = 'SELECT * FROM users WHERE email = ?';
      args = [email];
    }

    const result = await db.execute({ sql: query, args });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No demo account found for role "${role}".`,
      });
    }

    const user = result.rows[0];
    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: `Demo logged in as ${safeUser.name} (${safeUser.role}).`,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Demo login failed.',
      error: err.message,
    });
  }
}

// List of all seeded demo accounts for user convenience
export async function getDemoAccounts(req, res) {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, location, farm_name, bio, avatar_url FROM users ORDER BY role DESC, id ASC',
      args: [],
    });

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch demo accounts.',
      error: err.message,
    });
  }
}
