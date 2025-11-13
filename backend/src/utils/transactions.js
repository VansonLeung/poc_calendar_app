import { sequelize } from '../config/database.js'

/**
 * Execute a function within a database transaction
 * @param {Function} callback - Function to execute within transaction
 * @param {Object} options - Transaction options
 * @returns {Promise} Result of the callback function
 */
export const withTransaction = async (callback, options = {}) => {
  const transaction = await sequelize.transaction(options)

  try {
    const result = await callback(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

/**
 * Execute multiple operations in a single transaction
 * @param {Array<Function>} operations - Array of functions that receive transaction
 * @returns {Promise<Array>} Results of all operations
 */
export const withTransactionAll = async (operations) => {
  const transaction = await sequelize.transaction()

  try {
    const results = await Promise.all(
      operations.map(operation => operation(transaction))
    )
    await transaction.commit()
    return results
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

/**
 * Create a transaction-aware version of a service method
 * @param {Function} method - The method to wrap
 * @returns {Function} Transaction-aware method
 */
export const transactionAware = (method) => {
  return async function(...args) {
    const transaction = await sequelize.transaction()
    try {
      // Add transaction as last argument
      const result = await method(...args, transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

export default {
  withTransaction,
  withTransactionAll,
  transactionAware
}