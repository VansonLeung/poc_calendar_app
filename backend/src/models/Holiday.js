import { DataTypes, Model } from 'sequelize'

class Holiday extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 150]
        }
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isAfterStart(value) {
            if (value < this.start_date) {
              throw new Error('Holiday end date cannot be before start date')
            }
          }
        }
      },
      holiday_type: {
        type: DataTypes.ENUM('federal', 'school', 'exam_break', 'custom'),
        allowNull: false,
        defaultValue: 'school'
      },
      scope: {
        type: DataTypes.ENUM('all', 'department', 'custom_list'),
        allowNull: false,
        defaultValue: 'all'
      },
      visibility_list: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          departments: [],
          teacher_ids: []
        }
      },
      description: {
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
      modelName: 'Holiday',
      tableName: 'holidays',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['name', 'start_date']
        },
        {
          fields: ['start_date']
        }
      ]
    })
  }
}

export default Holiday
