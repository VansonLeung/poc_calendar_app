import { DataTypes, Model } from 'sequelize'

class SubstituteRequest extends Model {
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
      original_teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      requested_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('open', 'matching', 'assigned', 'fulfilled', 'cancelled'),
        allowNull: false,
        defaultValue: 'open'
      },
      assigned_teacher_id: {
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
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'SubstituteRequest',
      tableName: 'substitute_requests',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['event_id']
        },
        {
          fields: ['original_teacher_id']
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
      foreignKey: 'original_teacher_id',
      as: 'originalTeacher'
    })
    this.belongsTo(models.User, {
      foreignKey: 'requested_by',
      as: 'requester'
    })
    this.belongsTo(models.User, {
      foreignKey: 'assigned_teacher_id',
      as: 'assignedTeacher'
    })
  }
}

export default SubstituteRequest
