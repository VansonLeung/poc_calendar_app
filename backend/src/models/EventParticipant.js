import { DataTypes, Model } from 'sequelize'

class EventParticipant extends Model {
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
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      participation_role: {
        type: DataTypes.ENUM('primary', 'assistant', 'substitute', 'observer'),
        allowNull: false,
        defaultValue: 'primary'
      },
      invitation_method: {
        type: DataTypes.ENUM('invite', 'assign', 'apply', 'auto_substitute'),
        allowNull: false,
        defaultValue: 'invite'
      },
      status: {
        type: DataTypes.ENUM('invited', 'pending', 'accepted', 'rejected', 'cancelled', 'withdrawn'),
        allowNull: false,
        defaultValue: 'invited'
      },
      requires_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      assigned_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assigned_at: {
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
      modelName: 'EventParticipant',
      tableName: 'event_participants',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['event_id', 'teacher_id']
        },
        {
          fields: ['teacher_id']
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
      foreignKey: 'teacher_id',
      as: 'teacher'
    })
    this.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assignedBy'
    })
  }
}

export default EventParticipant
