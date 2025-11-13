import { DataTypes, Model } from 'sequelize'
import bcrypt from 'bcrypt'
import config from '../config/index.js'

class User extends Model {
  // Instance methods
  async checkPassword(password) {
    return await bcrypt.compare(password, this.password_hash)
  }

  toJSON() {
    const values = { ...this.get() }
    delete values.password_hash
    return values
  }

  // Class methods
  static async hashPassword(password) {
    const saltRounds = config.bcrypt.rounds
    return await bcrypt.hash(password, saltRounds)
  }

  static async findByEmail(email) {
    return await this.findOne({ where: { email: email.toLowerCase() } })
  }

  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC',
        validate: {
          isIn: [config.validation.user.validTimezones]
        }
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    })
  }

  static associate(models) {
    this.hasMany(models.Calendar, {
      foreignKey: 'owner_id',
      as: 'calendars'
    })
    this.hasMany(models.Permission, {
      foreignKey: 'user_id',
      as: 'permissions'
    })
  }
}

export default User