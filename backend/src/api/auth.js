import express from 'express'
import authService from '../services/authService.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, timezone } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      })
    }

    const result = await authService.register({
      email,
      password,
      name,
      timezone
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({
      error: error.message || 'Registration failed'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    const result = await authService.login({ email, password })

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(401).json({
      error: error.message || 'Login failed'
    })
  }
})

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id)
    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(404).json({
      error: error.message || 'User not found'
    })
  }
})

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, timezone, currentPassword, newPassword } = req.body

    const updatedUser = await authService.updateProfile(req.user.id, {
      name,
      timezone,
      currentPassword,
      newPassword
    })

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(400).json({
      error: error.message || 'Profile update failed'
    })
  }
})

// Delete user account
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await authService.deleteAccount(req.user.id)
    res.json(result)
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(400).json({
      error: error.message || 'Account deletion failed'
    })
  }
})

export default router