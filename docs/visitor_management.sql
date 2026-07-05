-- =============================================================================
-- ECX Visitor Management System — Database Schema
-- PostgreSQL 15+
-- Naming: snake_case, unquoted identifiers
-- =============================================================================

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM (
    'Admin',
    'Receptionist',
    'Security',
    'Visitor'
);

CREATE TYPE employee_status AS ENUM (
    'Active',
    'Inactive',
    'OnLeave'
);

CREATE TYPE visit_status AS ENUM (
    'Scheduled',
    'CheckedIn',
    'CheckedOut',
    'Cancelled'
);

CREATE TYPE appointment_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled',
    'Completed'
);

CREATE TYPE notification_type AS ENUM (
    'Info',
    'Warning',
    'Reminder',
    'Alert'
);

CREATE TYPE notification_priority AS ENUM (
    'Low',
    'Normal',
    'High',
    'Urgent'
);

CREATE TYPE queue_status AS ENUM (
    'Pending',
    'Sent',
    'Failed',
    'Cancelled'
);

-- =============================================================================
-- TABLE: users
-- System user accounts (login, auth, roles).
-- Employees and visitors are separate entities; a user may or may not map to
-- an employee record.
-- =============================================================================

CREATE TABLE users (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL        DEFAULT 'Visitor',
    is_active       BOOLEAN         NOT NULL        DEFAULT true,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE  users              IS 'System user accounts for authentication and authorization';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash — never plain text';
COMMENT ON COLUMN users.is_active     IS 'Soft-delete; inactive users cannot log in';

-- =============================================================================
-- TABLE: departments
-- Organizational departments for employee assignment and visit routing.
-- =============================================================================

CREATE TABLE departments (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    location        VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(100),
    is_active       BOOLEAN         NOT NULL        DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_departments PRIMARY KEY (id)
);

COMMENT ON TABLE departments IS 'Lookup table for organizational departments';

-- =============================================================================
-- TABLE: employees
-- Staff members who host visitors. Distinct from system users.
-- =============================================================================

CREATE TABLE employees (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    full_name       VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    department_id   INTEGER         NOT NULL,
    position        VARCHAR(100)    NOT NULL,
    office_number   VARCHAR(20),
    status          employee_status NOT NULL        DEFAULT 'Active',
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_employees PRIMARY KEY (id),
    CONSTRAINT uq_employees_email UNIQUE (email),
    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
);

COMMENT ON TABLE employees IS 'Organization employees who host visitors';

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_name       ON employees(full_name);

-- =============================================================================
-- TABLE: visitors
-- External visitors who come to the organization.
-- =============================================================================

CREATE TABLE visitors (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    full_name       VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    address         TEXT            NOT NULL,
    national_id     VARCHAR(50),
    organization    VARCHAR(100),
    gender          VARCHAR(10),
    photo_url       TEXT,
    is_active       BOOLEAN         NOT NULL        DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_visitors PRIMARY KEY (id),
    CONSTRAINT uq_visitors_email UNIQUE (email),
    CONSTRAINT uq_visitors_national_id UNIQUE (national_id),
    CONSTRAINT ck_visitors_gender
        CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other'))
);

COMMENT ON TABLE  visitors             IS 'External visitors';
COMMENT ON COLUMN visitors.photo_url   IS 'URL for badge photo';
COMMENT ON COLUMN visitors.is_active   IS 'Soft-delete or blacklist flag';

CREATE INDEX idx_visitors_name ON visitors(full_name);

-- =============================================================================
-- TABLE: visits
-- Core transactional table — the lifecycle of every visit.
-- =============================================================================

CREATE TABLE visits (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    visitor_id      INTEGER         NOT NULL,
    employee_id     INTEGER         NOT NULL,
    purpose         VARCHAR(500)    NOT NULL,
    visit_date      DATE            NOT NULL        DEFAULT CURRENT_DATE,
    check_in_time   TIMESTAMPTZ,
    check_out_time  TIMESTAMPTZ,
    status          visit_status    NOT NULL        DEFAULT 'Scheduled',
    badge_number    VARCHAR(50),
    security_officer VARCHAR(100),
    remark          TEXT,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_visits PRIMARY KEY (id),
    CONSTRAINT fk_visit_visitor
        FOREIGN KEY (visitor_id) REFERENCES visitors(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_visit_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE RESTRICT,
    CONSTRAINT ck_visit_time_order
        CHECK (check_out_time IS NULL OR check_in_time IS NULL
               OR check_out_time > check_in_time)
);

COMMENT ON TABLE  visits                IS 'Visit lifecycle records';
COMMENT ON COLUMN visits.badge_number    IS 'Badge/temp ID assigned at check-in';
COMMENT ON COLUMN visits.security_officer IS 'Staff who handled check-in';

CREATE INDEX idx_visits_visitor      ON visits(visitor_id);
CREATE INDEX idx_visits_employee     ON visits(employee_id);
CREATE INDEX idx_visits_status       ON visits(status);
CREATE INDEX idx_visits_date         ON visits(visit_date);
CREATE INDEX idx_visits_checkin      ON visits(check_in_time);
CREATE INDEX idx_visits_active_today ON visits(status, check_in_time)
    WHERE status = 'CheckedIn';

-- =============================================================================
-- TABLE: appointments
-- Pre-scheduled meeting requests between visitors and employees.
-- =============================================================================

CREATE TABLE appointments (
    id                  INTEGER             GENERATED ALWAYS AS IDENTITY,
    visitor_id          INTEGER             NOT NULL,
    employee_id         INTEGER             NOT NULL,
    requested_date      DATE                NOT NULL,
    requested_start_time TIME WITH TIME ZONE NOT NULL,
    requested_end_time   TIME WITH TIME ZONE NOT NULL,
    purpose             VARCHAR(500)        NOT NULL,
    status              appointment_status  NOT NULL    DEFAULT 'Pending',
    employee_response   TIMESTAMPTZ,
    approval_date       TIMESTAMPTZ,
    reminder_email_sent BOOLEAN             NOT NULL    DEFAULT false,
    reminder_sms_sent   BOOLEAN             NOT NULL    DEFAULT false,
    visitor_confirmed   BOOLEAN             NOT NULL    DEFAULT false,
    check_in_allowed    BOOLEAN             NOT NULL    DEFAULT false,
    appointment_code    VARCHAR(20),
    created_at          TIMESTAMPTZ         NOT NULL    DEFAULT now(),
    updated_at          TIMESTAMPTZ,

    CONSTRAINT pk_appointments PRIMARY KEY (id),
    CONSTRAINT fk_appointment_visitor
        FOREIGN KEY (visitor_id) REFERENCES visitors(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE RESTRICT,
    CONSTRAINT ck_appointment_time_order
        CHECK (requested_end_time > requested_start_time)
);

COMMENT ON TABLE  appointments               IS 'Pre-scheduled appointment requests';
COMMENT ON COLUMN appointments.check_in_allowed IS 'True once employee approves';

CREATE INDEX idx_appointments_visitor  ON appointments(visitor_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_date     ON appointments(requested_date);
CREATE INDEX idx_appointments_status   ON appointments(status);

-- =============================================================================
-- TABLE: notifications
-- System-generated alerts sent to employees.
-- =============================================================================

CREATE TABLE notifications (
    id                  INTEGER             GENERATED ALWAYS AS IDENTITY,
    employee_id         INTEGER             NOT NULL,
    appointment_id      INTEGER,
    title               VARCHAR(200)        NOT NULL,
    message             TEXT                NOT NULL,
    notification_type   notification_type   NOT NULL    DEFAULT 'Info',
    priority            notification_priority NOT NULL  DEFAULT 'Normal',
    is_read             BOOLEAN             NOT NULL    DEFAULT false,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ         NOT NULL    DEFAULT now(),

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notification_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notification_appointment
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        ON DELETE SET NULL
);

COMMENT ON TABLE notifications IS 'Employee alerts about visits and appointments';

CREATE INDEX idx_notifications_employee  ON notifications(employee_id);
CREATE INDEX idx_notifications_unread    ON notifications(employee_id)
    WHERE is_read = false;
CREATE INDEX idx_notifications_created   ON notifications(created_at);

-- =============================================================================
-- TABLE: audit_logs
-- Immutable audit trail for compliance and security.
-- =============================================================================

CREATE TABLE audit_logs (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    user_id         INTEGER         NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    entity_name     VARCHAR(100)    NOT NULL,
    entity_id       INTEGER         NOT NULL,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),

    CONSTRAINT pk_audit_logs PRIMARY KEY (id),
    CONSTRAINT fk_audit_log_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE  audit_logs           IS 'Immutable audit trail of data changes';
COMMENT ON COLUMN audit_logs.old_values IS 'Snapshot of row before change (JSON)';
COMMENT ON COLUMN audit_logs.new_values IS 'Snapshot of row after change (JSON)';
COMMENT ON COLUMN audit_logs.user_agent IS 'Client user agent string';

CREATE INDEX idx_audit_logs_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_date   ON audit_logs(created_at);

-- =============================================================================
-- TABLE: employee_schedules
-- Weekly availability windows per employee.
-- =============================================================================

CREATE TABLE employee_schedules (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    employee_id     INTEGER         NOT NULL,
    day_of_week     VARCHAR(9)      NOT NULL,
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    break_start     TIME,
    break_end       TIME,
    is_available    BOOLEAN         NOT NULL        DEFAULT true,
    max_appointments INTEGER       NOT NULL        DEFAULT 10,
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_employee_schedules PRIMARY KEY (id),
    CONSTRAINT fk_schedule_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_schedule_per_day
        UNIQUE (employee_id, day_of_week),
    CONSTRAINT ck_day_of_week
        CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday',
                               'Friday','Saturday','Sunday')),
    CONSTRAINT ck_schedule_time_order
        CHECK (end_time > start_time),
    CONSTRAINT ck_max_appointments_positive
        CHECK (max_appointments > 0),
    CONSTRAINT ck_break_time_order
        CHECK (break_start IS NULL OR break_end IS NULL OR break_end > break_start)
);

COMMENT ON TABLE  employee_schedules                IS 'Weekly availability per employee';
COMMENT ON COLUMN employee_schedules.max_appointments IS 'Max appointments for this day';

-- =============================================================================
-- TABLE: email_queue
-- Asynchronous outbound email queue.
-- =============================================================================

CREATE TABLE email_queue (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    appointment_id  INTEGER,
    recipient_email VARCHAR(255)    NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    body            TEXT            NOT NULL,
    status          queue_status    NOT NULL        DEFAULT 'Pending',
    retry_count     INTEGER         NOT NULL        DEFAULT 0,
    sent_at         TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),

    CONSTRAINT pk_email_queue PRIMARY KEY (id),
    CONSTRAINT fk_email_appointment
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        ON DELETE SET NULL,
    CONSTRAINT ck_email_retry_count
        CHECK (retry_count >= 0 AND retry_count <= 10)
);

COMMENT ON TABLE email_queue IS 'Outbound email notification queue';

CREATE INDEX idx_email_pending ON email_queue(created_at)
    WHERE status = 'Pending';

-- =============================================================================
-- TABLE: sms_queue
-- Asynchronous outbound SMS queue.
-- =============================================================================

CREATE TABLE sms_queue (
    id              INTEGER         GENERATED ALWAYS AS IDENTITY,
    appointment_id  INTEGER,
    recipient_phone VARCHAR(20)     NOT NULL,
    message         TEXT            NOT NULL,
    status          queue_status    NOT NULL        DEFAULT 'Pending',
    retry_count     INTEGER         NOT NULL        DEFAULT 0,
    sent_at         TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ     NOT NULL        DEFAULT now(),

    CONSTRAINT pk_sms_queue PRIMARY KEY (id),
    CONSTRAINT fk_sms_appointment
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        ON DELETE SET NULL,
    CONSTRAINT ck_sms_retry_count
        CHECK (retry_count >= 0 AND retry_count <= 10)
);

COMMENT ON TABLE sms_queue IS 'Outbound SMS notification queue';

CREATE INDEX idx_sms_pending ON sms_queue(created_at)
    WHERE status = 'Pending';

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Departments
INSERT INTO departments (name, description, location, phone, email) VALUES
    ('Information Technology',    'IT infrastructure, software, and support',     'Building A, 3rd Floor',     '011-111-1001', 'it@ecx.et'),
    ('Human Resources',           'Employee relations, hiring, and payroll',      'Building A, 2nd Floor',     '011-111-1002', 'hr@ecx.et'),
    ('Finance',                   'Accounting, budgeting, and financial planning', 'Building B, 1st Floor',     '011-111-1003', 'finance@ecx.et'),
    ('Operations',                'Day-to-day business operations',                'Building B, 2nd Floor',     '011-111-1004', 'ops@ecx.et'),
    ('Security',                  'Physical and digital security',                 'Building A, Ground Floor',  '011-111-1005', 'security@ecx.et'),
    ('Administration',            'Executive and administrative support',          'Building A, 4th Floor',     '011-111-1006', 'admin@ecx.et'),
    ('Legal',                     'Legal affairs and compliance',                  'Building B, 3rd Floor',     '011-111-1007', 'legal@ecx.et'),
    ('Marketing',                 'Brand, communications, and public relations',   'Building B, 4th Floor',     '011-111-1008', 'marketing@ecx.et'),
    ('Research & Development',    'Innovation and product development',            'Building C, 2nd Floor',     '011-111-1009', 'randd@ecx.et'),
    ('Customer Service',          'Client support and relationship management',    'Building C, Ground Floor',  '011-111-1010', 'cs@ecx.et');

-- Employees (10, one per department)
INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status) VALUES
    ('Abebe Kebede',    '+251-911-100001', 'abebe.kebede@ecx.et',   1, 'IT Manager',           'A301', 'Active'),
    ('Birtukan Lemma',  '+251-911-100002', 'birtukan.lemma@ecx.et', 2, 'HR Manager',           'A201', 'Active'),
    ('Chala Tadesse',   '+251-911-100003', 'chala.tadesse@ecx.et',  3, 'Finance Manager',      'B101', 'Active'),
    ('Desta Hailu',     '+251-911-100004', 'desta.hailu@ecx.et',    4, 'Operations Manager',   'B201', 'Active'),
    ('Eleni Mamo',      '+251-911-100005', 'eleni.mamo@ecx.et',     5, 'Security Manager',     'A101', 'Active'),
    ('Fikru Alemu',     '+251-911-100006', 'fikru.alemu@ecx.et',    6, 'Admin Manager',        'A401', 'Active'),
    ('Genet Tesfaye',   '+251-911-100007', 'genet.tesfaye@ecx.et',  7, 'Legal Counsel',        'B301', 'Active'),
    ('Hailu Girma',     '+251-911-100008', 'hailu.girma@ecx.et',    8, 'Marketing Manager',    'B401', 'Active'),
    ('Idil Omar',       '+251-911-100009', 'idil.omar@ecx.et',      9, 'R&D Manager',          'C201', 'Active'),
    ('Jemal Hussein',   '+251-911-100010', 'jemal.hussein@ecx.et', 10, 'Customer Service Lead','C101', 'Active');

