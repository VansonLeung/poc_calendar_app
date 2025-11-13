import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import config from '../config/index.js'

class AuthService {
  // Register a new user
  async register(userData) {
    const { email, password, name, timezone = 'UTC' } = userData

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Validate password strength
    if (password.length < config.validation.password.minLength) {
      throw new Error(`Password must be at least ${config.validation.password.minLength} characters long`)
    }

    // Hash password
    const passwordHash = await User.hashPassword(password)

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name,
      timezone
    })

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    })

    return {
      user: user.toJSON(),
      token
    }
  }

  // Login user
  async login(credentials) {
    const { email, password } = credentials

    // Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Check password
    const isValidPassword = await user.checkPassword(password)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    })

    return {
      user: user.toJSON(),
      token
    }
  }

  // Get current user profile
  async getProfile(userId) {
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return user.toJSON()
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { name, timezone, currentPassword, newPassword } = updateData

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        throw new Error('Current password is required to change password')
      }

      const isValidCurrentPassword = await user.checkPassword(currentPassword)
      if (!isValidCurrentPassword) {
        throw new Error('Current password is incorrect')
      }

      if (newPassword.length < config.validation.password.minLength) {
        throw new Error(`New password must be at least ${config.validation.password.minLength} characters long`)
      }

      // Hash new password
      user.password_hash = await User.hashPassword(newPassword)
    }

    // Update other fields
    if (name) user.name = name
    if (timezone) user.timezone = timezone

    await user.save()

    return user.toJSON()
  }

  // Delete user account
  async deleteAccount(userId) {
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }

    await user.destroy()
    return { message: 'Account deleted successfully' }
  }
}

export default new AuthService()