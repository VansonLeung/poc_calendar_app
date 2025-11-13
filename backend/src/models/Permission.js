import { DataTypes, Model } from 'sequelize'

class Permission extends Model {
  // Instance methods
  canView() {
    return ['view', 'edit', 'admin'].includes(this.permission_level)
  }

  canEdit() {
    return ['edit', 'admin'].includes(this.permission_level)
  }

  canAdmin() {
    return this.permission_level === 'admin'
  }

  // Class methods
  static async findByCalendar(calendarId) {
    return await this.findAll({
      where: { calendar_id: calendarId },
      include: [{
        model: this.sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    })
  }

  static async findByUser(userId) {
    return await this.findAll({
      where: { user_id: userId },
      include: [{
        model: this.sequelize.models.Calendar,
        as: 'calendar'
      }]
    })
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      permission_level: {
        type: DataTypes.ENUM('view', 'edit', 'admin'),
        allowNull: false,
        defaultValue: 'view'
      }
    }, {
      sequelize,
      modelName: 'Permission',
      tableName: 'permissions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['calendar_id', 'user_id']
        },
        {
          fields: ['calendar_id']
        },
        {
          fields: ['user_id']
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
      foreignKey: 'user_id',
      as: 'user'
    })
  }
}

export default Permission