import express from 'express'
import leaveService from '../services/leaveService.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticateToken)

router.post('/leave-requests', async (req, res) => {
  try {
    const result = await leaveService.createLeaveRequest(req.user.id, req.body)
    res.status(201).json({
      message: 'Leave request submitted',
      ...result
    })
  } catch (error) {
    console.error('Create leave request error:', error)
    res.status(400).json({
      error: error.message || 'Failed to submit leave request'
    })
  }
})

router.get('/leave-requests', async (req, res) => {
  try {
    const requests = await leaveService.listLeaveRequests(req.user.id)
    res.json({ requests })
  } catch (error) {
    console.error('List leave requests error:', error)
    res.status(400).json({
      error: error.message || 'Failed to list leave requests'
    })
  }
})

router.get('/leave-requests/pending', async (req, res) => {
  try {
    const pending = await leaveService.listPendingLeaves(req.user)
    res.json({ requests: pending })
  } catch (error) {
    console.error('List pending leave requests error:', error)
    const status = error.message === 'Admin access required' ? 403 : 400
    res.status(status).json({
      error: error.message || 'Failed to list pending leave requests'
    })
  }
})

router.get('/leave-requests/:leaveId/affected-events', async (req, res) => {
  try {
    const events = await leaveService.getAffectedEvents(req.params.leaveId, req.user)
    res.json({ events })
  } catch (error) {
    console.error('Get affected events error:', error)
    const status = error.message === 'Leave request not found' ? 404 : 400
    res.status(status).json({
      error: error.message || 'Failed to fetch affected events'
    })
  }
})

router.post('/leave-requests/:leaveId/approve', async (req, res) => {
  try {
    const leave = await leaveService.approveLeave(req.params.leaveId, req.user)
    res.json({
      message: 'Leave approved',
      leave
    })
  } catch (error) {
    console.error('Approve leave error:', error)
    const status = error.message === 'Leave request not found'
      ? 404
      : error.message === 'Admin access required'
        ? 403
        : 400
    res.status(status).json({
      error: error.message || 'Failed to approve leave'
    })
  }
})

router.post('/leave-requests/:leaveId/reject', async (req, res) => {
  try {
    const leave = await leaveService.rejectLeave(req.params.leaveId, req.user, req.body?.notes)
    res.json({
      message: 'Leave rejected',
      leave
    })
  } catch (error) {
    console.error('Reject leave error:', error)
    const status = error.message === 'Leave request not found'
      ? 404
      : error.message === 'Admin access required'
        ? 403
        : 400
    res.status(status).json({
      error: error.message || 'Failed to reject leave'
    })
  }
})

router.delete('/leave-requests/:leaveId', async (req, res) => {
  try {
    const leave = await leaveService.cancelLeave(req.params.leaveId, req.user)
    res.json({
      message: 'Leave request cancelled',
      leave
    })
  } catch (error) {
    console.error('Cancel leave error:', error)
    const status = error.message === 'Leave request not found'
      ? 404
      : error.message === 'Access denied'
        ? 403
        : 400
    res.status(status).json({
      error: error.message || 'Failed to cancel leave'
    })
  }
})

export default router
