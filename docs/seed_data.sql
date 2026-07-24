-- =============================================================================
-- ECX Visitor Management System — Comprehensive Seed Data
-- Run AFTER migration_v2.sql
-- Password for ALL users: Admin@123
-- =============================================================================

-- Departments (10) — no unique constraint on name, so we check manually
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Information Technology') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Information Technology', 'IT infrastructure, software, and support', 'Building A, 3rd Floor', '011-111-1001', 'it@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Human Resources') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Human Resources', 'Employee relations, hiring, and payroll', 'Building A, 2nd Floor', '011-111-1002', 'hr@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Finance') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Finance', 'Accounting, budgeting, and financial planning', 'Building B, 1st Floor', '011-111-1003', 'finance@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Operations') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Operations', 'Day-to-day business operations', 'Building B, 2nd Floor', '011-111-1004', 'ops@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Security') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Security', 'Physical and digital security', 'Building A, Ground Floor', '011-111-1005', 'security@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Administration') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Administration', 'Executive and administrative support', 'Building A, 4th Floor', '011-111-1006', 'admin@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Legal') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Legal', 'Legal affairs and compliance', 'Building B, 3rd Floor', '011-111-1007', 'legal@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Marketing') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Marketing', 'Brand, communications, and public relations', 'Building B, 4th Floor', '011-111-1008', 'marketing@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Research & Development') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Research & Development', 'Innovation and product development', 'Building C, 2nd Floor', '011-111-1009', 'randd@ecx.et', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Customer Service') THEN
    INSERT INTO departments (name, description, location, phone, email, is_active, created_at)
    VALUES ('Customer Service', 'Client support and relationship management', 'Building C, Ground Floor', '011-111-1010', 'cs@ecx.et', true, now());
  END IF;
END $$;

-- Employees (10, one per department)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'abebe.kebede@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Abebe Kebede', '+251-911-100001', 'abebe.kebede@ecx.et', 1, 'IT Manager', 'A301', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'birtukan.lemma@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Birtukan Lemma', '+251-911-100002', 'birtukan.lemma@ecx.et', 2, 'HR Manager', 'A201', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'chala.tadesse@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Chala Tadesse', '+251-911-100003', 'chala.tadesse@ecx.et', 3, 'Finance Manager', 'B101', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'desta.hailu@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Desta Hailu', '+251-911-100004', 'desta.hailu@ecx.et', 4, 'Operations Manager', 'B201', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'eleni.mamo@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Eleni Mamo', '+251-911-100005', 'eleni.mamo@ecx.et', 5, 'Security Manager', 'A101', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'fikru.alemu@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Fikru Alemu', '+251-911-100006', 'fikru.alemu@ecx.et', 6, 'Admin Manager', 'A401', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'genet.tesfaye@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Genet Tesfaye', '+251-911-100007', 'genet.tesfaye@ecx.et', 7, 'Legal Counsel', 'B301', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'hailu.girma@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Hailu Girma', '+251-911-100008', 'hailu.girma@ecx.et', 8, 'Marketing Manager', 'B401', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'idil.omar@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Idil Omar', '+251-911-100009', 'idil.omar@ecx.et', 9, 'R&D Manager', 'C201', 'Active', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'jemal.hussein@ecx.et') THEN
    INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at)
    VALUES ('Jemal Hussein', '+251-911-100010', 'jemal.hussein@ecx.et', 10, 'Customer Service Lead', 'C101', 'Active', now());
  END IF;
END $$;

