import express from 'express'
import calendarService from '../services/calendarService.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get all calendars for the current user
router.get('/', async (req, res) => {
  try {
    const calendars = await calendarService.getUserCalendars(req.user.id)
    res.json({ calendars })
  } catch (error) {
    console.error('Get calendars error:', error)
    res.status(500).json({
      error: error.message || 'Failed to get calendars'
    })
  }
})

// Create a new calendar
router.post('/', async (req, res) => {
  try {
    const { name, color, description } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Calendar name is required'
      })
    }

    const calendar = await calendarService.createCalendar(req.user.id, {
      name,
      color,
      description
    })

    res.status(201).json({
      message: 'Calendar created successfully',
      calendar
    })
  } catch (error) {
    console.error('Create calendar error:', error)
    res.status(400).json({
      error: error.message || 'Failed to create calendar'
    })
  }
})

// Get calendar by ID
router.get('/:calendarId', async (req, res) => {
  try {
    const { calendarId } = req.params
    const calendar = await calendarService.getCalendar(calendarId, req.user.id)
    res.json({ calendar })
  } catch (error) {
    console.error('Get calendar error:', error)
    const status = error.message === 'Calendar not found' || error.message === 'Access denied' ? 404 : 500
    res.status(status).json({
      error: error.message || 'Failed to get calendar'
    })
  }
})

// Update calendar
router.put('/:calendarId', async (req, res) => {
  try {
    const { calendarId } = req.params
    const { name, color, description } = req.body

    const calendar = await calendarService.updateCalendar(calendarId, req.user.id, {
      name,
      color,
      description
    })

    res.json({
      message: 'Calendar updated successfully',
      calendar
    })
  } catch (error) {
    console.error('Update calendar error:', error)
    const status = error.message === 'Calendar not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to update calendar'
    })
  }
})

// Delete calendar
router.delete('/:calendarId', async (req, res) => {
  try {
    const { calendarId } = req.params
    const result = await calendarService.deleteCalendar(calendarId, req.user.id)
    res.json(result)
  } catch (error) {
    console.error('Delete calendar error:', error)
    const status = error.message === 'Calendar not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to delete calendar'
    })
  }
})

// Share calendar with another user
router.post('/:calendarId/share', async (req, res) => {
  try {
    const { calendarId } = req.params
    const { user_id, permission_level } = req.body

    if (!user_id || !permission_level) {
      return res.status(400).json({
        error: 'User ID and permission level are required'
      })
    }

    if (!['view', 'edit', 'admin'].includes(permission_level)) {
      return res.status(400).json({
        error: 'Permission level must be view, edit, or admin'
      })
    }

    const result = await calendarService.shareCalendar(
      calendarId,
      req.user.id,
      user_id,
      permission_level
    )

    res.json(result)
  } catch (error) {
    console.error('Share calendar error:', error)
    const status = error.message.includes('not found') ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to share calendar'
    })
  }
})

// Remove calendar sharing
router.delete('/:calendarId/share/:userId', async (req, res) => {
  try {
    const { calendarId, userId } = req.params
    const result = await calendarService.unshareCalendar(calendarId, req.user.id, userId)
    res.json(result)
  } catch (error) {
    console.error('Unshare calendar error:', error)
    const status = error.message.includes('not found') ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to remove calendar sharing'
    })
  }
})

// Get calendar permissions
router.get('/:calendarId/permissions', async (req, res) => {
  try {
    const { calendarId } = req.params
    const permissions = await calendarService.getCalendarPermissions(calendarId, req.user.id)
    res.json({ permissions })
  } catch (error) {
    console.error('Get calendar permissions error:', error)
    const status = error.message === 'Calendar not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to get calendar permissions'
    })
  }
})

export default router