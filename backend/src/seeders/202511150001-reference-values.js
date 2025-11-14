
const departments = [
  { value: 'Mathematics' },
  { value: 'Science' },
  { value: 'English' },
  { value: 'History' },
  { value: 'Physical Education' },
  { value: 'Arts' },
  { value: 'Computer Science' },
  { value: 'Languages' }
]

const subjects = [
  { value: 'Algebra I', metadata: { department: 'Mathematics' } },
  { value: 'Geometry', metadata: { department: 'Mathematics' } },
  { value: 'Physics', metadata: { department: 'Science' } },
  { value: 'Biology', metadata: { department: 'Science' } },
  { value: 'Chemistry', metadata: { department: 'Science' } },
  { value: 'World History', metadata: { department: 'History' } },
  { value: 'English Literature', metadata: { department: 'English' } },
  { value: 'Physical Education', metadata: { department: 'Physical Education' } },
  { value: 'Digital Arts', metadata: { department: 'Arts' } },
  { value: 'Computer Programming', metadata: { department: 'Computer Science' } },
  { value: 'Spanish Conversation', metadata: { department: 'Languages' } }
]

import { randomUUID } from 'node:crypto'

const serializeMetadata = (metadata) => JSON.stringify(metadata || {})

export default {
  async up(queryInterface) {
    const timestamp = new Date()

    const rows = [
      ...departments.map(item => ({
        id: randomUUID(),
        category: 'department',
        value: item.value,
        metadata: serializeMetadata(item.metadata),
        created_at: timestamp,
        updated_at: timestamp
      })),
      ...subjects.map(item => ({
        id: randomUUID(),
        category: 'subject',
        value: item.value,
        metadata: serializeMetadata(item.metadata),
        created_at: timestamp,
        updated_at: timestamp
      }))
    ]

    await queryInterface.bulkInsert('reference_values', rows, { ignoreDuplicates: true })
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reference_values', null, {})
  }
}
