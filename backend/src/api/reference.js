import express from 'express'
import ReferenceValue from '../models/ReferenceValue.js'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const [referenceValues, teachers] = await Promise.all([
      ReferenceValue.findAll({
        order: [['value', 'ASC']]
      }),
      User.findAll({
        where: { role: 'teacher' },
        attributes: ['id', 'name', 'email', 'department', 'status', 'metadata'],
        order: [['name', 'ASC']]
      })
    ])

    const payload = {
      departments: [],
      subjects: [],
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        status: teacher.status,
        subjects: teacher.metadata?.subjects || []
      }))
    }

    for (const item of referenceValues) {
      if (item.category === 'department') {
        payload.departments.push({
          value: item.value,
          metadata: item.metadata || {}
        })
      }
      if (item.category === 'subject') {
        payload.subjects.push({
          value: item.value,
          metadata: item.metadata || {}
        })
      }
    }

    res.json(payload)
  } catch (error) {
    console.error('Reference data fetch error:', error)
    res.status(500).json({
      error: 'Failed to load reference data'
    })
  }
})

export default router