-- Users (admin, receptionist, security officer)
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('Abebe Kebede',  'abebe.kebede@ecx.et',  '$2a$11$K4YfGqJ1e4YHIpEq3Yw7NOx0x0x0x0x0x0x0x0x0x0x0x0x0', 'Admin',         true),
    ('Sara Wondimu',  'sara.wondimu@ecx.et',  '$2a$11$K4YfGqJ1e4YHIpEq3Yw7NOx0x0x0x0x0x0x0x0x0x0x0x0x0', 'Receptionist',  true),
    ('Tsegaye Berhan','tsegaye.berhan@ecx.et','$2a$11$K4YfGqJ1e4YHIpEq3Yw7NOx0x0x0x0x0x0x0x0x0x0x0x0x0', 'Security',      true);

-- Visitors (5 unique)
INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender) VALUES
    ('Kebede Assefa',     '+251-922-200001', 'kebede.assefa@gmail.com',    'Addis Ababa, Bole Subcity',      'ET-1234567', 'ABC Trading',   'Male'),
    ('Meron Bekele',      '+251-922-200002', 'meron.bekele@yahoo.com',     'Addis Ababa, Kazanchis',          'ET-2345678', 'XYZ Consulting', 'Female'),
    ('Nebiyu Girma',      '+251-922-200003', 'nebiyu.girma@outlook.com',   'Addis Ababa, CMC Area',           'ET-3456789', 'Tech Solutions','Male'),
    ('Tsion Hailemariam', '+251-922-200004', 'tsion.hai@gmail.com',        'Addis Ababa, Summit',             'ET-4567890', 'Green Energy',  'Female'),
    ('Yonas Ayele',       '+251-922-200005', 'yonas.ayele@ethionet.et',    'Addis Ababa, Mexico Square',      'ET-5678901', NULL,             'Male');

