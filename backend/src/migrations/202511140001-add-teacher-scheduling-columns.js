export default {
  async up(queryInterface, Sequelize) {
    const userTable = await queryInterface.describeTable('users')
    const eventTable = await queryInterface.describeTable('events')

    // Users table changes
    if (!userTable.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('teacher', 'admin'),
        allowNull: false,
        defaultValue: 'teacher'
      })
    }

    if (!userTable.employee_id) {
      await queryInterface.addColumn('users', 'employee_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      })
    }

    if (!userTable.department) {
      await queryInterface.addColumn('users', 'department', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }

    if (!userTable.status) {
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.ENUM('active', 'on_leave', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      })
    }

    if (!userTable.metadata) {
      await queryInterface.addColumn('users', 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
      })
    }

    const userIndexes = await queryInterface.showIndex('users')
    const hasRoleDeptIdx = userIndexes.some(index => index.name === 'users_role_department_idx')
    if (!hasRoleDeptIdx) {
      await queryInterface.addIndex('users', ['role', 'department'], {
        name: 'users_role_department_idx'
      })
    }

    const hasStatusIdx = userIndexes.some(index => index.name === 'users_status_idx')
    if (!hasStatusIdx) {
      await queryInterface.addIndex('users', ['status'], {
        name: 'users_status_idx'
      })
    }

    // Events table changes
    if (!eventTable.event_type) {
      await queryInterface.addColumn('events', 'event_type', {
        type: Sequelize.ENUM('lesson', 'meeting', 'duty', 'exam', 'activity'),
        allowNull: false,
        defaultValue: 'lesson'
      })
    }

    if (!eventTable.status) {
      await queryInterface.addColumn('events', 'status', {
        type: Sequelize.ENUM('scheduled', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'scheduled'
      })
    }

    const createdByExists = !!eventTable.created_by
    if (!createdByExists) {
      await queryInterface.addColumn('events', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      })

      await queryInterface.sequelize.query(`
        UPDATE events e
        SET created_by = c.owner_id
        FROM calendars c
        WHERE e.calendar_id = c.id
          AND e.created_by IS NULL
      `)

      await queryInterface.changeColumn('events', 'created_by', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      })
    }

    if (!eventTable.requires_approval) {
      await queryInterface.addColumn('events', 'requires_approval', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    }

    if (!eventTable.location) {
      await queryInterface.addColumn('events', 'location', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }

    if (!eventTable.class_name) {
      await queryInterface.addColumn('events', 'class_name', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }

    if (!eventTable.subject) {
      await queryInterface.addColumn('events', 'subject', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }

    if (!eventTable.visibility_type) {
      await queryInterface.addColumn('events', 'visibility_type', {
        type: Sequelize.ENUM('public', 'private', 'whitelist', 'blacklist'),
        allowNull: false,
        defaultValue: 'public'
      })
    }

    if (!eventTable.visibility_list) {
      await queryInterface.addColumn('events', 'visibility_list', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: Sequelize.literal(`'{"allowed_users":[],"blocked_users":[]}'::jsonb`)
      })
    }

    if (!eventTable.metadata) {
      await queryInterface.addColumn('events', 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
      })
    }

    const eventIndexes = await queryInterface.showIndex('events')

    if (!eventIndexes.some(index => index.name === 'events_created_by_idx')) {
      await queryInterface.addIndex('events', ['created_by'], {
        name: 'events_created_by_idx'
      })
    }

    if (!eventIndexes.some(index => index.name === 'events_event_type_idx')) {
      await queryInterface.addIndex('events', ['event_type'], {
        name: 'events_event_type_idx'
      })
    }

    if (!eventIndexes.some(index => index.name === 'events_status_idx')) {
      await queryInterface.addIndex('events', ['status'], {
        name: 'events_status_idx'
      })
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('events', 'events_status_idx')
    await queryInterface.removeIndex('events', 'events_event_type_idx')
    await queryInterface.removeIndex('events', 'events_created_by_idx')

    await queryInterface.removeColumn('events', 'metadata')
    await queryInterface.removeColumn('events', 'visibility_list')
    await queryInterface.removeColumn('events', 'visibility_type')
    await queryInterface.removeColumn('events', 'subject')
    await queryInterface.removeColumn('events', 'class_name')
    await queryInterface.removeColumn('events', 'location')
    await queryInterface.removeColumn('events', 'requires_approval')
    await queryInterface.removeColumn('events', 'created_by')
    await queryInterface.removeColumn('events', 'status')
    await queryInterface.removeColumn('events', 'event_type')

    await queryInterface.removeIndex('users', 'users_status_idx')
    await queryInterface.removeIndex('users', 'users_role_department_idx')

    await queryInterface.removeColumn('users', 'metadata')
    await queryInterface.removeColumn('users', 'status')
    await queryInterface.removeColumn('users', 'department')
    await queryInterface.removeColumn('users', 'employee_id')
    await queryInterface.removeColumn('users', 'role')

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_events_event_type";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_events_status";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_events_visibility_type";')
  }
}
