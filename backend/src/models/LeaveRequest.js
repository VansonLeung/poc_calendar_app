import { DataTypes, Model } from 'sequelize'

class LeaveRequest extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      leave_type: {
        type: DataTypes.ENUM('annual', 'sick', 'training', 'personal', 'other'),
        allowNull: false,
        defaultValue: 'annual'
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
      status: {
        type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      coverage_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      approver_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      attachment_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: value => {
            if (value && !/^https?:\/\//i.test(value)) {
              throw new Error('Attachment URL must be a valid http(s) URL')
            }
          }
        }
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'LeaveRequest',
      tableName: 'leave_requests',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['teacher_id', 'start_datetime']
        },
        {
          fields: ['status']
        }
      ]
    })
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    })
    this.belongsTo(models.User, {
      foreignKey: 'approver_id',
      as: 'approver'
    })
    this.hasMany(models.LeaveRequestEvent, {
      foreignKey: 'leave_request_id',
      as: 'affectedEvents'
    })
  }
}

export default LeaveRequest
