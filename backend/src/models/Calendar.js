import { DataTypes, Model } from 'sequelize'

class Calendar extends Model {
  // Instance methods
  isOwner(userId) {
    return this.owner_id === userId
  }

  // Check if user has permission level
  async hasPermission(userId, requiredLevel) {
    if (this.isOwner(userId)) return true

    const Permission = this.sequelize.models.Permission
    const permission = await Permission.findOne({
      where: {
        calendar_id: this.id,
        user_id: userId
      }
    })

    if (!permission) return false

    const levels = { 'view': 1, 'edit': 2, 'admin': 3 }
    return levels[permission.permission_level] >= levels[requiredLevel]
  }

  // Class methods
  static async findByOwner(ownerId) {
    return await this.findAll({
      where: { owner_id: ownerId },
      order: [['created_at', 'DESC']]
    })
  }

  static async findSharedWithUser(userId) {
    const Permission = this.sequelize.models.Permission
    const permissions = await Permission.findAll({
      where: { user_id: userId },
      include: [{
        model: this,
        as: 'calendar'
      }]
    })

    return permissions.map(p => p.calendar)
  }

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
          notEmpty: true,
          len: [1, 100]
        }
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      color: {
        type: DataTypes.STRING,
        defaultValue: '#3788d8',
        validate: {
          is: /^#[0-9A-F]{6}$/i
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Calendar',
      tableName: 'calendars',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['owner_id']
        },
        {
          fields: ['name']
        }
      ]
    })
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'owner_id',
      as: 'owner'
    })
    this.hasMany(models.Event, {
      foreignKey: 'calendar_id',
      as: 'events'
    })
    this.hasMany(models.Permission, {
      foreignKey: 'calendar_id',
      as: 'permissions'
    })
  }
}

export default Calendar