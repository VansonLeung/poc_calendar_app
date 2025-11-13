import { Op } from 'sequelize'
import Event from '../models/Event.js'
import Calendar from '../models/Calendar.js'
import { withTransaction } from '../utils/transactions.js'

class EventService {
  // Create a new event
  async createEvent(userId, eventData) {
    return await withTransaction(async (transaction) => {
      const { calendar_id, title, start_datetime, end_datetime, description, recurrence_rule } = eventData

      // Check if calendar exists and user has edit permission
      const calendar = await Calendar.findByPk(calendar_id, { transaction })
      if (!calendar) {
        throw new Error('Calendar not found')
      }

      if (!(await calendar.hasPermission(userId, 'edit'))) {
        throw new Error('Permission denied')
      }

      // Validate dates
      const startDate = new Date(start_datetime)
      const endDate = new Date(end_datetime)

      if (endDate <= startDate) {
        throw new Error('End datetime must be after start datetime')
      }

      const event = await Event.create({
        calendar_id,
        title,
        start_datetime: startDate,
        end_datetime: endDate,
        description,
        recurrence_rule
      }, { transaction })

      return event
    })
  }

  // Get event by ID with permission check
  async getEvent(eventId, userId) {
    const event = await Event.findByPk(eventId, {
      include: [{
        model: Calendar,
        as: 'calendar',
        include: [{
          model: Calendar.sequelize.models.User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }]
      }]
    })

    if (!event) {
      throw new Error('Event not found')
    }

    // Check if user has access to the calendar
    if (!(await event.calendar.hasPermission(userId, 'view'))) {
      throw new Error('Access denied')
    }

    return event
  }

  // Get events for a calendar within date range
  async getCalendarEvents(calendarId, userId, startDate = null, endDate = null) {
    // Check if user has access to the calendar
    const calendar = await Calendar.findByPk(calendarId)
    if (!calendar) {
      throw new Error('Calendar not found')
    }

    if (!(await calendar.hasPermission(userId, 'view'))) {
      throw new Error('Access denied')
    }

    const events = await Event.findByCalendar(calendarId, startDate, endDate)

    // For recurring events, expand occurrences within the date range
    if (startDate && endDate) {
      const expandedEvents = []

      for (const event of events) {
        if (event.isRecurring()) {
          const occurrences = event.getOccurrences(new Date(startDate), new Date(endDate))
          expandedEvents.push(...occurrences)
        } else {
          expandedEvents.push(event)
        }
      }

      return expandedEvents
    }

    return events
  }

  // Update event
  async updateEvent(eventId, userId, updateData) {
    return await withTransaction(async (transaction) => {
      const event = await Event.findByPk(eventId, {
        include: [{ model: Calendar, as: 'calendar' }],
        transaction
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Check if user has edit permission
      if (!(await event.calendar.hasPermission(userId, 'edit'))) {
        throw new Error('Permission denied')
      }

      const { title, start_datetime, end_datetime, description, recurrence_rule } = updateData

      if (title) event.title = title
      if (description !== undefined) event.description = description
      if (recurrence_rule !== undefined) event.recurrence_rule = recurrence_rule

      // Validate and update dates
      if (start_datetime || end_datetime) {
        const newStartDate = start_datetime ? new Date(start_datetime) : event.start_datetime
        const newEndDate = end_datetime ? new Date(end_datetime) : event.end_datetime

        if (newEndDate <= newStartDate) {
          throw new Error('End datetime must be after start datetime')
        }

        event.start_datetime = newStartDate
        event.end_datetime = newEndDate
      }

      await event.save({ transaction })
      return event
    })
  }

  // Delete event
  async deleteEvent(eventId, userId) {
    return await withTransaction(async (transaction) => {
      const event = await Event.findByPk(eventId, {
        include: [{ model: Calendar, as: 'calendar' }],
        transaction
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Check if user has edit permission
      if (!(await event.calendar.hasPermission(userId, 'edit'))) {
        throw new Error('Permission denied')
      }

      await event.destroy({ transaction })
      return { message: 'Event deleted successfully' }
    })
  }

  // Check for conflicting events
  async checkConflicts(calendarId, startDate, endDate, excludeEventId = null) {
    const conflictingEvents = await Event.findOverlapping(
      calendarId,
      new Date(startDate),
      new Date(endDate),
      excludeEventId
    )

    return conflictingEvents.map(event => ({
      id: event.id,
      title: event.title,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime
    }))
  }

  // Get user's events across all calendars
  async getUserEvents(userId, startDate = null, endDate = null) {
    // Get all calendars user has access to
    const calendars = await Calendar.findAll({
      include: [{
        model: Calendar.sequelize.models.Permission,
        as: 'permissions',
        where: { user_id: userId },
        required: false
      }],
      where: {
        [Op.or]: [
          { owner_id: userId },
          { '$permissions.user_id$': userId }
        ]
      }
    })

    const calendarIds = calendars.map(cal => cal.id)

    if (calendarIds.length === 0) {
      return []
    }

    const events = await Event.findAll({
      where: {
        calendar_id: calendarIds,
        ...(startDate && endDate && {
          start_datetime: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        })
      },
      include: [{
        model: Calendar,
        as: 'calendar',
        attributes: ['id', 'name', 'color']
      }],
      order: [['start_datetime', 'ASC']]
    })

    return events
  }
}

export default new EventService()