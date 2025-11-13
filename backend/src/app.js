import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/database.js'
import apiRoutes from './api/index.js'
import config from './config/index.js'
import { syncDatabase } from './models/index.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = config.server.port

// Middleware
app.use(cors(config.cors))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use(config.api.basePath, apiRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Calendar API is running' })
})

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection()

    // Sync database models
    await syncDatabase()

    app.listen(PORT, () => {
      console.log(`Calendar API server is running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app