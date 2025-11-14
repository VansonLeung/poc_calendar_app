import { DataTypes, Model } from 'sequelize'

class LeaveRequestEvent extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      leave_request_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'leave_requests',
          key: 'id'
        }
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        }
      },
      participant_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'event_participants',
          key: 'id'
        }
      },
      needs_substitute: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      substitute_status: {
        type: DataTypes.ENUM('pending', 'assigned', 'not_needed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      substitute_teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolution_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'LeaveRequestEvent',
      tableName: 'leave_request_events',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['leave_request_id', 'event_id']
        },
        {
          fields: ['event_id']
        },
        {
          fields: ['substitute_status']
        }
      ]
    })
  }

  static associate(models) {
    this.belongsTo(models.LeaveRequest, {
      foreignKey: 'leave_request_id',
      as: 'leaveRequest'
    })
    this.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event'
    })
    this.belongsTo(models.EventParticipant, {
      foreignKey: 'participant_id',
      as: 'participant'
    })
    this.belongsTo(models.User, {
      foreignKey: 'substitute_teacher_id',
      as: 'substituteTeacher'
    })
  }
}

export default LeaveRequestEvent