-- Visitors (6)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM visitors WHERE email = 'kebede.assefa@gmail.com') THEN
    INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at)
    VALUES ('Kebede Assefa', '+251-922-200001', 'kebede.assefa@gmail.com', 'Addis Ababa, Bole Subcity', 'ET-1234567', 'ABC Trading', 'Male', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitors WHERE email = 'meron.bekele@yahoo.com') THEN
    INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at)
    VALUES ('Meron Bekele', '+251-922-200002', 'meron.bekele@yahoo.com', 'Addis Ababa, Kazanchis', 'ET-2345678', 'XYZ Consulting', 'Female', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitors WHERE email = 'nebiyu.girma@outlook.com') THEN
    INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at)
    VALUES ('Nebiyu Girma', '+251-922-200003', 'nebiyu.girma@outlook.com', 'Addis Ababa, CMC Area', 'ET-3456789', 'Tech Solutions', 'Male', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitors WHERE email = 'tsion.hai@gmail.com') THEN
    INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at)
    VALUES ('Tsion Hailemariam', '+251-922-200004', 'tsion.hai@gmail.com', 'Addis Ababa, Summit', 'ET-4567890', 'Green Energy', 'Female', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitors WHERE email = 'yonas.ayele@ethionet.et') THEN
    INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at)
    VALUES ('Yonas Ayele', '+251-922-200005', 'yonas.ayele@ethionet.et', 'Addis Ababa, Mexico Square', 'ET-5678901', NULL, 'Male', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitors WHERE email = 'yididiya19@gmail.com') THEN
    INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at)
    VALUES ('Yididiya Wondimu', '+251-922-200006', 'yididiya19@gmail.com', 'Addis Ababa, Bole', 'ET-6789012', 'ECX Trading', 'Male', true, now());
  END IF;
END $$;