-- Employee schedules (Mon–Fri for all 10 employees)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, max_appointments)
SELECT e.id, d.day, d.start, d.end, 10
FROM employees e
CROSS JOIN (VALUES
    ('Monday',    '08:00'::TIME, '17:00'::TIME),
    ('Tuesday',   '08:00'::TIME, '17:00'::TIME),
    ('Wednesday', '08:00'::TIME, '17:00'::TIME),
    ('Thursday',  '08:00'::TIME, '17:00'::TIME),
    ('Friday',    '08:00'::TIME, '13:00'::TIME)
) AS d(day, start, end);

-- Appointments (2 pending, 2 approved, 1 rejected, 1 completed)
INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status) VALUES
    (1, 1, CURRENT_DATE + 1, '09:00+03:00'::TIMETZ, '10:00+03:00'::TIMETZ, 'Software vendor demo',                    'Pending'),
    (2, 2, CURRENT_DATE + 1, '14:00+03:00'::TIMETZ, '15:30+03:00'::TIMETZ, 'Job interview follow-up',               'Pending'),
    (3, 5, CURRENT_DATE,     '10:00+03:00'::TIMETZ, '11:00+03:00'::TIMETZ, 'Security system upgrade proposal',      'Approved'),
    (4, 6, CURRENT_DATE,     '11:00+03:00'::TIMETZ, '12:00+03:00'::TIMETZ, 'Partnership discussion',               'Approved'),
    (5, 3, CURRENT_DATE,     '15:00+03:00'::TIMETZ, '16:00+03:00'::TIMETZ, 'Audit preparation meeting',            'Rejected'),
    (1, 4, CURRENT_DATE - 1, '09:00+03:00'::TIMETZ, '11:00+03:00'::TIMETZ, 'Supply chain review',                  'Completed');

