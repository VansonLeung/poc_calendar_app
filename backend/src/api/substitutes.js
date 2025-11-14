import express from 'express'
import substituteService from '../services/substituteService.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/affected-events/needs-substitute', async (req, res) => {
  try {
    const events = await substituteService.listAffectedEventsNeedingSubstitute(req.user)
    res.json({ events })
  } catch (error) {
    console.error('List affected events needing substitute error:', error)
    const status = error.message === 'Admin access required' ? 403 : 400
    res.status(status).json({
      error: error.message || 'Failed to list affected events'
    })
  }
})

router.get('/substitutes/available', async (req, res) => {
  try {
    const teachers = await substituteService.findAvailableSubstitutes(req.query)
    res.json({ teachers })
  } catch (error) {
    console.error('Find available substitutes error:', error)
    res.status(400).json({
      error: error.message || 'Failed to find available substitutes'
    })
  }
})

router.post('/affected-events/:affectedEventId/assign-substitute', async (req, res) => {
  try {
    const assignment = await substituteService.assignSubstitute(
      req.params.affectedEventId,
      req.user,
      req.body
    )
    res.json({
      message: 'Substitute assigned',
      assignment
    })
  } catch (error) {
    console.error('Assign substitute error:', error)
    const status = error.message === 'Affected event not found'
      ? 404
      : error.message === 'Access denied'
        ? 403
        : 400
    res.status(status).json({
      error: error.message || 'Failed to assign substitute'
    })
  }
})

export default router