-- Users — Password hash for "Admin@123" (BCrypt)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, created_at)
    VALUES ('System Admin', 'admin@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Admin', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ceo@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, created_at)
    VALUES ('CEO Office', 'ceo@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'CEO', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'it.head@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, created_at)
    VALUES ('IT Department Head', 'it.head@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'DepartmentHead', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'hr.head@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, created_at)
    VALUES ('HR Department Head', 'hr.head@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'DepartmentHead', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'abebe.kebede@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, employee_id, created_at)
    VALUES ('Abebe Kebede', 'abebe.kebede@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Employee', true, 1, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'birtukan.lemma@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, employee_id, created_at)
    VALUES ('Birtukan Lemma', 'birtukan.lemma@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Employee', true, 2, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'chala.tadesse@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, employee_id, created_at)
    VALUES ('Chala Tadesse', 'chala.tadesse@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Employee', true, 3, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'desta.hailu@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, employee_id, created_at)
    VALUES ('Desta Hailu', 'desta.hailu@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Employee', true, 4, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sara.wondimu@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, created_at)
    VALUES ('Sara Wondimu', 'sara.wondimu@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Receptionist', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tsegaye.berhan@ecx.et') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, created_at)
    VALUES ('Tsegaye Berhan', 'tsegaye.berhan@ecx.et', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Security', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'yididiya19@gmail.com') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, visitor_id, created_at)
    VALUES ('Yididiya Wondimu', 'yididiya19@gmail.com', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Visitor', true, 6, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kebede.assefa@gmail.com') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, visitor_id, created_at)
    VALUES ('Kebede Assefa', 'kebede.assefa@gmail.com', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Visitor', true, 1, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'meron.bekele@yahoo.com') THEN
    INSERT INTO users (full_name, email, password_hash, role, is_active, visitor_id, created_at)
    VALUES ('Meron Bekele', 'meron.bekele@yahoo.com', '$2a$12$LJ3m4yPn1z9x8v7c6b5a4e3d2c1b0a9z8y7x6w5v4u3t2s1r', 'Visitor', true, 2, now());
  END IF;
END $$;

-- Employee schedules (Mon-Fri for all employees)
DO $$
DECLARE
  emp RECORD;
  day_data RECORD;
BEGIN
  FOR emp IN SELECT id FROM employees LOOP
    FOR day_data IN
      SELECT * FROM (VALUES
        ('Monday',    '08:00'::TIME, '17:00'::TIME),
        ('Tuesday',   '08:00'::TIME, '17:00'::TIME),
        ('Wednesday', '08:00'::TIME, '17:00'::TIME),
        ('Thursday',  '08:00'::TIME, '17:00'::TIME),
        ('Friday',    '08:00'::TIME, '13:00'::TIME)
      ) AS t(day_name, start_time, end_time)
    LOOP
      IF NOT EXISTS (SELECT 1 FROM employee_schedules WHERE employee_id = emp.id AND day_of_week = day_data.day_name) THEN
        INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, max_appointments, is_available, created_at)
        VALUES (emp.id, day_data.day_name, day_data.start_time, day_data.end_time, 10, true, now());
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Appointments (8 mixed statuses)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 1 AND employee_id = 1 AND purpose = 'Software vendor demo') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (1, 1, CURRENT_DATE + 1, (CURRENT_DATE + 1 + TIME '09:00')::TIMESTAMPTZ, (CURRENT_DATE + 1 + TIME '10:00')::TIMESTAMPTZ, 'Software vendor demo', 'Pending', false, false, false, false, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 2 AND employee_id = 2 AND purpose = 'Job interview follow-up') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (2, 2, CURRENT_DATE + 1, (CURRENT_DATE + 1 + TIME '14:00')::TIMESTAMPTZ, (CURRENT_DATE + 1 + TIME '15:30')::TIMESTAMPTZ, 'Job interview follow-up', 'Pending', false, false, false, false, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 3 AND employee_id = 5 AND purpose = 'Security system upgrade proposal') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (3, 5, CURRENT_DATE, (CURRENT_DATE + TIME '10:00')::TIMESTAMPTZ, (CURRENT_DATE + TIME '11:00')::TIMESTAMPTZ, 'Security system upgrade proposal', 'Approved', false, false, true, true, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 4 AND employee_id = 6 AND purpose = 'Partnership discussion') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (4, 6, CURRENT_DATE, (CURRENT_DATE + TIME '11:00')::TIMESTAMPTZ, (CURRENT_DATE + TIME '12:00')::TIMESTAMPTZ, 'Partnership discussion', 'Approved', false, false, true, true, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 5 AND employee_id = 3 AND purpose = 'Audit preparation meeting') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (5, 3, CURRENT_DATE, (CURRENT_DATE + TIME '15:00')::TIMESTAMPTZ, (CURRENT_DATE + TIME '16:00')::TIMESTAMPTZ, 'Audit preparation meeting', 'Rejected', false, false, false, false, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 1 AND employee_id = 4 AND purpose = 'Supply chain review') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (1, 4, CURRENT_DATE - 1, (CURRENT_DATE - 1 + TIME '09:00')::TIMESTAMPTZ, (CURRENT_DATE - 1 + TIME '11:00')::TIMESTAMPTZ, 'Supply chain review', 'Completed', false, false, true, true, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 6 AND employee_id = 1 AND purpose = 'System integration review') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (6, 1, CURRENT_DATE + 2, (CURRENT_DATE + 2 + TIME '10:00')::TIMESTAMPTZ, (CURRENT_DATE + 2 + TIME '11:00')::TIMESTAMPTZ, 'System integration review', 'Pending', false, false, false, false, false, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM appointments WHERE visitor_id = 6 AND employee_id = 8 AND purpose = 'Marketing partnership discussion') THEN
    INSERT INTO appointments (visitor_id, employee_id, requested_date, requested_start_time, requested_end_time, purpose, status, reminder_email_sent, reminder_sms_sent, visitor_confirmed, check_in_allowed, is_confidential, created_at)
    VALUES (6, 8, CURRENT_DATE + 3, (CURRENT_DATE + 3 + TIME '14:00')::TIMESTAMPTZ, (CURRENT_DATE + 3 + TIME '15:00')::TIMESTAMPTZ, 'Marketing partnership discussion', 'Pending', false, false, false, false, false, now());
  END IF;
END $$;

-- Visits (linked to approved/completed appointments)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM visits WHERE visitor_id = 3 AND employee_id = 5 AND purpose = 'Security system upgrade proposal') THEN
    INSERT INTO visits (visitor_id, employee_id, appointment_id, purpose, visit_date, check_in_time, check_out_time, status, badge_number, security_officer, is_destination_known, created_at)
    VALUES (3, 5, NULL, 'Security system upgrade proposal', CURRENT_DATE, (CURRENT_DATE + TIME '10:05')::TIMESTAMPTZ, NULL, 'CheckedIn', 'B-001', 'Tsegaye Berhan', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visits WHERE visitor_id = 4 AND employee_id = 6 AND purpose = 'Partnership discussion') THEN
    INSERT INTO visits (visitor_id, employee_id, appointment_id, purpose, visit_date, check_in_time, check_out_time, status, badge_number, security_officer, is_destination_known, created_at)
    VALUES (4, 6, NULL, 'Partnership discussion', CURRENT_DATE, (CURRENT_DATE + TIME '11:10')::TIMESTAMPTZ, NULL, 'CheckedIn', 'B-002', 'Tsegaye Berhan', true, now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visits WHERE visitor_id = 1 AND employee_id = 4 AND purpose = 'Supply chain review') THEN
    INSERT INTO visits (visitor_id, employee_id, appointment_id, purpose, visit_date, check_in_time, check_out_time, status, badge_number, security_officer, is_destination_known, created_at)
    VALUES (1, 4, NULL, 'Supply chain review', CURRENT_DATE - 1, (CURRENT_DATE - 1 + TIME '09:00')::TIMESTAMPTZ, (CURRENT_DATE - 1 + TIME '10:55')::TIMESTAMPTZ, 'CheckedOut', 'B-003', 'Eleni Mamo', true, now());
  END IF;
END $$;

-- Notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'New Appointment Request' AND employee_id = 1) THEN
    INSERT INTO notifications (employee_id, appointment_id, title, message, notification_type, priority, is_read, channel, created_at)
    VALUES (1, 1, 'New Appointment Request', 'Visitor Kebede Assefa has requested a meeting on software vendor demo.', 'Info', 'Normal', false, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'New Appointment Request' AND employee_id = 2) THEN
    INSERT INTO notifications (employee_id, appointment_id, title, message, notification_type, priority, is_read, channel, created_at)
    VALUES (2, 2, 'New Appointment Request', 'Visitor Meron Bekele has requested a job interview follow-up.', 'Info', 'Normal', false, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Appointment Approved' AND employee_id = 5) THEN
    INSERT INTO notifications (employee_id, appointment_id, title, message, notification_type, priority, is_read, channel, created_at)
    VALUES (5, 3, 'Appointment Approved', 'Your meeting with Nebiyu Girma has been confirmed for today at 10:00.', 'Reminder', 'High', false, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Appointment Approved' AND employee_id = 6) THEN
    INSERT INTO notifications (employee_id, appointment_id, title, message, notification_type, priority, is_read, channel, created_at)
    VALUES (6, 4, 'Appointment Approved', 'Your meeting with Tsion Hailemariam has been confirmed for today at 11:00.', 'Reminder', 'High', false, 'InApp', now());
  END IF;
END $$;

-- Visitor notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM visitor_notifications WHERE visitor_id = 1 AND appointment_id = 1) THEN
    INSERT INTO visitor_notifications (visitor_id, appointment_id, title, message, notification_type, is_read, channel, created_at)
    VALUES (1, 1, 'Appointment Pending', 'Your appointment request with IT Department is pending approval.', 'Info', false, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitor_notifications WHERE visitor_id = 2 AND appointment_id = 2) THEN
    INSERT INTO visitor_notifications (visitor_id, appointment_id, title, message, notification_type, is_read, channel, created_at)
    VALUES (2, 2, 'Appointment Pending', 'Your appointment request with HR Department is pending approval.', 'Info', false, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitor_notifications WHERE visitor_id = 3 AND appointment_id = 3) THEN
    INSERT INTO visitor_notifications (visitor_id, appointment_id, title, message, notification_type, is_read, channel, created_at)
    VALUES (3, 3, 'Appointment Approved', 'Your appointment with Security Department has been approved. Please arrive on time.', 'Info', true, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitor_notifications WHERE visitor_id = 6 AND appointment_id = 7) THEN
    INSERT INTO visitor_notifications (visitor_id, appointment_id, title, message, notification_type, is_read, channel, created_at)
    VALUES (6, 7, 'Appointment Pending', 'Your system integration review appointment request is pending.', 'Info', false, 'InApp', now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM visitor_notifications WHERE visitor_id = 6 AND appointment_id = 8) THEN
    INSERT INTO visitor_notifications (visitor_id, appointment_id, title, message, notification_type, is_read, channel, created_at)
    VALUES (6, 8, 'Appointment Pending', 'Your marketing partnership appointment request is pending.', 'Info', false, 'InApp', now());
  END IF;
END $$;
