export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reference_values', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      category: {
        type: Sequelize.ENUM('department', 'subject'),
        allowNull: false
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    })


    await queryInterface.addConstraint('reference_values', {
      type: 'unique',
      fields: ['category', 'value'],
      name: 'reference_values_category_value_unique'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('reference_values', 'reference_values_category_value_unique')
    await queryInterface.dropTable('reference_values')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reference_values_category";')
  }
}
