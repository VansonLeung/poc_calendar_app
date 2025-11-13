import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 13331,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'calendar_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Bcrypt configuration
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // API configuration
  api: {
    version: 'v1',
    basePath: '/api/v1'
  },

  // CORS configuration
  cors: {},

  // Validation rules
  validation: {
    password: {
      minLength: 8
    },
    user: {
      validTimezones: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']
    }
  }
}

// Validate critical configuration
const validateConfig = () => {
  const errors = []

  if (!config.jwt.secret || config.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push('JWT_SECRET must be set to a secure value in production')
  }

  if (config.database.password === 'password') {
    errors.push('DB_PASSWORD should be changed from default value')
  }

  if (errors.length > 0) {
    console.warn('Configuration warnings:')
    errors.forEach(error => console.warn(`- ${error}`))
  }
}

// Validate on import
validateConfig()

export default config