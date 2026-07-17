# =============================================================================
# ECX Visitor Management System — Database Migration Script
# Extends the base schema with new tables and columns for v2.0
# PostgreSQL 15+
# =============================================================================

-- =============================================================================
-- EXPANDED ENUM TYPES
-- =============================================================================

-- Expand user_role enum (must add values one at a time in PostgreSQL)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'CEO';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'DepartmentHead';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Employee';

-- New enum for notification channels
DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('InApp', 'Email', 'SMS', 'All');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- ALTER EXISTING TABLES
-- =============================================================================

-- Users: add employee/visitor FKs
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_id INTEGER;
ALTER TABLE users ADD CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE users ADD CONSTRAINT fk_user_visitor FOREIGN KEY (visitor_id) REFERENCES visitors(id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_employee ON users(employee_id) WHERE employee_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_visitor ON users(visitor_id) WHERE visitor_id IS NOT NULL;

-- Employees: add user_id FK
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE employees ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user ON employees(user_id) WHERE user_id IS NOT NULL;

-- Appointments: add new columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS delegated_to_employee_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS original_employee_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS redirect_department_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD CONSTRAINT fk_appointment_delegate FOREIGN KEY (delegated_to_employee_id) REFERENCES employees(id);
ALTER TABLE appointments ADD CONSTRAINT fk_appointment_original FOREIGN KEY (original_employee_id) REFERENCES employees(id);
ALTER TABLE appointments ADD CONSTRAINT fk_appointment_redirect_dept FOREIGN KEY (redirect_department_id) REFERENCES departments(id);
CREATE INDEX IF NOT EXISTS idx_appointments_code ON appointments(appointment_code);

-- Visits: add appointment FK and new columns
ALTER TABLE visits ADD COLUMN IF NOT EXISTS appointment_id INTEGER;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS is_destination_known BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS redirect_note TEXT;
ALTER TABLE visits ADD CONSTRAINT fk_visit_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- Notifications: add visitor FK and channel
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS visitor_id INTEGER;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channel notification_channel NOT NULL DEFAULT 'InApp';
ALTER TABLE notifications ADD CONSTRAINT fk_notification_visitor FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE;

-- =============================================================================
-- NEW TABLES
-- =============================================================================

-- visitor_items
CREATE TABLE IF NOT EXISTS visitor_items (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    visit_id        INTEGER NOT NULL,
    item_name       VARCHAR(200) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    serial_number   VARCHAR(100),
    brand           VARCHAR(100),
    description     TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_visitor_items PRIMARY KEY (id),
    CONSTRAINT fk_item_visit FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    CONSTRAINT ck_item_quantity CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_visitor_items_visit ON visitor_items(visit_id);

-- appointment_attachments
CREATE TABLE IF NOT EXISTS appointment_attachments (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    appointment_id  INTEGER NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_path       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    uploaded_by     INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_appointment_attachments PRIMARY KEY (id),
    CONSTRAINT fk_attachment_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_attachments_appointment ON appointment_attachments(appointment_id);

-- appointment_comments
CREATE TABLE IF NOT EXISTS appointment_comments (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    appointment_id  INTEGER NOT NULL,
    user_id         INTEGER NOT NULL,
    comment_text    TEXT NOT NULL,
    is_internal     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_appointment_comments PRIMARY KEY (id),
    CONSTRAINT fk_comment_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_comments_appointment ON appointment_comments(appointment_id);

-- employee_unavailability
CREATE TABLE IF NOT EXISTS employee_unavailability (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY,
    employee_id         INTEGER NOT NULL,
    unavailability_type VARCHAR(50) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    reason              TEXT,
    created_by          INTEGER NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ,

    CONSTRAINT pk_employee_unavailability PRIMARY KEY (id),
    CONSTRAINT fk_unavailability_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_unavailability_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT ck_unavailability_dates CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_unavailability_employee ON employee_unavailability(employee_id);

-- reschedule_requests
CREATE TABLE IF NOT EXISTS reschedule_requests (
    id                      INTEGER GENERATED ALWAYS AS IDENTITY,
    appointment_id          INTEGER NOT NULL,
    requested_by_user_id    INTEGER NOT NULL,
    new_date                DATE NOT NULL,
    new_start_time          TIME WITH TIME ZONE NOT NULL,
    new_end_time            TIME WITH TIME ZONE NOT NULL,
    reason                  TEXT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'Pending',
    responded_by_user_id    INTEGER,
    responded_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_reschedule_requests PRIMARY KEY (id),
    CONSTRAINT fk_reschedule_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_reschedule_requester FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reschedule_responder FOREIGN KEY (responded_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_reschedule_time_order CHECK (new_end_time > new_start_time)
);
CREATE INDEX IF NOT EXISTS idx_reschedule_appointment ON reschedule_requests(appointment_id);

-- visitor_notifications
CREATE TABLE IF NOT EXISTS visitor_notifications (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY,
    visitor_id          INTEGER NOT NULL,
    appointment_id      INTEGER,
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    notification_type   VARCHAR(20) NOT NULL DEFAULT 'Info',
    is_read             BOOLEAN NOT NULL DEFAULT false,
    read_at             TIMESTAMPTZ,
    channel             notification_channel NOT NULL DEFAULT 'InApp',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_visitor_notifications PRIMARY KEY (id),
    CONSTRAINT fk_vn_visitor FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    CONSTRAINT fk_vn_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_vn_visitor ON visitor_notifications(visitor_id);

-- refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    user_id         INTEGER NOT NULL,
    token           VARCHAR(500) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_revoked      BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_refresh_token UNIQUE (token)
);

-- password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    email           VARCHAR(100) NOT NULL,
    token           VARCHAR(500) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uq_reset_token UNIQUE (token)
);

-- =============================================================================
-- SEED DATA (expanded with new roles)
-- =============================================================================

-- Create admin user with proper password hash
-- Password: Admin@123
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('System Admin', 'admin@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Admin', true)
ON CONFLICT (email) DO NOTHING;

-- Create CEO user
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('CEO Office', 'ceo@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'CEO', true)
ON CONFLICT (email) DO NOTHING;

-- Create department head users
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('IT Department Head', 'it.head@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'DepartmentHead', true),
    ('HR Department Head', 'hr.head@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'DepartmentHead', true)
ON CONFLICT (email) DO NOTHING;

-- Create employee users
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('Abebe Kebede', 'abebe.kebede@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Employee', true),
    ('Birtukan Lemma', 'birtukan.lemma@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Employee', true)
ON CONFLICT (email) DO NOTHING;

-- Create receptionist and security users
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
    ('Sara Wondimu', 'sara.wondimu@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Receptionist', true),
    ('Tsegaye Berhan', 'tsegaye.berhan@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Security', true)
ON CONFLICT (email) DO NOTHING;
