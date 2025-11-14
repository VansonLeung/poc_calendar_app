import { DataTypes, Model } from 'sequelize'

class ReferenceValue extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      category: {
        type: DataTypes.ENUM('department', 'subject'),
        allowNull: false
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'ReferenceValue',
      tableName: 'reference_values',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['category', 'value']
        }
      ]
    })
  }
}

export default ReferenceValue
