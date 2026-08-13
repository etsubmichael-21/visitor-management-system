-- =============================================================================
-- ECX Visitor Management System — Seed Data (reference)
-- PostgreSQL 15+ | Run AFTER docs/visitor_management.sql
-- =============================================================================
--
-- Mirrors the reference data used during development and testing (10
-- departments, 15 employees, 15 visitors, 23 user accounts, Mon–Fri schedules).
--
-- PASSWORD NOTE
-- -------------
-- All accounts share the development password `Admin@123`. The BCrypt hash
-- below is a PLACEHOLDER: replace it with a hash generated for `Admin@123`
-- using the app's BCryptPasswordHasher before applying this script to a real
-- environment (e.g. run `dotnet run` and register once, then copy the hash).
-- Storing real hashes in a committed seed file is a security anti-pattern.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. DEPARTMENTS (10)
-- =============================================================================

INSERT INTO departments (name, description, location, phone, email, is_active, created_at, updated_at) VALUES
    ('Information Technology',  'IT infrastructure, software, and support',            'Building A, 3rd Floor',  '011-111-1001', 'it@ecx.et',         true,  now(), now()),
    ('Human Resources',         'Employee relations, hiring, and payroll',             'Building A, 2nd Floor',  '011-111-1002', 'hr@ecx.et',         true,  now(), now()),
    ('Finance',                 'Accounting, budgeting, and financial planning',       'Building B, 1st Floor',  '011-111-1003', 'finance@ecx.et',    true,  now(), now()),
    ('Operations',              'Day-to-day business operations',                      'Building B, 2nd Floor',  '011-111-1004', 'ops@ecx.et',        true,  now(), now()),
    ('Security',                'Physical and digital security',                       'Building A, Ground Floor', '011-111-1005', 'security@ecx.et', true, now(), now()),
    ('Administration',          'Executive and administrative support',                'Building A, 4th Floor',  '011-111-1006', 'admin@ecx.et',      true,  now(), now()),
    ('Legal',                   'Legal affairs and compliance',                        'Building B, 3rd Floor',  '011-111-1007', 'legal@ecx.et',      true,  now(), now()),
    ('Marketing',               'Brand, communications, and public relations',         'Building B, 4th Floor',  '011-111-1008', 'marketing@ecx.et',  true,  now(), now()),
    ('Research & Development',  'Innovation and product development',                  'Building C, 2nd Floor',  '011-111-1009', 'randd@ecx.et',      true,  now(), now()),
    ('Customer Service',        'Client support and relationship management',          'Building C, Ground Floor', '011-111-1010', 'cs@ecx.et',      true,  now(), now());

-- =============================================================================
-- 2. EMPLOYEES (15) — one manager per department + dept heads + support staff
--    (department_id resolved by name so explicit IDs are not required)
-- =============================================================================

INSERT INTO employees (full_name, phone, email, department_id, position, office_number, status, created_at, updated_at) VALUES
    ('Abebe Kebede',    '+251-911-100001', 'abebe.kebede@ecx.et',    (SELECT id FROM departments WHERE name = 'Information Technology'), 'IT Manager',           'A301', 'Active', now(), now()),
    ('Birtukan Lemma',  '+251-911-100002', 'birtukan.lemma@ecx.et',  (SELECT id FROM departments WHERE name = 'Human Resources'),        'HR Manager',           'A201', 'Active', now(), now()),
    ('Chala Tadesse',   '+251-911-100003', 'chala.tadesse@ecx.et',   (SELECT id FROM departments WHERE name = 'Finance'),                'Finance Manager',      'B101', 'Active', now(), now()),
    ('Desta Hailu',     '+251-911-100004', 'desta.hailu@ecx.et',     (SELECT id FROM departments WHERE name = 'Operations'),             'Operations Manager',   'B201', 'Active', now(), now()),
    ('Eleni Mamo',      '+251-911-100005', 'eleni.mamo@ecx.et',      (SELECT id FROM departments WHERE name = 'Security'),               'Security Manager',     'A101', 'Active', now(), now()),
    ('Fikru Alemu',     '+251-911-100006', 'fikru.alemu@ecx.et',     (SELECT id FROM departments WHERE name = 'Administration'),         'Admin Manager',        'A401', 'Active', now(), now()),
    ('Genet Tesfaye',   '+251-911-100007', 'genet.tesfaye@ecx.et',   (SELECT id FROM departments WHERE name = 'Legal'),                  'Legal Counsel',        'B301', 'Active', now(), now()),
    ('Hailu Girma',     '+251-911-100008', 'hailu.girma@ecx.et',     (SELECT id FROM departments WHERE name = 'Marketing'),              'Marketing Manager',    'B401', 'Active', now(), now()),
    ('Idil Omar',       '+251-911-100009', 'idil.omar@ecx.et',       (SELECT id FROM departments WHERE name = 'Research & Development'), 'R&D Manager',          'C201', 'Active', now(), now()),
    ('Jemal Hussein',   '+251-911-100010', 'jemal.hussein@ecx.et',   (SELECT id FROM departments WHERE name = 'Customer Service'),       'Customer Service Lead','C101', 'Active', now(), now()),
    ('Reception Desk',  '0111112222',      'sara.wondimu@ecx.et',    (SELECT id FROM departments WHERE name = 'Administration'),         'Receptionist',         NULL,   'Active', now(), now()),
    ('Tsegaye Berhan',  '+251-911-100012', 'tsegaye.berhan@ecx.et',  (SELECT id FROM departments WHERE name = 'Security'),               'Security Guard',       NULL,   'Active', now(), now()),
    ('Abinet Tesfaye',  '+251900000101',   'it.head@ecx.et',         (SELECT id FROM departments WHERE name = 'Information Technology'), 'Department Head',      'A-101', 'Active', now(), now()),
    ('Hanna Mekonnen',  '+251900000102',   'hr.head@ecx.et',         (SELECT id FROM departments WHERE name = 'Human Resources'),        'Department Head',      'A-102', 'Active', now(), now()),
    ('Robel Assefa',    '+251900000103',   'finance.head@ecx.et',    (SELECT id FROM departments WHERE name = 'Finance'),                'Department Head',      'A-103', 'Active', now(), now());

