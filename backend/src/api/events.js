import express from 'express'
import eventService from '../services/eventService.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get events for a calendar
router.get('/calendar/:calendarId', async (req, res) => {
  try {
    const { calendarId } = req.params
    const { start_date, end_date } = req.query

    const events = await eventService.getCalendarEvents(calendarId, req.user.id, {
      startDate: start_date,
      endDate: end_date
    })

    res.json({ events })
  } catch (error) {
    console.error('Get calendar events error:', error)
    const status = error.message === 'Calendar not found' || error.message === 'Access denied' ? 404 : 500
    res.status(status).json({
      error: error.message || 'Failed to get events'
    })
  }
})

// Get all events for the current user
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    const events = await eventService.getUserEvents(req.user.id, {
      startDate: start_date,
      endDate: end_date
    })

    res.json({ events })
  } catch (error) {
    console.error('Get user events error:', error)
    res.status(500).json({
      error: error.message || 'Failed to get events'
    })
  }
})

// Create a new event
router.post('/', async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      start_datetime: req.body.start_date || req.body.start_datetime,
      end_datetime: req.body.end_date || req.body.end_datetime
    }

    if (!eventData.calendar_id) {
      return res.status(400).json({
        error: 'Calendar ID is required'
      })
    }

    if (!eventData.title) {
      return res.status(400).json({
        error: 'Event title is required'
      })
    }

    if (!eventData.start_datetime) {
      return res.status(400).json({
        error: 'Start date is required'
      })
    }

    const event = await eventService.createEvent(req.user.id, eventData)

    res.status(201).json({
      message: 'Event created successfully',
      event
    })
  } catch (error) {
    console.error('Create event error:', error)
    const status = error.message === 'Calendar not found' || error.message === 'Access denied' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to create event'
    })
  }
})

// Get event by ID
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params
    const event = await eventService.getEvent(eventId, req.user.id)
    res.json({ event })
  } catch (error) {
    console.error('Get event error:', error)
    const status = error.message === 'Event not found' || error.message === 'Access denied' ? 404 : 500
    res.status(status).json({
      error: error.message || 'Failed to get event'
    })
  }
})

// Update event
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params
    const eventData = req.body

    const event = await eventService.updateEvent(eventId, req.user.id, eventData)

    res.json({
      message: 'Event updated successfully',
      event
    })
  } catch (error) {
    console.error('Update event error:', error)
    const status = error.message === 'Event not found' || error.message === 'Access denied' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to update event'
    })
  }
})

// Delete event
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params
    const result = await eventService.deleteEvent(eventId, req.user.id)
    res.json(result)
  } catch (error) {
    console.error('Delete event error:', error)
    const status = error.message === 'Event not found' || error.message === 'Access denied' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to delete event'
    })
  }
})

// Check for event conflicts
router.post('/check-conflicts', async (req, res) => {
  try {
    const { calendar_id, start_date, end_date, exclude_event_id } = req.body

    if (!calendar_id || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Calendar ID, start date, and end date are required'
      })
    }

    const conflicts = await eventService.checkConflicts(
      calendar_id,
      req.user.id,
      start_date,
      end_date,
      exclude_event_id
    )

    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts
    })
  } catch (error) {
    console.error('Check conflicts error:', error)
    const status = error.message === 'Calendar not found' || error.message === 'Access denied' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to check conflicts'
    })
  }
})

export default router