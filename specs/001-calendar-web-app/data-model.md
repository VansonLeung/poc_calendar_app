# Data Model: Calendar Web Application

## Entities

### User
- **id**: UUID, primary key
- **email**: String, unique, required (for authentication)
- **password_hash**: String, required (bcrypt hashed)
- **name**: String, required
- **timezone**: String, default 'UTC'
- **created_at**: DateTime
- **updated_at**: DateTime

**Relationships**:
- Has many Calendars (owner)
- Has many Permissions

**Validation Rules**:
- Email must be valid format and unique
- Password must be at least 8 characters (enforced at API level)
- Timezone must be valid IANA timezone identifier

### Calendar
- **id**: UUID, primary key
- **name**: String, required
- **owner_id**: UUID, foreign key to User, required
- **color**: String, default '#3788d8' (hex color)
- **description**: Text, optional
- **created_at**: DateTime
- **updated_at**: DateTime

**Relationships**:
- Belongs to User (owner)
- Has many Events
- Has many Permissions

**Validation Rules**:
- Name cannot be empty
- Color must be valid hex color code
- Owner must exist

### Event
- **id**: UUID, primary key
- **calendar_id**: UUID, foreign key to Calendar, required
- **title**: String, required
- **start_datetime**: DateTime, required
- **end_datetime**: DateTime, required
- **description**: Text, optional
- **recurrence_rule**: Text, optional (rrule format)
- **created_at**: DateTime
- **updated_at**: DateTime

**Relationships**:
- Belongs to Calendar

**Validation Rules**:
- Title cannot be empty
- End datetime must be after start datetime
- Calendar must exist and user must have write permission
- Recurrence rule must be valid rrule if provided

### Permission
- **id**: UUID, primary key
- **calendar_id**: UUID, foreign key to Calendar, required
- **user_id**: UUID, foreign key to User, required
- **permission_level**: Enum ('view', 'edit', 'admin'), required
- **created_at**: DateTime

**Relationships**:
- Belongs to Calendar
- Belongs to User

**Validation Rules**:
- Permission level must be one of: view, edit, admin
- User cannot have multiple permissions for same calendar
- Calendar owner automatically has admin permission (enforced in business logic)

## State Transitions

### Event States
- **Created**: Initial state when event is created
- **Updated**: When event details are modified
- **Deleted**: Soft delete (marked as deleted, not removed from DB)

No complex state machine required for initial implementation.

## Data Volume Assumptions
- Users: 10,000+ total users
- Calendars: 5+ per user average
- Events: 100+ per calendar average
- Permissions: 3+ per calendar average

## Indexing Strategy
- Users: email (unique)
- Calendars: owner_id
- Events: calendar_id, start_datetime, end_datetime
- Permissions: calendar_id, user_id (unique composite)