-- =============================================================================
-- 3. VISITORS (15)
-- =============================================================================

INSERT INTO visitors (full_name, phone, email, address, national_id, organization, gender, is_active, created_at, updated_at) VALUES
    ('Kebede Assefa',       '+251-922-200001', 'kebede.assefa@gmail.com',       'Addis Ababa',         'ET-1234567', 'ABC Trading',     'Male',   true, now(), now()),
    ('Meron Bekele',        '+251-922-200002', 'meron.bekele@yahoo.com',        'Addis Ababa',         'ET-2345678', 'XYZ Consulting',   'Female', true, now(), now()),
    ('Nebiyu Girma',        '+251-922-200003', 'nebiyu.girma@outlook.com',      'Addis Ababa',         'ET-3456789', 'Tech Solutions',   'Male',   true, now(), now()),
    ('Tsion Hailemariam',   '+251-922-200004', 'tsion.hai@gmail.com',           'Addis Ababa',         'ET-4567890', 'Green Energy',     'Female', true, now(), now()),
    ('Yonas Ayele',         '+251-922-200005', 'yonas.ayele@ethionet.et',       'Addis Ababa',         'ET-5678901', NULL,              'Male',   true, now(), now()),
    ('Yididiya Wondimu',    '+251-922-200006', 'yididiya19@gmail.com',          'Addis Ababa',         'ET-6789012', 'ECX Trading',      'Male',   true, now(), now()),
    ('Etsub michael',       '0924461793',      'etsubmichael58@gmail.com',      'Hawassa',             NULL,         'hawassa university','f',    true, now(), now()),
    ('kiya tedi',           '0912963334',      'kiya58@gmail.com',              'Hawassa',             NULL,         'NB',               NULL,     true, now(), now()),
    ('yididiya gebretsadik','0912963334',      'yididiyagtsadik@gmail.com',     'Hawassa',             NULL,         'NBank',            NULL,     true, now(), now()),
    ('Test User',           '+251911111111',   'testuser9999@example.com',      'Addis Ababa',         NULL,         NULL,               NULL,     true, now(), now()),
    ('Yanet Abrham',        '0933556687',      'yanabrha29@gmail.com',          'Addis Ababa',         NULL,         'adiss ababa university', NULL, true, now(), now()),
    ('Hana Tadesse',        '0911223344',      'hanataddese057@gmail.com',      'Addis Ababa',         NULL,         NULL,               NULL,     true, now(), now()),
    ('behilu',              '0911121314',      'behailu@gmail.com',              'Addis Ababa',         NULL,         'NB',               NULL,     true, now(), now()),
    ('Book Test User',      '+251911111111',   'booktest1785830351877@example.com', 'Addis Ababa',     NULL,         'Test Org',         NULL,     true, now(), now()),
    ('biruk mekonen',       '0999897866',      'buramok21@gmail.com',           'Hawassa',             NULL,         'Hawassa university', NULL,   true, now(), now());

-- =============================================================================
-- 4. USER ACCOUNTS (23) — staff roles link to employees, Visitor role to visitors
-- =============================================================================

-- Placeholder BCrypt hash for development password `Admin@123`.
-- Replace before production use (see header note).
DO $$
DECLARE
    v_hash TEXT := '$2a$12$REPLACE_WITH_VALID_BCRYPT_HASH_FOR_Admin123';
