import sequelize from '../config/database.js'
import User from './User.js'
import Calendar from './Calendar.js'
import Event from './Event.js'
import Permission from './Permission.js'

// Initialize models
const models = {
  User,
  Calendar,
  Event,
  Permission
}

// Initialize each model
Object.values(models).forEach(model => {
  if (model.init) {
    model.init(sequelize)
  }
})

// Set up associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models)
  }
})

// Export all models
export { User, Calendar, Event, Permission }

// Export sequelize instance
export { sequelize }

// Function to sync all models
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force })
    console.log(`Database ${force ? 'force ' : ''}synced successfully`)
  } catch (error) {
    console.error('Database sync failed:', error)
    throw error
  }
}

// Function to initialize database with required data
export const initializeDatabase = async () => {
  try {
    await syncDatabase()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}