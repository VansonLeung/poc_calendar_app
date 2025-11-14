import express from 'express'
import authRoutes from './auth.js'
import calendarRoutes from './calendars.js'
import eventRoutes from './events.js'
import participationRoutes from './participation.js'
import leaveRoutes from './leaves.js'
import substituteRoutes from './substitutes.js'
import referenceRoutes from './reference.js'

const router = express.Router()

// API versioning
const API_VERSION = 'v1'

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: API_VERSION,
    timestamp: new Date().toISOString()
  })
})

// Mount route modules
router.use('/auth', authRoutes)
router.use('/calendars', calendarRoutes)
router.use('/events', eventRoutes)
router.use('/', participationRoutes)
router.use('/', leaveRoutes)
router.use('/', substituteRoutes)
router.use('/reference-data', referenceRoutes)

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  })
})

export default router
