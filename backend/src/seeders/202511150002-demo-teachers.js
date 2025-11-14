import bcrypt from 'bcrypt'
import { randomUUID } from 'node:crypto'

const teachers = [
  {
    name: 'Alice Ng',
    email: 'alice.ng@example.edu',
    department: 'Mathematics',
    subjects: ['Algebra I', 'Geometry']
  },
  {
    name: 'Brian Patel',
    email: 'brian.patel@example.edu',
    department: 'Science',
    subjects: ['Physics', 'Chemistry']
  },
  {
    name: 'Carla Martinez',
    email: 'carla.martinez@example.edu',
    department: 'English',
    subjects: ['English Literature']
  },
  {
    name: 'David Chen',
    email: 'david.chen@example.edu',
    department: 'Computer Science',
    subjects: ['Computer Programming']
  },
  {
    name: 'Ella Rossi',
    email: 'ella.rossi@example.edu',
    department: 'Physical Education',
    subjects: ['Physical Education']
  }
]

export default {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('teachpass123', 10)
    const timestamp = new Date()

    const rows = teachers.map((teacher, index) => ({
      id: randomUUID(),
      email: teacher.email.toLowerCase(),
      password_hash: passwordHash,
      name: teacher.name,
      timezone: 'UTC',
      role: 'teacher',
      employee_id: `T-${String(index + 1).padStart(4, '0')}`,
      department: teacher.department,
      status: 'active',
      metadata: JSON.stringify({
        subjects: teacher.subjects
      }),
      created_at: timestamp,
      updated_at: timestamp
    }))

    await queryInterface.bulkInsert('users', rows, { ignoreDuplicates: true })
  },

  async down(queryInterface) {
    const emails = teachers.map(teacher => teacher.email.toLowerCase())
    await queryInterface.bulkDelete('users', {
      email: emails
    })
  }
}
