/**
 * auth.js
 * Authentication & Authorization middleware
 * Supports Student and Admin sessions via JWT / Secure tokens.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nebula_secret_event_key_2026_super_secure';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'adminnebula2026';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  let token = req.cookies?.nebula_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  req.user = decoded;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student login required.' });
  }
  next();
}

module.exports = {
  ADMIN_USER,
  ADMIN_PASS,
  generateToken,
  verifyToken,
  authMiddleware,
  requireAuth,
  requireAdmin,
  requireStudent
};
