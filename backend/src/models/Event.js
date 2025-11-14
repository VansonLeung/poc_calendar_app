import { DataTypes, Model, Op } from 'sequelize'
import pkg from 'rrule'
const { RRule } = pkg

class Event extends Model {
  // Instance methods
  isRecurring() {
    return !!this.recurrence_rule
  }

  getRecurrenceRule() {
    if (!this.recurrence_rule) return null
    try {
      return RRule.fromString(this.recurrence_rule)
    } catch (error) {
      console.error('Invalid recurrence rule:', error)
      return null
    }
  }

  // Get all occurrences within a date range
  getOccurrences(startDate, endDate) {
    if (!this.isRecurring()) {
      return this.start_datetime >= startDate && this.start_datetime <= endDate ? [this] : []
    }

    const rule = this.getRecurrenceRule()
    if (!rule) return []

    const occurrences = []
    const duration = this.end_datetime - this.start_datetime

    rule.between(startDate, endDate, true).forEach(date => {
      const occurrence = {
        ...this.toJSON(),
        start_datetime: new Date(date),
        end_datetime: new Date(date.getTime() + duration),
        is_occurrence: true,
        original_event_id: this.id
      }
      occurrences.push(occurrence)
    })

    return occurrences
  }

  // Class methods
  static async findByCalendar(calendarId, startDate = null, endDate = null) {
    const where = { calendar_id: calendarId }

    if (startDate && endDate) {
      where[Op.or] = [
        // Non-recurring events within range
        {
          recurrence_rule: null,
          start_datetime: {
            [Op.between]: [startDate, endDate]
          }
        },
        // Recurring events (need to be filtered in application logic)
        {
          recurrence_rule: { [Op.ne]: null }
        }
      ]
    }

    return await this.findAll({
      where,
      order: [['start_datetime', 'ASC']]
    })
  }

  static async findOverlapping(calendarId, startDate, endDate, excludeEventId = null) {
    const where = {
      calendar_id: calendarId,
      [Op.or]: [
        {
          [Op.and]: [
            { start_datetime: { [Op.lt]: endDate } },
            { end_datetime: { [Op.gt]: startDate } }
          ]
        }
      ]
    }

    if (excludeEventId) {
      where.id = { [Op.ne]: excludeEventId }
    }

    return await this.findAll({ where })
  }

  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      calendar_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'calendars',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200]
        }
      },
      event_type: {
        type: DataTypes.ENUM('lesson', 'meeting', 'duty', 'exam', 'activity'),
        allowNull: false,
        defaultValue: 'lesson'
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      requires_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 150]
        }
      },
      class_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 150]
        }
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 150]
        }
      },
      start_datetime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfterStart(value) {
            if (value <= this.start_datetime) {
              throw new Error('End datetime must be after start datetime')
            }
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      recurrence_rule: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isValidRRule(value) {
            if (value) {
              try {
                RRule.fromString(value)
              } catch {
                throw new Error('Invalid recurrence rule format')
              }
            }
          }
        }
      },
      visibility_type: {
        type: DataTypes.ENUM('public', 'private', 'whitelist', 'blacklist'),
        allowNull: false,
        defaultValue: 'public'
      },
      visibility_list: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          allowed_users: [],
          blocked_users: []
        }
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'Event',
      tableName: 'events',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['calendar_id']
        },
        {
          fields: ['start_datetime', 'end_datetime']
        },
        {
          fields: ['recurrence_rule']
        },
        {
          fields: ['created_by']
        },
        {
          fields: ['event_type']
        },
        {
          fields: ['status']
        }
      ]
    })
  }

  static associate(models) {
    this.belongsTo(models.Calendar, {
      foreignKey: 'calendar_id',
      as: 'calendar'
    })
    this.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    })
    this.hasMany(models.EventParticipant, {
      foreignKey: 'event_id',
      as: 'participants'
    })
    this.hasMany(models.ParticipationRequest, {
      foreignKey: 'event_id',
      as: 'participationRequests'
    })
    this.hasMany(models.LeaveRequestEvent, {
      foreignKey: 'event_id',
      as: 'leaveImpacts'
    })
    this.hasMany(models.SubstituteRequest, {
      foreignKey: 'event_id',
      as: 'substituteRequests'
    })
  }
}

export default Event