-- Visits (linked to appointments where status is Approved or Completed)
INSERT INTO visits (visitor_id, employee_id, purpose, visit_date, check_in_time, check_out_time, status, badge_number, security_officer) VALUES
    (3, 5, 'Security system upgrade proposal',  CURRENT_DATE,     '10:05+03:00'::TIMESTAMPTZ, NULL,                              'CheckedIn', 'B-001', 'Tsegaye Berhan'),
    (4, 6, 'Partnership discussion',            CURRENT_DATE,     '11:10+03:00'::TIMESTAMPTZ, NULL,                              'CheckedIn', 'B-002', 'Tsegaye Berhan'),
    (1, 4, 'Supply chain review',               CURRENT_DATE - 1, '09:00+03:00'::TIMESTAMPTZ, '10:55+03:00'::TIMESTAMPTZ, 'CheckedOut','B-003', 'Eleni Mamo');

-- Notifications
INSERT INTO notifications (employee_id, appointment_id, title, message, notification_type, priority) VALUES
    (1, 1, 'New Appointment Request', 'Visitor Kebede Assefa has requested a meeting on software vendor demo.', 'Info', 'Normal'),
    (2, 2, 'New Appointment Request', 'Visitor Meron Bekele has requested a job interview follow-up.',          'Info', 'Normal'),
    (5, 3, 'Appointment Approved',    'Your meeting with Nebiyu Girma has been confirmed for today at 10:00.',  'Reminder', 'High'),
    (6, 4, 'Appointment Approved',    'Your meeting with Tsion Hailemariam has been confirmed for today at 11:00.','Reminder', 'High');

