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
      role: {
        type: DataTypes.ENUM('teacher', 'admin'),
        allowNull: false,
        defaultValue: 'teacher'
      },
      employee_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 50]
        }
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 100]
        }
      },
      status: {
        type: DataTypes.ENUM('active', 'on_leave', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
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
        },
        {
          unique: true,
          fields: ['employee_id']
        },
        {
          fields: ['role', 'department']
        },
        {
          fields: ['status']
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
    this.hasMany(models.Event, {
      foreignKey: 'created_by',
      as: 'created_events'
    })
    this.hasMany(models.EventParticipant, {
      foreignKey: 'teacher_id',
      as: 'participations'
    })
    this.hasMany(models.ParticipationRequest, {
      foreignKey: 'requester_id',
      as: 'participationRequests'
    })
    this.hasMany(models.ParticipationRequest, {
      foreignKey: 'approver_id',
      as: 'approvals'
    })
    this.hasMany(models.LeaveRequest, {
      foreignKey: 'teacher_id',
      as: 'leaveRequests'
    })
    this.hasMany(models.LeaveRequest, {
      foreignKey: 'approver_id',
      as: 'leaveApprovals'
    })
    this.hasMany(models.SubstituteRequest, {
      foreignKey: 'requested_by',
      as: 'substituteRequests'
    })
    this.hasMany(models.SubstituteRequest, {
      foreignKey: 'assigned_teacher_id',
      as: 'assignedSubstituteRoles'
    })
  }
}

export default User
