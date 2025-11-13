import jwt from 'jsonwebtoken'
import config from '../config/index.js'

const JWT_SECRET = config.jwt.secret
const JWT_EXPIRES_IN = config.jwt.expiresIn

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user
      }
      next()
    })
  } else {
    next()
  }
}

// Check if user owns resource or has admin permissions
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField]

    if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    next()
  }
}

// Admin only middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

export { JWT_SECRET, JWT_EXPIRES_IN }