BEGIN

    -- Staff accounts (13)
    INSERT INTO users (full_name, email, password_hash, role, is_active, employee_id, created_at, updated_at) VALUES
        ('System Admin',       'admin@ecx.et',           v_hash, 'Admin',           true, NULL, now(), now()),
        ('CEO Office',         'ceo@ecx.et',             v_hash, 'CEO',             true, NULL, now(), now()),
        ('IT Department Head', 'it.head@ecx.et',         v_hash, 'DepartmentHead',   true, (SELECT id FROM employees WHERE email = 'it.head@ecx.et'),      now(), now()),
        ('HR Department Head', 'hr.head@ecx.et',         v_hash, 'DepartmentHead',   true, (SELECT id FROM employees WHERE email = 'hr.head@ecx.et'),      now(), now()),
        ('Robel Assefa',       'finance.head@ecx.et',    v_hash, 'DepartmentHead',   true, (SELECT id FROM employees WHERE email = 'finance.head@ecx.et'), now(), now()),
        ('Abebe Kebede',       'abebe.kebede@ecx.et',    v_hash, 'Employee',         true, (SELECT id FROM employees WHERE email = 'abebe.kebede@ecx.et'), now(), now()),
        ('Birtukan Lemma',     'birtukan.lemma@ecx.et',  v_hash, 'Employee',         true, (SELECT id FROM employees WHERE email = 'birtukan.lemma@ecx.et'), now(), now()),
        ('Chala Tadesse',      'chala.tadesse@ecx.et',   v_hash, 'Employee',         true, (SELECT id FROM employees WHERE email = 'chala.tadesse@ecx.et'),  now(), now()),
        ('Desta Hailu',        'desta.hailu@ecx.et',     v_hash, 'Employee',         true, (SELECT id FROM employees WHERE email = 'desta.hailu@ecx.et'),    now(), now()),
        ('Sara Wondimu',       'sara.wondimu@ecx.et',    v_hash, 'Receptionist',     true, (SELECT id FROM employees WHERE email = 'sara.wondimu@ecx.et'),  now(), now()),
        ('Tsegaye Berhan',     'tsegaye.berhan@ecx.et',  v_hash, 'Security',         true, (SELECT id FROM employees WHERE email = 'tsegaye.berhan@ecx.et'), now(), now());

    -- Visitor accounts (12) — the six reference visitors below have accounts;
    -- remaining visitors are added by the system when booking or by staff.
    INSERT INTO users (full_name, email, password_hash, role, is_active, visitor_id, created_at, updated_at) VALUES
        ('Kebede Assefa',    'kebede.assefa@gmail.com',    v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'kebede.assefa@gmail.com'),    now(), now()),
        ('Meron Bekele',     'meron.bekele@yahoo.com',     v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'meron.bekele@yahoo.com'),     now(), now()),
        ('Yididiya Wondimu', 'yididiya19@gmail.com',       v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'yididiya19@gmail.com'),       now(), now()),
        ('Etsub michael',    'etsubmichael58@gmail.com',   v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'etsubmichael58@gmail.com'),   now(), now()),
        ('kiya tedi',        'kiya58@gmail.com',           v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'kiya58@gmail.com'),           now(), now()),
        ('yididiya gebretsadik', 'yididiyagtsadik@gmail.com', v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'yididiyagtsadik@gmail.com'), now(), now()),
        ('Test User',        'testuser9999@example.com',   v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'testuser9999@example.com'),   now(), now()),
        ('Yanet Abrham',     'yanabrha29@gmail.com',       v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'yanabrha29@gmail.com'),       now(), now()),
        ('Hana Tadesse',     'hanataddese057@gmail.com',   v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'hanataddese057@gmail.com'),   now(), now()),
        ('behilu',           'behailu@gmail.com',          v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'behailu@gmail.com'),          now(), now()),
        ('Book Test User',   'booktest1785830351877@example.com', v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'booktest1785830351877@example.com'), now(), now()),
        ('biruk mekonen',    'buramok21@gmail.com',        v_hash, 'Visitor', true, (SELECT id FROM visitors WHERE email = 'buramok21@gmail.com'),        now(), now());

END $$;

-- =============================================================================
-- 5. WEEKLY SCHEDULES (Mon–Fri, 08:00–17:00, Friday half-day 08:00–13:00)
--    One 5-day set for each manager employee (1–10).
-- =============================================================================

INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, break_start, break_end, is_available, max_appointments, created_at, updated_at)
SELECT e.id, d.day_of_week, d.start_time, d.end_time, d.break_start, d.break_end, true, 10, now(), now()
FROM employees e
CROSS JOIN (VALUES
    ('Monday',   TIME '08:00', TIME '17:00', TIME '12:00', TIME '13:00'),
    ('Tuesday',  TIME '08:00', TIME '17:00', TIME '12:00', TIME '13:00'),
    ('Wednesday',TIME '08:00', TIME '17:00', TIME '12:00', TIME '13:00'),
    ('Thursday', TIME '08:00', TIME '17:00', TIME '12:00', TIME '13:00'),
    ('Friday',   TIME '08:00', TIME '13:00', NULL, NULL)
) AS d(day_of_week, start_time, end_time, break_start, break_end)
WHERE e.email IN (
    'abebe.kebede@ecx.et', 'birtukan.lemma@ecx.et', 'chala.tadesse@ecx.et',
    'desta.hailu@ecx.et', 'eleni.mamo@ecx.et', 'fikru.alemu@ecx.et',
    'genet.tesfaye@ecx.et', 'hailu.girma@ecx.et', 'idil.omar@ecx.et',
    'jemal.hussein@ecx.et'
);

COMMIT;
