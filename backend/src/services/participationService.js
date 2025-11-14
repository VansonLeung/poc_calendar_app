import { withTransaction } from '../utils/transactions.js'
import Event from '../models/Event.js'
import Calendar from '../models/Calendar.js'
import EventParticipant from '../models/EventParticipant.js'
import ParticipationRequest from '../models/ParticipationRequest.js'
import User from '../models/User.js'

const ensureArray = (value) => Array.isArray(value) ? value : [value]

class ParticipationService {
  async #loadEvent(eventId, transaction) {
    const event = await Event.findByPk(eventId, {
      include: [{
        model: Calendar,
        as: 'calendar'
      }],
      transaction
    })

    if (!event) {
      throw new Error('Event not found')
    }
    return event
  }

  async #ensurePermission(event, userId, level = 'view') {
    const hasPermission = await event.calendar.hasPermission(userId, level)
    if (!hasPermission) {
      throw new Error('Access denied')
    }
  }

  async getEventParticipants(eventId, userId) {
    const event = await this.#loadEvent(eventId)
    await this.#ensurePermission(event, userId, 'view')

    return await EventParticipant.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'department', 'status']
        },
        {
          model: User,
          as: 'assignedBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'ASC']]
    })
  }

  async upsertParticipants(eventId, userId, payload, method = 'invite') {
    const { teacher_ids, participation_role = 'primary', requires_approval = false, remarks } = payload

    if (!teacher_ids || teacher_ids.length === 0) {
      throw new Error('teacher_ids list is required')
    }

    const normalizedMethod = method === 'assign' ? 'assign' : 'invite'
    const status = normalizedMethod === 'assign' ? 'accepted' : 'invited'

    return await withTransaction(async (transaction) => {
      const event = await this.#loadEvent(eventId, transaction)
      await this.#ensurePermission(event, userId, 'edit')

      const teacherIds = [...new Set(ensureArray(teacher_ids))]
      const teachers = await User.findAll({
        where: { id: teacherIds },
        transaction
      })

      if (teachers.length !== teacherIds.length) {
        throw new Error('One or more teachers not found')
      }

      const results = []
      for (const teacherId of teacherIds) {
        const [participant, created] = await EventParticipant.findOrCreate({
          where: {
            event_id: eventId,
            teacher_id: teacherId
          },
          defaults: {
            participation_role,
            invitation_method: normalizedMethod,
            status,
            requires_approval,
            remarks,
            assigned_by: userId,
            assigned_at: new Date()
          },
          transaction
        })

        if (!created) {
          participant.participation_role = participation_role
          participant.invitation_method = normalizedMethod
          participant.status = status
          participant.requires_approval = requires_approval
          participant.remarks = remarks
          participant.assigned_by = userId
          participant.assigned_at = new Date()
          await participant.save({ transaction })
        }

        results.push(participant)
      }

      return results
    })
  }

  async removeParticipant(participantId, userId) {
    return await withTransaction(async (transaction) => {
      const participant = await EventParticipant.findByPk(participantId, {
        include: [{
          model: Event,
          as: 'event',
          include: [{ model: Calendar, as: 'calendar' }]
        }],
        transaction
      })

      if (!participant) {
        throw new Error('Participant not found')
      }

      const event = participant.event
      await this.#ensurePermission(event, userId, 'edit')

      if (participant.teacher_id === event.created_by) {
        throw new Error('Cannot remove event creator from participants')
      }

      await participant.destroy({ transaction })
      return { message: 'Participant removed' }
    })
  }

  async respond(participantId, userId, action, remarks) {
    const actionMap = {
      accept: { to: 'accepted', from: ['invited', 'pending'] },
      reject: { to: 'rejected', from: ['invited', 'pending'] },
      cancel: { to: 'cancelled', from: ['accepted'] },
      withdraw: { to: 'withdrawn', from: ['pending', 'invited'] }
    }

    if (!actionMap[action]) {
      throw new Error('Unsupported action')
    }

    return await withTransaction(async (transaction) => {
      const participant = await EventParticipant.findByPk(participantId, {
        include: [{
          model: Event,
          as: 'event',
          include: [{ model: Calendar, as: 'calendar' }]
        }],
        transaction
      })

      if (!participant) {
        throw new Error('Participant not found')
      }

      if (participant.teacher_id !== userId) {
        throw new Error('You are not the participant for this record')
      }

      const { to, from } = actionMap[action]

      if (!from.includes(participant.status)) {
        throw new Error(`Cannot ${action} when status is ${participant.status}`)
      }

      participant.status = to
      participant.responded_at = new Date()
      participant.remarks = remarks
      await participant.save({ transaction })

      return participant
    })
  }

  async createParticipationRequest(userId, payload) {
    const { event_id, action, target_teacher_id, notes, metadata } = payload

    if (!event_id || !action) {
      throw new Error('event_id and action are required')
    }

    const allowedActions = ['join', 'cancel', 'substitute', 'withdraw']
    if (!allowedActions.includes(action)) {
      throw new Error('Invalid participation action')
    }

    return await withTransaction(async (transaction) => {
      const event = await this.#loadEvent(event_id, transaction)
      await this.#ensurePermission(event, userId, action === 'join' ? 'view' : 'edit')

      const teacherId = target_teacher_id || userId

      const existingParticipant = await EventParticipant.findOne({
        where: {
          event_id,
          teacher_id: teacherId
        },
        transaction
      })

      if (action === 'join' && existingParticipant && ['accepted', 'invited', 'pending'].includes(existingParticipant.status)) {
        throw new Error('Teacher is already participating in this event')
      }

      if ((action === 'cancel' || action === 'withdraw') && (!existingParticipant || existingParticipant.status !== 'accepted')) {
        throw new Error('Teacher is not actively participating in this event')
      }

      const pendingRequest = await ParticipationRequest.findOne({
        where: {
          event_id,
          requester_id: userId,
          action,
          status: 'pending'
        },
        transaction
      })

      if (pendingRequest) {
        throw new Error('There is already a pending request for this action')
      }

      const request = await ParticipationRequest.create({
        event_id,
        requester_id: userId,
        target_teacher_id: teacherId,
        action,
        status: 'pending',
        approver_id: event.created_by,
        decision_notes: notes,
        metadata,
        requested_at: new Date()
      }, { transaction })

      return request
    })
  }

  async listRequests(userId) {
    return await ParticipationRequest.findAll({
      where: { requester_id: userId },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'targetTeacher', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    })
  }

  async listPendingApprovals(userId) {
    return await ParticipationRequest.findAll({
      where: {
        approver_id: userId,
        status: 'pending'
      },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'targetTeacher', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'ASC']]
    })
  }

  async processRequest(requestId, approverId, decision, notes) {
    if (!['approve', 'reject'].includes(decision)) {
      throw new Error('Decision must be approve or reject')
    }

    return await withTransaction(async (transaction) => {
      const request = await ParticipationRequest.findByPk(requestId, {
        include: [{ model: Event, as: 'event' }],
        transaction
      })

      if (!request) {
        throw new Error('Request not found')
      }

      if (request.approver_id !== approverId) {
        throw new Error('You are not allowed to decide on this request')
      }

      if (request.status !== 'pending') {
        throw new Error('Request has already been processed')
      }

      if (decision === 'approve') {
        await this.#applyRequestAction(request, transaction)
        request.status = 'approved'
      } else {
        request.status = 'rejected'
      }

      request.decision_notes = notes
      request.responded_at = new Date()
      await request.save({ transaction })

      return request
    })
  }

  async #applyRequestAction(request, transaction) {
    const teacherId = request.target_teacher_id || request.requester_id

    if (request.action === 'join') {
      await EventParticipant.findOrCreate({
        where: {
          event_id: request.event_id,
          teacher_id: teacherId
        },
        defaults: {
          participation_role: 'primary',
          invitation_method: 'apply',
          status: 'accepted',
          requires_approval: false,
          assigned_by: request.approver_id,
          assigned_at: new Date()
        },
        transaction
      })
      return
    }

    if (request.action === 'cancel') {
      const participant = await EventParticipant.findOne({
        where: {
          event_id: request.event_id,
          teacher_id: teacherId
        },
        transaction
      })

      if (!participant) {
        throw new Error('Participant record not found for cancel request')
      }

      participant.status = 'cancelled'
      participant.responded_at = new Date()
      await participant.save({ transaction })
      return
    }
  }

  async withdrawRequest(requestId, userId) {
    return await withTransaction(async (transaction) => {
      const request = await ParticipationRequest.findByPk(requestId, { transaction })
      if (!request) {
        throw new Error('Request not found')
      }

      if (request.requester_id !== userId) {
        throw new Error('You cannot withdraw this request')
      }

      if (request.status !== 'pending') {
        throw new Error('Only pending requests can be withdrawn')
      }

      request.status = 'withdrawn'
      request.responded_at = new Date()
      await request.save({ transaction })

      return request
    })
  }
}

export default new ParticipationService()
