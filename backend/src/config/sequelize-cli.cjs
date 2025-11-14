const path = require('path')
const dotenv = require('dotenv')

// Load backend-specific environment variables
dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env')
})

const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'calendar_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres'
}

const createConfig = (overrides = {}) => ({
  ...baseConfig,
  ...overrides
})

module.exports = {
  development: createConfig({ logging: console.log }),
  test: createConfig({
    database: `${baseConfig.database}_test`,
    logging: false
  }),
  production: createConfig({ logging: false })
}
