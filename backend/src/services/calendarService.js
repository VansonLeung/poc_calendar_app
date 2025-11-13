import Calendar from '../models/Calendar.js'
import Event from '../models/Event.js'
import { withTransaction } from '../utils/transactions.js'

class CalendarService {
  // Create a new calendar
  async createCalendar(userId, calendarData) {
    return await withTransaction(async (transaction) => {
      const { name, color = '#3788d8', description } = calendarData

      const calendar = await Calendar.create({
        name,
        owner_id: userId,
        color,
        description
      }, { transaction })

      return calendar
    })
  }

  // Get calendar by ID with permission check
  async getCalendar(calendarId, userId) {
    const calendar = await Calendar.findByPk(calendarId, {
      include: [{
        model: Calendar.sequelize.models.User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    })

    if (!calendar) {
      throw new Error('Calendar not found')
    }

    // Check if user has access
    if (!(await calendar.hasPermission(userId, 'view'))) {
      throw new Error('Access denied')
    }

    return calendar
  }

  // Get all calendars for a user (owned + shared)
  async getUserCalendars(userId) {
    const [ownedCalendars, sharedCalendars] = await Promise.all([
      Calendar.findByOwner(userId),
      Calendar.findSharedWithUser(userId)
    ])

    // Combine and remove duplicates
    const allCalendars = [...ownedCalendars]
    const ownedIds = new Set(ownedCalendars.map(c => c.id))

    for (const calendar of sharedCalendars) {
      if (!ownedIds.has(calendar.id)) {
        allCalendars.push(calendar)
      }
    }

    return allCalendars
  }

  // Update calendar
  async updateCalendar(calendarId, userId, updateData) {
    return await withTransaction(async (transaction) => {
      const calendar = await Calendar.findByPk(calendarId, { transaction })

      if (!calendar) {
        throw new Error('Calendar not found')
      }

      // Only owner can update calendar
      if (!calendar.isOwner(userId)) {
        throw new Error('Only calendar owner can update calendar')
      }

      const { name, color, description } = updateData

      if (name) calendar.name = name
      if (color) calendar.color = color
      if (description !== undefined) calendar.description = description

      await calendar.save({ transaction })
      return calendar
    })
  }

  // Delete calendar
  async deleteCalendar(calendarId, userId) {
    return await withTransaction(async (transaction) => {
      const calendar = await Calendar.findByPk(calendarId, {
        include: [{ model: Event, as: 'events' }],
        transaction
      })

      if (!calendar) {
        throw new Error('Calendar not found')
      }

      // Only owner can delete calendar
      if (!calendar.isOwner(userId)) {
        throw new Error('Only calendar owner can delete calendar')
      }

      // Delete all events first
      await Event.destroy({
        where: { calendar_id: calendarId },
        transaction
      })

      // Delete calendar
      await calendar.destroy({ transaction })

      return { message: 'Calendar deleted successfully' }
    })
  }

  // Share calendar with another user
  async shareCalendar(calendarId, ownerId, targetUserId, permissionLevel) {
    return await withTransaction(async (transaction) => {
      const calendar = await Calendar.findByPk(calendarId, { transaction })

      if (!calendar) {
        throw new Error('Calendar not found')
      }

      if (!calendar.isOwner(ownerId)) {
        throw new Error('Only calendar owner can share calendar')
      }

      if (ownerId === targetUserId) {
        throw new Error('Cannot share calendar with yourself')
      }

      // Check if target user exists
      const User = Calendar.sequelize.models.User
      const targetUser = await User.findByPk(targetUserId, { transaction })
      if (!targetUser) {
        throw new Error('Target user not found')
      }

      // Create or update permission
      const Permission = Calendar.sequelize.models.Permission
      const [permission, created] = await Permission.upsert({
        calendar_id: calendarId,
        user_id: targetUserId,
        permission_level: permissionLevel
      }, { transaction })

      return {
        message: created ? 'Calendar shared successfully' : 'Calendar sharing updated',
        permission
      }
    })
  }

  // Remove calendar sharing
  async unshareCalendar(calendarId, ownerId, targetUserId) {
    return await withTransaction(async (transaction) => {
      const calendar = await Calendar.findByPk(calendarId, { transaction })

      if (!calendar) {
        throw new Error('Calendar not found')
      }

      if (!calendar.isOwner(ownerId)) {
        throw new Error('Only calendar owner can manage sharing')
      }

      const Permission = Calendar.sequelize.models.Permission
      const deleted = await Permission.destroy({
        where: {
          calendar_id: calendarId,
          user_id: targetUserId
        },
        transaction
      })

      if (deleted === 0) {
        throw new Error('User does not have access to this calendar')
      }

      return { message: 'Calendar sharing removed successfully' }
    })
  }

  // Get calendar permissions
  async getCalendarPermissions(calendarId, ownerId) {
    const calendar = await Calendar.findByPk(calendarId)

    if (!calendar) {
      throw new Error('Calendar not found')
    }

    if (!calendar.isOwner(ownerId)) {
      throw new Error('Only calendar owner can view permissions')
    }

    const Permission = Calendar.sequelize.models.Permission
    const permissions = await Permission.findAll({
      where: { calendar_id: calendarId },
      include: [{
        model: Calendar.sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    })

    return permissions
  }
}

export default new CalendarService()