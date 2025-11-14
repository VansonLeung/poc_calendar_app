import { Op } from 'sequelize'
import { withTransaction } from '../utils/transactions.js'
import LeaveRequestEvent from '../models/LeaveRequestEvent.js'
import LeaveRequest from '../models/LeaveRequest.js'
import Event from '../models/Event.js'
import Calendar from '../models/Calendar.js'
import User from '../models/User.js'
import EventParticipant from '../models/EventParticipant.js'
import SubstituteRequest from '../models/SubstituteRequest.js'

const overlapWhere = (start, end) => ({
  [Op.or]: [
    {
      start_datetime: { [Op.between]: [start, end] }
    },
    {
      end_datetime: { [Op.between]: [start, end] }
    },
    {
      start_datetime: { [Op.lte]: start },
      end_datetime: { [Op.gte]: end }
    }
  ]
})

class SubstituteService {
  #ensureAdmin(user) {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required')
    }
  }

  async listAffectedEventsNeedingSubstitute(user) {
    this.#ensureAdmin(user)
    return await LeaveRequestEvent.findAll({
      where: {
        needs_substitute: true,
        substitute_status: { [Op.ne]: 'assigned' }
      },
      include: [
        {
          model: LeaveRequest,
          as: 'leaveRequest',
          include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }]
        },
        {
          model: Event,
          as: 'event'
        }
      ],
      order: [['created_at', 'ASC']]
    })
  }

  async findAvailableSubstitutes(query) {
    const { startDatetime, endDatetime } = query

    if (!startDatetime || !endDatetime) {
      throw new Error('startDatetime and endDatetime are required')
    }

    const start = new Date(startDatetime)
    const end = new Date(endDatetime)

    const busyParticipants = await EventParticipant.findAll({
      attributes: ['teacher_id'],
      where: {
        status: {
          [Op.in]: ['accepted', 'pending', 'invited']
        }
      },
      include: [{
        model: Event,
        as: 'event',
        required: true,
        where: overlapWhere(start, end)
      }]
    })

    const busyTeacherIds = [...new Set(busyParticipants.map(p => p.teacher_id))]

    const leaveConflicts = await LeaveRequest.findAll({
      attributes: ['teacher_id'],
      where: {
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          {
            start_datetime: { [Op.between]: [start, end] }
          },
          {
            end_datetime: { [Op.between]: [start, end] }
          },
          {
            start_datetime: { [Op.lte]: start },
            end_datetime: { [Op.gte]: end }
          }
        ]
      }
    })

    const unavailableTeacherIds = new Set([
      ...busyTeacherIds,
      ...leaveConflicts.map(l => l.teacher_id)
    ])

    const teachers = await User.findAll({
      where: {
        role: 'teacher',
        status: 'active',
        id: { [Op.notIn]: [...unavailableTeacherIds] }
      },
      attributes: ['id', 'name', 'email', 'department', 'metadata']
    })

    return teachers
  }

  async assignSubstitute(affectedEventId, user, payload) {
    const { substitute_teacher_id, notes } = payload
    if (!substitute_teacher_id) {
      throw new Error('substitute_teacher_id is required')
    }

    return await withTransaction(async (transaction) => {
      const affectedEvent = await LeaveRequestEvent.findByPk(affectedEventId, {
        include: [
          {
            model: LeaveRequest,
            as: 'leaveRequest'
          },
          {
            model: Event,
            as: 'event',
            include: [{ model: Calendar, as: 'calendar' }]
          }
        ],
        transaction
      })

      if (!affectedEvent) {
        throw new Error('Affected event not found')
      }

      const event = affectedEvent.event

      const isAdmin = user.role === 'admin'
      const isOwner = await event.calendar.hasPermission(user.id, 'edit')
      if (!isAdmin && !isOwner) {
        throw new Error('Access denied')
      }

      const teacher = await User.findByPk(substitute_teacher_id, { transaction })
      if (!teacher || teacher.role !== 'teacher') {
        throw new Error('Substitute teacher not found')
      }

      await EventParticipant.findOrCreate({
        where: {
          event_id: event.id,
          teacher_id: substitute_teacher_id
        },
        defaults: {
          participation_role: 'substitute',
          invitation_method: 'auto_substitute',
          status: 'accepted',
          assigned_by: user.id,
          assigned_at: new Date(),
          requires_approval: false
        },
        transaction
      })

      affectedEvent.substitute_teacher_id = substitute_teacher_id
      affectedEvent.substitute_status = 'assigned'
      affectedEvent.resolution_notes = notes
      await affectedEvent.save({ transaction })

      await SubstituteRequest.create({
        event_id: event.id,
        original_teacher_id: affectedEvent.leaveRequest.teacher_id,
        requested_by: user.id,
        reason: notes,
        status: 'assigned',
        assigned_teacher_id: substitute_teacher_id,
        assigned_at: new Date(),
        metadata: {
          leave_request_event_id: affectedEventId
        }
      }, { transaction })

      return affectedEvent
    })
  }
}

export default new SubstituteService()