-- Audit log (sample)
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, old_values, new_values, ip_address) VALUES
    (1, 'CREATE', 'appointments', 1, NULL,
     '{"visitor_id":1,"employee_id":1,"purpose":"Software vendor demo","status":"Pending"}'::JSONB,
     '192.168.1.100');

-- Email queue (pending reminders for tomorrow's appointments)
INSERT INTO email_queue (appointment_id, recipient_email, subject, body, status) VALUES
    (1, 'kebede.assefa@gmail.com',    'Appointment Reminder: Software Vendor Demo',
     'Dear Kebede, this is a reminder of your appointment tomorrow at 09:00 with Abebe Kebede.', 'Pending'),
    (2, 'meron.bekele@yahoo.com',     'Appointment Reminder: Job Interview Follow-up',
     'Dear Meron, this is a reminder of your appointment tomorrow at 14:00 with Birtukan Lemma.', 'Pending');

-- SMS queue
INSERT INTO sms_queue (appointment_id, recipient_phone, message, status) VALUES
    (1, '+251-922-200001', 'Reminder: Appointment with Abebe Kebede tomorrow at 09:00.', 'Pending'),
    (2, '+251-922-200002', 'Reminder: Appointment with Birtukan Lemma tomorrow at 14:00.', 'Pending');
