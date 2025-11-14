import express from 'express'
import participationService from '../services/participationService.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticateToken)

const actionLabels = {
  accept: 'accepted',
  reject: 'rejected',
  cancel: 'cancelled',
  withdraw: 'withdrawn'
}

const respondWithAction = (action) => async (req, res) => {
  try {
    const { participantId } = req.params
    const participant = await participationService.respond(
      participantId,
      req.user.id,
      action,
      req.body?.remarks
    )

    res.json({
      message: `Participation ${actionLabels[action] || action}`,
      participant
    })
  } catch (error) {
    console.error(`Participant ${action} error:`, error)
    const status = error.message === 'Participant not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to update participation'
    })
  }
}

router.patch('/event-participants/:participantId/accept', respondWithAction('accept'))
router.patch('/event-participants/:participantId/reject', respondWithAction('reject'))
router.patch('/event-participants/:participantId/cancel', respondWithAction('cancel'))
router.patch('/event-participants/:participantId/withdraw', respondWithAction('withdraw'))

router.delete('/event-participants/:participantId', async (req, res) => {
  try {
    const result = await participationService.removeParticipant(req.params.participantId, req.user.id)
    res.json(result)
  } catch (error) {
    console.error('Remove participant error:', error)
    const status = error.message === 'Participant not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to remove participant'
    })
  }
})

// Participation requests
router.post('/participation-requests', async (req, res) => {
  try {
    const request = await participationService.createParticipationRequest(req.user.id, req.body)
    res.status(201).json({
      message: 'Participation request submitted',
      request
    })
  } catch (error) {
    console.error('Create participation request error:', error)
    res.status(400).json({
      error: error.message || 'Failed to submit participation request'
    })
  }
})

router.get('/participation-requests', async (req, res) => {
  try {
    const requests = await participationService.listRequests(req.user.id)
    res.json({ requests })
  } catch (error) {
    console.error('List participation requests error:', error)
    res.status(400).json({
      error: error.message || 'Failed to list requests'
    })
  }
})

router.get('/participation-requests/pending', async (req, res) => {
  try {
    const requests = await participationService.listPendingApprovals(req.user.id)
    res.json({ requests })
  } catch (error) {
    console.error('List pending participation requests error:', error)
    res.status(400).json({
      error: error.message || 'Failed to list pending requests'
    })
  }
})

const processRequest = (decision) => async (req, res) => {
  try {
    const request = await participationService.processRequest(
      req.params.requestId,
      req.user.id,
      decision,
      req.body?.notes
    )
    res.json({
      message: `Request ${decision}d`,
      request
    })
  } catch (error) {
    console.error(`Participation request ${decision} error:`, error)
    const status = error.message === 'Request not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to process request'
    })
  }
}

router.post('/participation-requests/:requestId/approve', processRequest('approve'))
router.post('/participation-requests/:requestId/reject', processRequest('reject'))

router.delete('/participation-requests/:requestId', async (req, res) => {
  try {
    const request = await participationService.withdrawRequest(req.params.requestId, req.user.id)
    res.json({
      message: 'Request withdrawn',
      request
    })
  } catch (error) {
    console.error('Withdraw participation request error:', error)
    const status = error.message === 'Request not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to withdraw request'
    })
  }
})

export default router
