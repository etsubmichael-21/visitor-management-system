# ECX Visitor Management System — Database Documentation

> **Database:** PostgreSQL 15+  
> **Schema:** `public`  
> **Naming Convention:** `snake_case`, unquoted identifiers  
> **Date:** July 2026

---

## Table of Contents

1. [Entity Summary](#1-entity-summary)
2. [Table: users](#2-table-users)
3. [Table: departments](#3-table-departments)
4. [Table: employees](#4-table-employees)
5. [Table: visitors](#5-table-visitors)
6. [Table: visits](#6-table-visits)
7. [Table: appointments](#7-table-appointments)
8. [Table: notifications](#8-table-notifications)
9. [Table: audit_logs](#9-table-audit_logs)
10. [Table: employee_schedules](#10-table-employee_schedules)
11. [Table: email_queue](#11-table-email_queue)
12. [Table: sms_queue](#12-table-sms_queue)
13. [Enums](#13-enums)
14. [Relationships Matrix](#14-relationships-matrix)
15. [Constraint Summary](#15-constraint-summary)
16. [Index Summary](#16-index-summary)

---

## 1. Entity Summary

| # | Table | Type | Purpose | Rows (est.) | PK |
|---|-------|------|---------|-------------|----|
| 1 | `users` | Core | System user accounts | < 100 | `id` |
| 2 | `departments` | Reference | Organization departments | < 50 | `id` |
| 3 | `employees` | Core | Staff who host visitors | < 500 | `id` |
| 4 | `visitors` | Core | People who visit | < 10,000 | `id` |
| 5 | `visits` | Transactional | Visit records | < 100,000/yr | `id` |
| 6 | `appointments` | Transactional | Scheduled meetings | < 50,000/yr | `id` |
| 7 | `notifications` | Transactional | Employee alerts | < 200,000/yr | `id` |
| 8 | `audit_logs` | Audit | Data change history | < 500,000/yr | `id` |
| 9 | `employee_schedules` | Reference | Weekly availability | < 5,000 | `id` |
| 10 | `email_queue` | Queue | Outbound emails | < 100,000/yr | `id` |
| 11 | `sms_queue` | Queue | Outbound SMS | < 50,000/yr | `id` |

---

## 2. Table: `users`

### Purpose
Stores authentication credentials and role assignments for system users (admins, receptionists, security personnel). Not intended for employees or visitors — those are separate entities.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique user identifier |
| `full_name` | `varchar(100)` | `NOT NULL` | — | User's display name |
| `email` | `varchar(100)` | `NOT NULL`, `UNIQUE` | — | Login email (also used for password reset) |
| `password_hash` | `varchar(255)` | `NOT NULL` | — | bcrypt hash of password — never plain text |
| `role` | `user_role` | `NOT NULL` | `'Visitor'` | Authorization role: Admin, Receptionist, Security, Visitor |
| `is_active` | `boolean` | `NOT NULL` | `true` | Soft-delete flag; inactive users cannot log in |
| `last_login` | `timestamptz` | — | — | Last successful login timestamp |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Account creation timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Keys
- **Primary Key:** `id`
- **Unique Key:** `uq_users_email` on `email`

### Indexes
- `users_pkey` — B-tree on `id` (auto, PK)
- `users_email_key` — B-tree on `email` (auto, UNIQUE)

### Sample Data
```sql
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('System Admin', 'admin@ecx.et', '$2a$11$...', 'Admin', true);
```

---

## 3. Table: `departments`

### Purpose
Reference table listing all organizational departments. Used as a lookup for employee assignments and visit routing.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique department identifier |
| `name` | `varchar(100)` | `NOT NULL` | — | Department display name (e.g., "Information Technology") |
| `description` | `text` | — | — | Detailed description of department function |
| `location` | `varchar(100)` | — | — | Physical location (building/floor) |
| `phone` | `varchar(20)` | — | — | Department phone contact |
| `email` | `varchar(100)` | — | — | Department email address |
| `is_active` | `boolean` | `NOT NULL` | `true` | Soft-delete; inactive departments hidden from dropdowns |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Keys
- **Primary Key:** `id`

### Relationships
- **One-to-Many:** `departments.id` → `employees.department_id` (a department has many employees)

### Indexes
- `departments_pkey` — B-tree on `id`

---

## 4. Table: `employees`

### Purpose
Stores information about organization employees who can be visited or host visitors. Distinguished from `users` — an employee may or may not have a system login.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique employee identifier |
| `full_name` | `varchar(100)` | `NOT NULL` | — | Employee's full name |
| `phone` | `varchar(20)` | `NOT NULL` | — | Primary contact phone number |
| `email` | `varchar(100)` | `NOT NULL`, `UNIQUE` | — | Work email address |
| `department_id` | `integer` | `NOT NULL`, `FK → departments(id)` | — | Department the employee belongs to |
| `position` | `varchar(100)` | `NOT NULL` | — | Job title (e.g., "IT Manager") |
| `office_number` | `varchar(20)` | — | — | Office/room number |
| `status` | `employee_status` | `NOT NULL` | `'Active'` | Employment status: Active, Inactive, OnLeave |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Keys
- **Primary Key:** `id`
- **Unique Key:** `uq_employees_email` on `email`
- **Foreign Key:** `fk_employee_department` → `departments(id)`

### Relationships
- **Many-to-One:** `employees.department_id` → `departments.id` (each employee belongs to one department)
- **One-to-Many:** `employees.id` → `visits.employee_id` (an employee hosts many visits)
- **One-to-Many:** `employees.id` → `appointments.employee_id` (an employee receives many appointments)
- **One-to-Many:** `employees.id` → `notifications.employee_id` (an employee receives many notifications)
- **One-to-Many:** `employees.id` → `employee_schedules.employee_id` (an employee has many schedule entries)

### Indexes
- `employees_pkey` — B-tree on `id`
- `employees_email_key` — B-tree on `email`
- `idx_employees_department` — B-tree on `department_id`
- `idx_employees_name` — B-tree on `full_name`

---

## 5. Table: `visitors`

### Purpose
Stores information about external visitors who come to the organization. Each visitor is uniquely identified by email and optionally by national ID.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique visitor identifier |
| `full_name` | `varchar(100)` | `NOT NULL` | — | Visitor's full name |
| `phone` | `varchar(20)` | `NOT NULL` | — | Contact phone number |
| `email` | `varchar(100)` | `NOT NULL`, `UNIQUE` | — | Email address (used for notifications) |
| `address` | `text` | `NOT NULL` | — | Physical address |
| `national_id` | `varchar(50)` | `UNIQUE` | — | Government-issued ID number |
| `organization` | `varchar(100)` | — | — | Company or institution the visitor represents |
| `gender` | `varchar(10)` | `CHECK(gender IN ('Male','Female','Other'))` | — | Gender |
| `photo_url` | `text` | — | — | URL to visitor photo (for badge printing) |
| `is_active` | `boolean` | `NOT NULL` | `true` | Soft-delete/blacklist flag |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Registration timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Keys
- **Primary Key:** `id`
- **Unique Key:** `uq_visitors_email` on `email`
- **Unique Key:** `uq_visitors_national_id` on `national_id`

### Relationships
- **One-to-Many:** `visitors.id` → `visits.visitor_id` (a visitor makes many visits)
- **One-to-Many:** `visitors.id` → `appointments.visitor_id` (a visitor makes many appointments)

### Indexes
- `visitors_pkey` — B-tree on `id`
- `uq_visitors_email` — B-tree on `email`
- `uq_visitors_national_id` — B-tree on `national_id`
- `idx_visitors_name` — B-tree on `full_name`

---

## 6. Table: `visits`

### Purpose
Core transactional table tracking the lifecycle of every visitor visit. A visit can originate from a pre-scheduled appointment (walk-in by appointment) or be a walk-in without an appointment. The status field tracks the current stage.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique visit identifier |
| `visitor_id` | `integer` | `NOT NULL`, `FK → visitors(id)` | — | The visitor making the visit |
| `employee_id` | `integer` | `NOT NULL`, `FK → employees(id)` | — | The employee being visited |
| `purpose` | `varchar(500)` | `NOT NULL` | — | Reason for the visit |
| `visit_date` | `date` | `NOT NULL` | `CURRENT_DATE` | Date of the visit |
| `check_in_time` | `timestamptz` | — | — | When the visitor checked in at reception |
| `check_out_time` | `timestamptz` | — | — | When the visitor checked out |
| `status` | `visit_status` | `NOT NULL` | `'Scheduled'` | Current status: Scheduled → CheckedIn → CheckedOut / Cancelled |
| `badge_number` | `varchar(50)` | — | — | Visitor badge/ID card number assigned at check-in |
| `security_officer` | `varchar(100)` | — | — | Security staff who handled the check-in |
| `remark` | `text` | — | — | Internal notes about the visit |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Constraints
- **Check:** `ck_visit_time_order` — `check_out_time > check_in_time` when both are set

### Keys
- **Primary Key:** `id`
- **Foreign Key:** `fk_visit_visitor` → `visitors(id)` ON DELETE RESTRICT
- **Foreign Key:** `fk_visit_employee` → `employees(id)` ON DELETE RESTRICT

### Relationships
- **Many-to-One:** `visits.visitor_id` → `visitors.id`
- **Many-to-One:** `visits.employee_id` → `employees.id`

### Indexes
- `visits_pkey` — B-tree on `id`
- `idx_visits_visitor` — B-tree on `visitor_id`
- `idx_visits_employee` — B-tree on `employee_id`
- `idx_visits_status` — B-tree on `status`
- `idx_visits_date` — B-tree on `visit_date`
- `idx_visits_checkin` — B-tree on `check_in_time`
- `idx_visits_active_today` — B-tree on `(status, check_in_time)` WHERE status = 'CheckedIn'

---

## 7. Table: `appointments`

### Purpose
Stores pre-scheduled appointment requests between visitors and employees. Appointments go through an approval workflow and can optionally convert to visits upon check-in.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique appointment identifier |
| `visitor_id` | `integer` | `NOT NULL`, `FK → visitors(id)` | — | The visitor requesting the appointment |
| `employee_id` | `integer` | `NOT NULL`, `FK → employees(id)` | — | The employee to meet |
| `requested_date` | `date` | `NOT NULL` | — | Desired appointment date |
| `requested_start_time` | `timetz` | `NOT NULL` | — | Desired start time |
| `requested_end_time` | `timetz` | `NOT NULL` | — | Desired end time |
| `purpose` | `varchar(500)` | `NOT NULL` | — | Reason for the appointment |
| `status` | `appointment_status` | `NOT NULL` | `'Pending'` | Approval status |
| `employee_response` | `timestamptz` | — | — | When the employee responded |
| `approval_date` | `timestamptz` | — | — | When the appointment was approved/rejected |
| `reminder_email_sent` | `boolean` | `NOT NULL` | `false` | Whether reminder email was sent |
| `reminder_sms_sent` | `boolean` | `NOT NULL` | `false` | Whether reminder SMS was sent |
| `visitor_confirmed` | `boolean` | `NOT NULL` | `false` | Whether visitor confirmed attendance |
| `check_in_allowed` | `boolean` | `NOT NULL` | `false` | Whether visitor can check in (allowed after approval) |
| `appointment_code` | `varchar(20)` | — | — | Unique code for visitor reference |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Constraints
- **Check:** `ck_appointment_time_order` — `requested_end_time > requested_start_time`

### Keys
- **Primary Key:** `id`
- **Foreign Key:** `fk_appointment_visitor` → `visitors(id)` ON DELETE RESTRICT
- **Foreign Key:** `fk_appointment_employee` → `employees(id)` ON DELETE RESTRICT

### Indexes
- `appointments_pkey` — B-tree on `id`
- `idx_appointments_visitor` — B-tree on `visitor_id`
- `idx_appointments_employee` — B-tree on `employee_id`
- `idx_appointments_date` — B-tree on `requested_date`
- `idx_appointments_status` — B-tree on `status`

---

## 8. Table: `notifications`

### Purpose
Stores system-generated notifications sent to employees about visit events, appointment reminders, and system alerts.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique notification identifier |
| `employee_id` | `integer` | `NOT NULL`, `FK → employees(id)` | — | Recipient employee |
| `appointment_id` | `integer` | `FK → appointments(id)` | — | Related appointment (nullable for system notifications) |
| `title` | `varchar(200)` | `NOT NULL` | — | Short notification title |
| `message` | `text` | `NOT NULL` | — | Full notification message body |
| `notification_type` | `notification_type` | `NOT NULL` | `'Info'` | Category: Info, Warning, Reminder, Alert |
| `priority` | `notification_priority` | `NOT NULL` | `'Normal'` | Urgency: Low, Normal, High, Urgent |
| `is_read` | `boolean` | `NOT NULL` | `false` | Read status |
| `read_at` | `timestamptz` | — | — | When the notification was read |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Notification creation timestamp |

### Keys
- **Primary Key:** `id`
- **Foreign Key:** `fk_notification_employee` → `employees(id)` ON DELETE CASCADE
- **Foreign Key:** `fk_notification_appointment` → `appointments(id)` ON DELETE SET NULL

### Indexes
- `notifications_pkey` — B-tree on `id`
- `idx_notifications_employee` — B-tree on `employee_id`
- `idx_notifications_unread` — B-tree on `employee_id` WHERE `is_read = false`
- `idx_notifications_created` — B-tree on `created_at`

---

## 9. Table: `audit_logs`

### Purpose
Immutable audit trail recording all data-changing operations for compliance and security. Stores before/after snapshots as JSON for any entity in the system.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique audit log identifier |
| `user_id` | `integer` | `NOT NULL`, `FK → users(id)` | — | The user who performed the action |
| `action` | `varchar(100)` | `NOT NULL` | — | Action performed (e.g., CREATE, UPDATE, DELETE, LOGIN) |
| `entity_name` | `varchar(100)` | `NOT NULL` | — | Table/entity name affected |
| `entity_id` | `integer` | `NOT NULL` | — | Primary key of the affected record |
| `old_values` | `jsonb` | — | — | Snapshot of row before the change |
| `new_values` | `jsonb` | — | — | Snapshot of row after the change |
| `ip_address` | `varchar(45)` | — | — | Client IP address (supports IPv6) |
| `user_agent` | `text` | — | — | Browser/client user agent string |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | When the action occurred |

### Keys
- **Primary Key:** `id`
- **Foreign Key:** `fk_audit_log_user` → `users(id)` ON DELETE RESTRICT

### Indexes
- `audit_logs_pkey` — B-tree on `id`
- `idx_audit_logs_user` — B-tree on `user_id`
- `idx_audit_logs_entity` — B-tree on `(entity_name, entity_id)`
- `idx_audit_logs_date` — B-tree on `created_at`

---

## 10. Table: `employee_schedules`

### Purpose
Defines weekly availability windows for each employee. Each row represents one day's schedule. The UNIQUE constraint on `(employee_id, day_of_week)` ensures one schedule per employee per day.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique schedule identifier |
| `employee_id` | `integer` | `NOT NULL`, `FK → employees(id)` | — | The employee this schedule belongs to |
| `day_of_week` | `varchar(9)` | `NOT NULL`, `CHECK` | — | Day name: Monday through Sunday |
| `start_time` | `time` | `NOT NULL` | — | Work shift start time |
| `end_time` | `time` | `NOT NULL` | — | Work shift end time |
| `break_start` | `time` | — | — | Break period start (null = no break) |
| `break_end` | `time` | — | — | Break period end (null = no break) |
| `is_available` | `boolean` | `NOT NULL` | `true` | Whether the employee accepts visits on this day |
| `max_appointments` | `integer` | `NOT NULL`, `CHECK > 0` | `10` | Maximum appointments allowed for this day |
| `notes` | `text` | — | — | Notes about the schedule (e.g., "Early leave") |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | — | — | Last update timestamp |

### Constraints
- **Check:** `ck_day_of_week` — day name must be valid
- **Check:** `ck_max_appointments` — must be > 0
- **Check:** `ck_schedule_time_order` — `end_time > start_time`
- **Unique:** `uq_schedule_per_day` — `(employee_id, day_of_week)`

### Keys
- **Primary Key:** `id`
- **Unique Key:** `uq_schedule_per_day` on `(employee_id, day_of_week)`
- **Foreign Key:** `fk_schedule_employee` → `employees(id)` ON DELETE CASCADE

### Indexes
- `employee_schedules_pkey` — B-tree on `id`

---

## 11. Table: `email_queue`

### Purpose
Asynchronous queue for outbound email notifications. Background workers pick up pending emails and send them, updating the status on completion or failure.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique queue entry identifier |
| `appointment_id` | `integer` | `FK → appointments(id)` | — | Related appointment (null if system email) |
| `recipient_email` | `varchar(255)` | `NOT NULL` | — | Target email address |
| `subject` | `varchar(255)` | `NOT NULL` | — | Email subject line |
| `body` | `text` | `NOT NULL` | — | Email body (HTML or plain text) |
| `status` | `queue_status` | `NOT NULL` | `'Pending'` | Delivery status: Pending, Sent, Failed, Cancelled |
| `retry_count` | `integer` | `NOT NULL`, `CHECK(0-10)` | `0` | Number of send attempts |
| `sent_at` | `timestamptz` | — | — | When the email was successfully sent |
| `error_message` | `text` | — | — | Error details if sending failed |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Queue entry creation timestamp |

### Keys
- **Primary Key:** `id`
- **Foreign Key:** `fk_email_appointment` → `appointments(id)` ON DELETE SET NULL

### Indexes
- `email_queue_pkey` — B-tree on `id`
- `idx_email_pending` — B-tree on `created_at` WHERE `status = 'Pending'`

---

## 12. Table: `sms_queue`

### Purpose
Asynchronous queue for outbound SMS notifications (e.g., appointment reminders). Same pattern as `email_queue` but for SMS.

### Columns

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `integer` | `PK GENERATED ALWAYS AS IDENTITY` | auto | Unique queue entry identifier |
| `appointment_id` | `integer` | `FK → appointments(id)` | — | Related appointment |
| `recipient_phone` | `varchar(20)` | `NOT NULL` | — | Target phone number |
| `message` | `text` | `NOT NULL` | — | SMS message body |
| `status` | `queue_status` | `NOT NULL` | `'Pending'` | Delivery status |
| `retry_count` | `integer` | `NOT NULL`, `CHECK(0-10)` | `0` | Number of send attempts |
| `sent_at` | `timestamptz` | — | — | When the SMS was sent |
| `error_message` | `text` | — | — | Error details if sending failed |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Queue entry creation timestamp |

### Keys
- **Primary Key:** `id`
- **Foreign Key:** `fk_sms_appointment` → `appointments(id)` ON DELETE SET NULL

### Indexes
- `sms_queue_pkey` — B-tree on `id`
- `idx_sms_pending` — B-tree on `created_at` WHERE `status = 'Pending'`

---

## 13. Enums

### `user_role`
| Value | Description |
|-------|-------------|
| `Admin` | Full system access, user management, configuration |
| `Receptionist` | Can register visitors, check in/out, view visits |
| `Security` | Can view and manage check-in/check-out |
| `Visitor` | Self-service registration, can book appointments |

### `employee_status`
| Value | Description |
|-------|-------------|
| `Active` | Currently employed and accepting visits |
| `Inactive` | No longer employed, or on extended leave |
| `OnLeave` | Temporarily unavailable for visits |

### `visit_status`
| Value | Description | Next Status |
|-------|-------------|-------------|
| `Scheduled` | Created but not yet checked in | CheckedIn / Cancelled |
| `CheckedIn` | Visitor is on premises | CheckedOut |
| `CheckedOut` | Visit completed | (terminal) |
| `Cancelled` | Visit was cancelled | (terminal) |

### `appointment_status`
| Value | Description |
|-------|-------------|
| `Pending` | Awaiting employee approval |
| `Approved` | Approved by employee, check-in allowed |
| `Rejected` | Declined by employee |
| `Cancelled` | Cancelled by visitor or system |
| `Completed` | Visit was completed (converted to visit record) |

### `notification_type`
| Value | Description |
|-------|-------------|
| `Info` | General information |
| `Warning` | Potential issue requiring attention |
| `Reminder` | Scheduled reminder (appointment, etc.) |
| `Alert` | Urgent notification requiring immediate action |

### `notification_priority`
| Value | Description |
|-------|-------------|
| `Low` | Informational, no action needed |
| `Normal` | Standard priority (default) |
| `High` | Important, should be read soon |
| `Urgent` | Immediate attention required |

### `queue_status`
| Value | Description |
|-------|-------------|
| `Pending` | Awaiting processing |
| `Sent` | Successfully delivered |
| `Failed` | Delivery failed after retries |
| `Cancelled` | Cancelled before delivery |

---

## 14. Relationships Matrix

| Parent | Child | FK Column | Type | ON DELETE |
|--------|-------|-----------|------|-----------|
| `departments` | `employees` | `department_id` | One-to-Many | — (RESTRICT is default) |
| `employees` | `visits` | `employee_id` | One-to-Many | RESTRICT |
| `employees` | `appointments` | `employee_id` | One-to-Many | RESTRICT |
| `employees` | `notifications` | `employee_id` | One-to-Many | CASCADE |
| `employees` | `employee_schedules` | `employee_id` | One-to-Many | CASCADE |
| `visitors` | `visits` | `visitor_id` | One-to-Many | RESTRICT |
| `visitors` | `appointments` | `visitor_id` | One-to-Many | RESTRICT |
| `appointments` | `notifications` | `appointment_id` | One-to-Many | SET NULL |
| `appointments` | `email_queue` | `appointment_id` | One-to-Many | SET NULL |
| `appointments` | `sms_queue` | `appointment_id` | One-to-Many | SET NULL |
| `users` | `audit_logs` | `user_id` | One-to-Many | RESTRICT |

---

## 15. Constraint Summary

| Type | Count |
|------|-------|
| PRIMARY KEY | 11 |
| FOREIGN KEY | 10 |
| UNIQUE | 5 |
| CHECK | 7 |
| NOT NULL | 48 (estimated) |

### Key Design Decisions

1. **ON DELETE RESTRICT** for critical business data (visits, appointments): prevents accidental deletion of visitors or employees who have history.

2. **ON DELETE CASCADE** for dependent data (notifications, schedules): if an employee is removed, their notifications and schedules go with them.

3. **ON DELETE SET NULL** for queue tables (email, SMS): if an appointment is deleted, queue entries remain for logging but lose the FK reference.

4. **ALLOW NULL for check_out_time**: a visit that is in progress has no checkout time yet.

5. **CHECK constraint on visit time order**: prevents data-entry errors where checkout is before check-in.

---

## 16. Index Summary

| Index | Table | Type | Purpose |
|-------|-------|------|---------|
| `idx_visits_visitor` | visits | B-tree | Lookup visits by visitor |
| `idx_visits_employee` | visits | B-tree | Lookup visits by employee |
| `idx_visits_status` | visits | B-tree | Filter by status (dashboard) |
| `idx_visits_date` | visits | B-tree | Date range queries |
| `idx_visits_checkin` | visits | B-tree | Check-in time queries |
| `idx_visits_active_today` | visits | Partial B-tree | Active visits only (dashboard) |
| `idx_employees_department` | employees | B-tree | Employees by department |
| `idx_employees_name` | employees | B-tree | Employee name search |
| `idx_visitors_name` | visitors | B-tree | Visitor name search |
| `idx_appointments_visitor` | appointments | B-tree | Appointments by visitor |
| `idx_appointments_employee` | appointments | B-tree | Appointments by employee |
| `idx_appointments_date` | appointments | B-tree | Daily appointments |
| `idx_appointments_status` | appointments | B-tree | Pending/approved filtering |
| `idx_notifications_employee` | notifications | B-tree | Notifications by employee |
| `idx_notifications_unread` | notifications | Partial B-tree | Unread notifications only |
| `idx_notifications_created` | notifications | B-tree | Recent notifications |
| `idx_audit_logs_user` | audit_logs | B-tree | Audit trail by user |
| `idx_audit_logs_entity` | audit_logs | B-tree | Audit trail by entity |
| `idx_audit_logs_date` | audit_logs | B-tree | Audit trail by date |
| `idx_email_pending` | email_queue | Partial B-tree | Pending email processing |
| `idx_sms_pending` | sms_queue | Partial B-tree | Pending SMS processing |

**Total indexes: 21** (including 3 partial/filtered indexes for queue processing)
