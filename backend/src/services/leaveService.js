import { Op } from 'sequelize'
import { withTransaction } from '../utils/transactions.js'
import LeaveRequest from '../models/LeaveRequest.js'
import LeaveRequestEvent from '../models/LeaveRequestEvent.js'
import EventParticipant from '../models/EventParticipant.js'
import Event from '../models/Event.js'
import User from '../models/User.js'

const overlapWhere = (start, end) => ({
  [Op.or]: [
    {
      start_datetime: {
        [Op.between]: [start, end]
      }
    },
    {
      end_datetime: {
        [Op.between]: [start, end]
      }
    },
    {
      start_datetime: { [Op.lte]: start },
      end_datetime: { [Op.gte]: end }
    }
  ]
})

class LeaveService {
  #ensureAdmin(user) {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required')
    }
  }

  async #findAffectedParticipants(teacherId, start, end, transaction) {
    return await EventParticipant.findAll({
      where: {
        teacher_id: teacherId,
        status: {
          [Op.in]: ['accepted', 'invited', 'pending']
        }
      },
      include: [{
        model: Event,
        as: 'event',
        required: true,
        where: overlapWhere(start, end)
      }],
      transaction
    })
  }

  async createLeaveRequest(teacherId, payload) {
    const {
      start_datetime,
      end_datetime,
      leave_type = 'annual',
      reason,
      coverage_required = true,
      attachment_url,
      metadata
    } = payload

    if (!start_datetime || !end_datetime) {
      throw new Error('Start and end datetime are required for leave requests')
    }

    const start = new Date(start_datetime)
    const end = new Date(end_datetime)

    if (end <= start) {
      throw new Error('Leave end must be after start')
    }

    return await withTransaction(async (transaction) => {
      const leave = await LeaveRequest.create({
        teacher_id: teacherId,
        leave_type,
        start_datetime: start,
        end_datetime: end,
        reason,
        coverage_required,
        attachment_url,
        metadata,
        status: 'pending',
        submitted_at: new Date()
      }, { transaction })

      const participants = await this.#findAffectedParticipants(teacherId, start, end, transaction)

      await Promise.all(participants.map(participant => {
        return LeaveRequestEvent.create({
          leave_request_id: leave.id,
          event_id: participant.event_id,
          participant_id: participant.id,
          needs_substitute: coverage_required,
          substitute_status: coverage_required ? 'pending' : 'not_needed'
        }, { transaction })
      }))

      return { leave, affectedEvents: participants.length }
    })
  }

  async listLeaveRequests(teacherId) {
    return await LeaveRequest.findAll({
      where: { teacher_id: teacherId },
      order: [['created_at', 'DESC']]
    })
  }

  async listPendingLeaves(user) {
    this.#ensureAdmin(user)
    return await LeaveRequest.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email', 'department'] }],
      order: [['submitted_at', 'ASC']]
    })
  }

  async getAffectedEvents(leaveId, user) {
    const leave = await LeaveRequest.findByPk(leaveId, {
      include: [{
        model: LeaveRequestEvent,
        as: 'affectedEvents',
        include: [
          {
            model: Event,
            as: 'event'
          },
          {
            model: EventParticipant,
            as: 'participant'
          },
          {
            model: User,
            as: 'substituteTeacher',
            attributes: ['id', 'name', 'email']
          }
        ]
      }]
    })

    if (!leave) {
      throw new Error('Leave request not found')
    }

    if (leave.teacher_id !== user.id && user.role !== 'admin') {
      throw new Error('Access denied')
    }

    return leave.affectedEvents
  }

  async approveLeave(leaveId, approver) {
    this.#ensureAdmin(approver)
    return await withTransaction(async (transaction) => {
      const leave = await LeaveRequest.findByPk(leaveId, { transaction })
      if (!leave) {
        throw new Error('Leave request not found')
      }
      if (leave.status !== 'pending') {
        throw new Error('Only pending leave requests can be approved')
      }

      leave.status = 'approved'
      leave.approver_id = approver.id
      leave.responded_at = new Date()
      await leave.save({ transaction })

      await LeaveRequestEvent.update({
        substitute_status: leave.coverage_required ? 'pending' : 'not_needed'
      }, {
        where: { leave_request_id: leaveId },
        transaction
      })

      return leave
    })
  }

  async rejectLeave(leaveId, approver, notes) {
    this.#ensureAdmin(approver)
    return await withTransaction(async (transaction) => {
      const leave = await LeaveRequest.findByPk(leaveId, { transaction })
      if (!leave) {
        throw new Error('Leave request not found')
      }
      if (leave.status !== 'pending') {
        throw new Error('Only pending leave requests can be rejected')
      }

      leave.status = 'rejected'
      leave.approver_id = approver.id
      leave.responded_at = new Date()
      leave.metadata = {
        ...(leave.metadata || {}),
        rejection_notes: notes
      }
      await leave.save({ transaction })

      await LeaveRequestEvent.update({ substitute_status: 'not_needed' }, {
        where: { leave_request_id: leaveId },
        transaction
      })

      return leave
    })
  }

  async cancelLeave(leaveId, user) {
    return await withTransaction(async (transaction) => {
      const leave = await LeaveRequest.findByPk(leaveId, { transaction })
      if (!leave) {
        throw new Error('Leave request not found')
      }

      if (leave.teacher_id !== user.id && user.role !== 'admin') {
        throw new Error('Access denied')
      }

      if (!['pending', 'approved'].includes(leave.status)) {
        throw new Error('Only pending or approved leave requests can be cancelled')
      }

      leave.status = 'cancelled'
      leave.responded_at = new Date()
      await leave.save({ transaction })

      await LeaveRequestEvent.update({ substitute_status: 'not_needed' }, {
        where: { leave_request_id: leaveId },
        transaction
      })

      return leave
    })
  }
}

export default new LeaveService()
