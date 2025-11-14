import { DataTypes, Model } from 'sequelize'

class ParticipationRequest extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        }
      },
      requester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      target_teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: DataTypes.ENUM('join', 'cancel', 'substitute', 'withdraw'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'withdrawn', 'expired'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approver_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      decision_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requested_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'ParticipationRequest',
      tableName: 'participation_requests',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['event_id']
        },
        {
          fields: ['requester_id']
        },
        {
          fields: ['status']
        }
      ]
    })
  }

  static associate(models) {
    this.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event'
    })
    this.belongsTo(models.User, {
      foreignKey: 'requester_id',
      as: 'requester'
    })
    this.belongsTo(models.User, {
      foreignKey: 'target_teacher_id',
      as: 'targetTeacher'
    })
    this.belongsTo(models.User, {
      foreignKey: 'approver_id',
      as: 'approver'
    })
  }
}

export default ParticipationRequest
