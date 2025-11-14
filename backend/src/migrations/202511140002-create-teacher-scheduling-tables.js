export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_participants', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      teacher_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      participation_role: {
        type: Sequelize.ENUM('primary', 'assistant', 'substitute', 'observer'),
        allowNull: false,
        defaultValue: 'primary'
      },
      invitation_method: {
        type: Sequelize.ENUM('invite', 'assign', 'apply', 'auto_substitute'),
        allowNull: false,
        defaultValue: 'invite'
      },
      status: {
        type: Sequelize.ENUM('invited', 'pending', 'accepted', 'rejected', 'cancelled', 'withdrawn'),
        allowNull: false,
        defaultValue: 'invited'
      },
      requires_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      remarks: {
        type: Sequelize.TEXT
      },
      responded_at: {
        type: Sequelize.DATE
      },
      assigned_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assigned_at: {
        type: Sequelize.DATE
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
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

    await queryInterface.addConstraint('event_participants', {
      type: 'unique',
      fields: ['event_id', 'teacher_id'],
      name: 'event_participants_event_teacher_unique'
    })

    await queryInterface.addIndex('event_participants', ['teacher_id'], {
      name: 'event_participants_teacher_idx'
    })

    await queryInterface.addIndex('event_participants', ['status'], {
      name: 'event_participants_status_idx'
    })

    await queryInterface.createTable('participation_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requester_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      target_teacher_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.ENUM('join', 'cancel', 'substitute', 'withdraw'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'withdrawn', 'expired'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approver_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      decision_notes: {
        type: Sequelize.TEXT
      },
      requested_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      responded_at: {
        type: Sequelize.DATE
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
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

    await queryInterface.addIndex('participation_requests', ['event_id'], {
      name: 'participation_requests_event_idx'
    })

    await queryInterface.addIndex('participation_requests', ['requester_id'], {
      name: 'participation_requests_requester_idx'
    })

    await queryInterface.addIndex('participation_requests', ['status'], {
      name: 'participation_requests_status_idx'
    })

    await queryInterface.createTable('leave_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      teacher_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      leave_type: {
        type: Sequelize.ENUM('annual', 'sick', 'training', 'personal', 'other'),
        allowNull: false,
        defaultValue: 'annual'
      },
      start_datetime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_datetime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      reason: {
        type: Sequelize.TEXT
      },
      coverage_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      approver_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      responded_at: {
        type: Sequelize.DATE
      },
      attachment_url: {
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
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

    await queryInterface.addIndex('leave_requests', ['teacher_id', 'start_datetime'], {
      name: 'leave_requests_teacher_start_idx'
    })

    await queryInterface.addIndex('leave_requests', ['status'], {
      name: 'leave_requests_status_idx'
    })

    await queryInterface.createTable('leave_request_events', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      leave_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'leave_requests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      participant_id: {
        type: Sequelize.UUID,
        references: {
          model: 'event_participants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      needs_substitute: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      substitute_status: {
        type: Sequelize.ENUM('pending', 'assigned', 'not_needed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      substitute_teacher_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolution_notes: {
        type: Sequelize.TEXT
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

    await queryInterface.addConstraint('leave_request_events', {
      type: 'unique',
      fields: ['leave_request_id', 'event_id'],
      name: 'leave_request_events_unique'
    })

    await queryInterface.addIndex('leave_request_events', ['event_id'], {
      name: 'leave_request_events_event_idx'
    })

    await queryInterface.addIndex('leave_request_events', ['substitute_status'], {
      name: 'leave_request_events_sub_status_idx'
    })

    await queryInterface.createTable('holidays', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      holiday_type: {
        type: Sequelize.ENUM('federal', 'school', 'exam_break', 'custom'),
        allowNull: false,
        defaultValue: 'school'
      },
      scope: {
        type: Sequelize.ENUM('all', 'department', 'custom_list'),
        allowNull: false,
        defaultValue: 'all'
      },
      visibility_list: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{"departments":[],"teacher_ids":[]}'::jsonb`)
      },
      description: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
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

    await queryInterface.addConstraint('holidays', {
      type: 'unique',
      fields: ['name', 'start_date'],
      name: 'holidays_name_start_unique'
    })

    await queryInterface.addIndex('holidays', ['start_date'], {
      name: 'holidays_start_date_idx'
    })

    await queryInterface.createTable('substitute_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      original_teacher_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requested_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reason: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('open', 'matching', 'assigned', 'fulfilled', 'cancelled'),
        allowNull: false,
        defaultValue: 'open'
      },
      assigned_teacher_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assigned_at: {
        type: Sequelize.DATE
      },
      expires_at: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`)
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

    await queryInterface.addIndex('substitute_requests', ['event_id'], {
      name: 'substitute_requests_event_idx'
    })

    await queryInterface.addIndex('substitute_requests', ['original_teacher_id'], {
      name: 'substitute_requests_original_teacher_idx'
    })

    await queryInterface.addIndex('substitute_requests', ['status'], {
      name: 'substitute_requests_status_idx'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('substitute_requests', 'substitute_requests_status_idx')
    await queryInterface.removeIndex('substitute_requests', 'substitute_requests_original_teacher_idx')
    await queryInterface.removeIndex('substitute_requests', 'substitute_requests_event_idx')
    await queryInterface.dropTable('substitute_requests')

    await queryInterface.removeIndex('holidays', 'holidays_start_date_idx')
    await queryInterface.dropTable('holidays')

    await queryInterface.removeIndex('leave_request_events', 'leave_request_events_sub_status_idx')
    await queryInterface.removeIndex('leave_request_events', 'leave_request_events_event_idx')
    await queryInterface.removeConstraint('leave_request_events', 'leave_request_events_unique')
    await queryInterface.dropTable('leave_request_events')

    await queryInterface.removeIndex('leave_requests', 'leave_requests_status_idx')
    await queryInterface.removeIndex('leave_requests', 'leave_requests_teacher_start_idx')
    await queryInterface.dropTable('leave_requests')

    await queryInterface.removeIndex('participation_requests', 'participation_requests_status_idx')
    await queryInterface.removeIndex('participation_requests', 'participation_requests_requester_idx')
    await queryInterface.removeIndex('participation_requests', 'participation_requests_event_idx')
    await queryInterface.dropTable('participation_requests')

    await queryInterface.removeIndex('event_participants', 'event_participants_status_idx')
    await queryInterface.removeIndex('event_participants', 'event_participants_teacher_idx')
    await queryInterface.removeConstraint('event_participants', 'event_participants_event_teacher_unique')
    await queryInterface.dropTable('event_participants')

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_event_participants_participation_role";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_event_participants_invitation_method";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_event_participants_status";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_participation_requests_action";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_participation_requests_status";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leave_requests_leave_type";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leave_requests_status";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leave_request_events_substitute_status";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_holidays_holiday_type";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_holidays_scope";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_substitute_requests_status";')
  }
}
