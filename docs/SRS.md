# Software Requirements Specification (SRS)

## ECX Visitor Management System (VMS)

**Version:** 2.0
**Date:** July 10, 2026
**Organization:** Ethiopia Commodity Exchange (ECX)
**Prepared by:** Software Architecture Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Current State & Gap Analysis](#3-current-state--gap-analysis)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture Overview](#6-system-architecture-overview)
7. [Database Requirements](#7-database-requirements)
8. [API Specification](#8-api-specification)
9. [Frontend Requirements](#9-frontend-requirements)
10. [Security Requirements](#10-security-requirements)
11. [Appendices](#11-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete requirements for the ECX Visitor Management System (VMS) — an enterprise-grade, dual-portal web application designed to manage all aspects of visitor reception, appointment scheduling, and employee-visitor interactions at Ethiopia Commodity Exchange (ECX).

This document serves as the authoritative reference for all development phases, from database design through deployment.

### 1.2 Scope

The system consists of:

- **Public Visitor Portal** — An external-facing Angular application for visitors to register, manage profiles, and request appointments.
- **Employee Portal** — An internal Angular application for ECX employees (Admin, CEO, Department Head, Employee, Receptionist, Security Officer) with role-based dashboards and operations.
- **Shared ASP.NET Core Web API** — A single backend serving both portals with JWT authentication and role-based authorization.
- **PostgreSQL Database** — A fully normalized, indexed database with audit trails.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| VMS | Visitor Management System |
| ECX | Ethiopia Commodity Exchange |
| SRS | Software Requirements Specification |
| JWT | JSON Web Token |
| CQRS | Command Query Responsibility Segregation |
| RBAC | Role-Based Access Control |
| SPA | Single Page Application |
| API | Application Programming Interface |
| EF Core | Entity Framework Core |
| KPI | Key Performance Indicator |

### 1.4 References

- PostgreSQL 15+ Documentation
- ASP.NET Core 10 Documentation
- Angular 20+ Documentation
- ECX Organizational Structure Document
- Visitor Management Best Practices (Industry Standards)

---

## 2. Overall Description

### 2.1 Product Perspective

The ECX VMS is a greenfield enterprise application built on the existing codebase scaffold. It follows Clean Architecture principles with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Visitor Portal   │    │  Employee Portal  │          │
│  │  (Angular 20)     │    │  (Angular 20)     │          │
│  └────────┬─────────┘    └────────┬─────────┘          │
│           │                       │                     │
│           └───────────┬───────────┘                     │
│                       │                                 │
├───────────────────────┼─────────────────────────────────┤
│                 API GATEWAY (JWT)                        │
├───────────────────────┼─────────────────────────────────┤
│                  BACKEND LAYER                          │
│  ┌──────────────────────────────────────┐               │
│  │     ASP.NET Core Web API (.NET 10)   │               │
│  │  ┌─────────┐  ┌─────────┐  ┌──────┐ │               │
│  │  │Controllers│ │Services │  │ Repos │ │               │
│  │  └─────────┘  └─────────┘  └──────┘ │               │
│  └──────────────────────────────────────┘               │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                           │
│  ┌──────────────────────────────────────┐               │
│  │       PostgreSQL 15+ Database        │               │
│  │    (Entity Framework Core + CQRS)    │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 User Classes and Characteristics

| Role | Portal | Access Level | Description |
|------|--------|-------------|-------------|
| **Visitor** | Public | Self-service | Registers, requests appointments, manages profile |
| **Administrator** | Employee | Full system access | Manages all entities, configuration, reports |
| **CEO** | Employee | Executive access | Views all appointments including confidential, delegates |
| **Department Head** | Employee | Department-level | Manages department appointments and employees |
| **Employee** | Employee | Individual-level | Manages own appointments, calendar |
| **Receptionist** | Employee | Front desk | Walk-in registration, check-in/out, visitor guidance |
| **Security Officer** | Employee | Security checkpoint | Visitor verification, item tracking, checkout |

### 2.3 Operating Environment

- **Frontend:** Angular 20+, Node.js 20+, modern browsers (Chrome, Firefox, Edge, Safari)
- **Backend:** ASP.NET Core 10, .NET 10 SDK
- **Database:** PostgreSQL 15+
- **Deployment:** IIS/Kestrel, Docker containerization supported

### 2.4 Design and Implementation Constraints

1. Must use the existing `EcxVisitorManagement` namespace and project structure
2. Must maintain backward compatibility with the existing PostgreSQL schema
3. Must support both HTTPS and HTTP (development)
4. Must use snake_case for database identifiers
5. Must follow existing code conventions (Data Annotations on models, Repository + Service pattern)
6. Angular applications must use standalone components (Angular 20 convention)
7. Must support responsive design (mobile, tablet, desktop)

---

## 3. Current State & Gap Analysis

### 3.1 What Already Exists

#### Backend (ASP.NET Core)

| Component | Status | Details |
|-----------|--------|---------|
| Models | ✅ Complete (mostly) | User, Employee, Visitor, Visit, Appointment, Department, Notification, AuditLog, EmployeeSchedule, EmailQueue, SmsQueue |
| Enums | ✅ Complete | UserRole, EmployeeStatus, VisitStatus, AppointmentStatus, NotificationType, NotificationPriority, QueueStatus |
| DbContext | ✅ Complete | AppDbContext with all DbSets and Fluent API configuration |
| Controllers | ✅ Basic | Auth, Appointments, Visitors, Employees, Departments, Visits, Users, Notifications, Dashboard |
| Services | ✅ Basic | AuthService, AppointmentService, VisitorService, EmployeeService, DepartmentService, UserService, NotificationService, VisitService, DashboardService |
| Interfaces | ✅ Basic | All service and repository interfaces |
| Repositories | ✅ Basic | GenericRepository + specific repositories |
| DTOs | ✅ Basic | Appointment, Visitor, Visit, Employee, Department, User, Notification, Dashboard DTOs |
| JWT Auth | ✅ Basic | JwtHelper, login/register/change-password |
| Exception Handling | ✅ Basic | ExceptionMiddleware with KeyNotFound, Unauthorized, InvalidOperation, general |
| AutoMapper | ✅ Basic | MappingProfile configured |
| SQL Schema | ✅ Complete | Full PostgreSQL schema with seed data |
| DB Documentation | ✅ Complete | Comprehensive documentation with 11 tables |

#### Frontend (Angular)

| Component | Status | Details |
|-----------|--------|---------|
| Project Setup | ✅ Complete | Angular 22 project with package.json |
| App Routes | ✅ Basic | Main routing structure with lazy loading |
| App Config | ✅ Basic | HTTP interceptors configured |
| Styles | ⚠️ Minimal | styles.scss exists but needs Angular Material |
| Components | ⚠️ Scaffolded | Route definitions exist but components need implementation |
| Services | ⚠️ Minimal | notification.service.ts, status-label.pipe.ts exist |

### 3.2 Critical Gaps (Must Be Addressed)

#### Backend Gaps

| Gap | Priority | Impact |
|-----|----------|--------|
| **Missing Roles: CEO, Department Head, Employee** | 🔴 Critical | System cannot support role-based authorization for internal portal |
| **Missing Employee ↔ User linking** | 🔴 Critical | No way to authenticate as employee; no FK relationship |
| **Missing Visitor ↔ User linking** | 🔴 Critical | Visitors cannot self-service without login credentials |
| **Missing `visitor_items` table** | 🔴 Critical | Security cannot track visitor belongings |
| **Missing `appointment_attachments` table** | 🔴 Critical | Visitors cannot upload request letters |
| **Missing `visit_attachments` table** | ⚠️ High | Attachments referenced in requirements but no table |
| **Missing `appointment_comments` table** | ⚠️ High | No communication thread on appointments |
| **Missing `employee_unavailability` table** | 🔴 Critical | Cannot track leave/travel/resignation |
| **Missing appointment delegation/redirect** | 🔴 Critical | CEO and Dept Head cannot delegate appointments |
| **Missing confidential appointment flag** | 🔴 Critical | No support for confidential meetings |
| **Missing `reschedule_requests` table** | ⚠️ High | No reschedule workflow |
| **Missing visitor notifications** | 🔴 Critical | Notifications only sent to employees, not visitors |
| **Missing `visitor_notifications` table** | 🔴 Critical | Need separate table for visitor in-app notifications |
| **Missing forgot-password flow** | ⚠️ High | No password reset mechanism |
| **Missing audit logging implementation** | ⚠️ High | AuditLog model exists but no middleware/service |
| **Missing Swagger/OpenAPI** | ⚠️ Medium | No API documentation |
| **Missing CQRS pattern** | ⚠️ Medium | All operations use service layer directly |
| **Missing FluentValidation validators** | ⚠️ Medium | Package installed but no validators |
| **Missing file upload service** | ⚠️ High | Only basic photo upload in VisitorsController |
| **Missing SignalR** | ⚠️ Medium | No real-time notifications |
| **Missing background services** | ⚠️ Medium | No email/SMS queue processing workers |

#### Frontend Gaps

| Gap | Priority | Impact |
|-----|----------|--------|
| **No Angular Material installed** | 🔴 Critical | No UI framework |
| **No Angular Material imports** | 🔴 Critical | No component library |
| **No two separate applications** | 🔴 Critical | Currently one app, need visitor + employee portals |
| **No authentication pages implemented** | 🔴 Critical | Login/forgot-password are scaffolded but not built |
| **No layout components implemented** | 🔴 Critical | MainLayout, AuthLayout referenced but not created |
| **No guards implemented** | 🔴 Critical | AuthGuard referenced but not created |
| **No interceptors implemented** | 🔴 Critical | AuthInterceptor, ErrorInterceptor referenced but not created |
| **No services implemented** | 🔴 Critical | No API service calls |
| **No role-based navigation** | 🔴 Critical | No menu switching based on role |
| **No dashboard components** | ⚠️ High | Dashboard referenced but not built |
| **No calendar components** | ⚠️ High | Calendar required for multiple roles |
| **No responsive design** | ⚠️ High | No responsive styling |
| **No state management** | ⚠️ Medium | No NgRx/service state management |
| **No error handling UI** | ⚠️ Medium | No toast/snackbar notifications |
| **No loading indicators** | ⚠️ Medium | No spinners/skeleton loaders |
| **No data tables with sort/filter** | ⚠️ High | No reusable table component |
| **No charts/analytics** | ⚠️ Medium | No charting library |
| **No PDF/Excel export** | ⚠️ Medium | No export functionality |
| **No i18n** | 🟢 Low | Single language (English) |

### 3.3 Database Schema Extensions Required

New tables to add:

```
1.  visitor_items              — Physical items brought by visitors
2.  appointment_attachments    — Files attached to appointment requests
3.  appointment_comments       — Discussion thread on appointments
4.  employee_unavailability    — Leave/travel/resignation records
5.  reschedule_requests        — Reschedule workflow
6.  visitor_notifications      — In-app notifications for visitors
7.  refresh_tokens             — JWT refresh token storage
8.  password_reset_tokens      — Password reset flow tokens
```

Modified tables:

```
1.  users         — Add FK to employees (nullable), expand enum roles
2.  employees     — Add user_id FK (1:1 with user)
3.  appointments  — Add is_confidential, delegated_to_employee_id, original_employee_id, redirect_department_id
4.  notifications — Add visitor_id FK (nullable), notification channel (email/sms/in-app)
5.  visits        — Add appointment_id FK (nullable)
```

Expanded enums:

```
user_role:  Admin, CEO, DepartmentHead, Employee, Receptionist, Security, Visitor
appointment_status: Pending, Approved, Rejected, Cancelled, Completed, EmployeeUnavailable, Rescheduled, Delegated
visit_status: Scheduled, CheckedIn, CheckedOut, Cancelled, Pending
notification_channel: InApp, Email, SMS, All
```

---

## 4. Functional Requirements

### 4.1 Visitor Portal (Application 1)

#### 4.1.1 ECX Landing Page

**FR-VP-001:** The system shall display a public landing page with ECX logo, about section, and contact information.

**FR-VP-002:** The landing page shall include navigation to: Home, About, Contact, Register, and Login.

**FR-VP-003:** The About page shall display ECX organizational information, mission, vision, and key facts.

**FR-VP-004:** The Contact page shall display ECX address, phone numbers, email, and a contact form.

#### 4.1.2 Visitor Registration

**FR-VP-010:** The system shall allow new visitors to register with: full name, phone, email, password, address, national ID (optional), organization (optional), gender.

**FR-VP-011:** Registration shall create both a `visitor` record and a `user` record with role `Visitor`.

**FR-VP-012:** The system shall validate email uniqueness during registration.

**FR-VP-013:** The system shall send a welcome email/SMS upon successful registration.

**FR-VP-014:** Passwords shall be hashed with BCrypt before storage.

**FR-VP-015:** Upon successful registration, the system shall automatically log in the visitor and redirect to their profile.

#### 4.1.3 Visitor Login

**FR-VP-020:** The system shall authenticate visitors using email and password.

**FR-VP-021:** Successful login shall return a JWT access token and refresh token.

**FR-VP-022:** The system shall display appropriate error messages for invalid credentials and deactivated accounts.

**FR-VP-023:** The system shall track last login timestamp.

#### 4.1.4 Forgot Password

**FR-VP-025:** The system shall allow visitors to request a password reset via email.

**FR-VP-026:** The system shall generate a time-limited reset token (expires in 1 hour).

**FR-VP-027:** The system shall send the reset link via email.

**FR-VP-028:** The system shall allow setting a new password using the valid reset token.

#### 4.1.5 Visitor Profile

**FR-VP-030:** Visitors shall view and edit their profile information.

**FR-VP-031:** Visitors shall upload a profile photo (max 5MB, JPG/PNG).

**FR-VP-032:** Profile changes shall update the `visitors` table.

**FR-VP-033:** Visitors shall be able to change their password from the profile page.

#### 4.1.6 Request Appointment

**FR-VP-040:** Visitors shall select an employee or department to request an appointment.

**FR-VP-041:** The form shall include: target employee/department, date, start time, end time, purpose, attachment upload (optional PDF/letter).

**FR-VP-042:** The system shall validate that the requested date/time falls within the employee's schedule.

**FR-VP-043:** The system shall check for scheduling conflicts and warn the visitor.

**FR-VP-044:** The system shall generate a unique appointment code for each request.

**FR-VP-045:** Upon submission, the system shall create an appointment with status `Pending`.

**FR-VP-046:** The system shall send a notification to the target employee.

**FR-VP-047:** The system shall send a confirmation email/SMS to the visitor.

**FR-VP-048:** Visitors may upload one or more attachments (PDF, images) up to 10MB each.

#### 4.1.7 View Appointment Status

**FR-VP-050:** Visitors shall view all their appointments with current status.

**FR-VP-051:** The status shall be displayed as: Pending, Approved, Rejected, Cancelled, Completed, Employee Unavailable, Rescheduled.

**FR-VP-052:** The system shall highlight appointments requiring action (e.g., reschedule after rejection).

**FR-VP-053:** Visitors shall see the appointment code for reference at the reception desk.

#### 4.1.8 Cancel Appointment

**FR-VP-055:** Visitors shall cancel appointments with status `Pending` or `Approved`.

**FR-VP-056:** Cancellation shall update status to `Cancelled` and notify the employee.

**FR-VP-057:** Visitors must provide a reason for cancellation.

#### 4.1.9 Request Reschedule

**FR-VP-060:** Visitors may request to reschedule an approved or pending appointment.

**FR-VP-061:** The reschedule request shall include a new proposed date and time.

**FR-VP-062:** The system shall create a `reschedule_request` record linked to the original appointment.

**FR-VP-063:** The target employee shall be notified of the reschedule request.

#### 4.1.10 Visitor Notifications

**FR-VP-070:** Visitors shall have an in-app notification center showing all their notifications.

**FR-VP-071:** Notifications include: Appointment Requested, Approved, Rejected, Cancelled, Rescheduled, Reminder, Employee Unavailable, Redirected.

**FR-VP-072:** Unread notification count shall be displayed in the header.

**FR-VP-073:** Visitors may mark notifications as read.

### 4.2 Employee Portal (Application 2)

#### 4.2.1 Authentication & Authorization

**FR-EP-001:** All employee portal pages shall require JWT authentication.

**FR-EP-002:** Role-based access shall be enforced on both frontend (route guards, menu) and backend (authorization policies).

**FR-EP-003:** The system shall support 6 employee roles: Admin, CEO, Department Head, Employee, Receptionist, Security Officer.

**FR-EP-004:** Each role shall have a distinct sidebar menu and set of accessible routes.

#### 4.2.2 Administrator Features

**FR-EP-010 (Dashboard):**
- Total visitors today/this week/this month
- Active appointments count
- Pending appointments count
- Visitor check-in/out count
- Department-wise appointment distribution (chart)
- Recent activities feed
- System health indicators
- Quick action buttons

**FR-EP-011 (Calendar):**
- Monthly/weekly/daily calendar view
- Color-coded by appointment status
- Click to view appointment details
- Filter by department/employee

**FR-EP-012 (Manage Employees):**
- CRUD operations for employees
- Assign to departments
- Set employment status (Active, Inactive, OnLeave)
- View employee appointment history
- Manage employee schedules (availability windows)
- Mark employee as unavailable (leave, travel, resignation)

**FR-EP-013 (Manage Visitors):**
- View all registered visitors
- Search/filter visitors
- View visitor profile and history
- Activate/deactivate visitors
- Blacklist visitors

**FR-EP-014 (Manage Departments):**
- CRUD operations for departments
- View department statistics
- View department employee count

**FR-EP-015 (Manage Roles):**
- View all users and their roles
- Create new user accounts
- Assign roles to users
- Activate/deactivate user accounts
- Reset user passwords

**FR-EP-016 (Manage Appointments):**
- View all appointments system-wide
- Filter by status, date, department, employee
- Override any appointment status
- View confidential appointments

**FR-EP-017 (Reports & Analytics):**
- Visitor frequency reports (daily/weekly/monthly/yearly)
- Appointment statistics (approved/rejected/completed/pending ratios)
- Peak hours analysis
- Department-wise visitor distribution
- Employee-wise appointment load
- Export to PDF and Excel
- Date range filtering

**FR-EP-018 (Search):**
- Global search across visitors, employees, appointments
- Search by name, email, phone, appointment code

#### 4.2.3 CEO Features

**FR-EP-020 (Executive Dashboard):**
- High-level KPIs: total appointments, approval rate, visitor count
- Department comparison chart
- Confidential appointments widget
- Pending actions requiring CEO attention
- Recent delegation activity

**FR-EP-021 (Confidential Appointments):**
- CEO may view all appointments including those marked confidential
- Confidential appointments shall show a special badge/indicator
- Access restricted — other roles cannot view confidential details

**FR-EP-022 (Delegate/Redirect Appointments):**
- CEO may redirect any appointment to a different employee
- CEO may delegate appointment responsibility to another employee
- The original employee and new employee shall both be notified
- The visitor shall be notified of the redirect
- Delegation history shall be preserved

**FR-EP-023 (Department Statistics):**
- View statistics per department
- Compare department performance
- Identify bottlenecks

#### 4.2.4 Department Head Features

**FR-EP-030 (Dashboard):**
- Department-specific KPIs
- Pending appointments requiring department action
- Employee availability overview
- Department appointment trends

**FR-EP-031 (Approve/Reject Appointments):**
- Department Head may approve or reject any appointment targeting employees in their department
- Rejection must include a reason
- Approval/rejection notifies the visitor

**FR-EP-032 (Reschedule Appointments):**
- Department Head may reschedule appointments for department employees
- New date/time must be within employee schedule

**FR-EP-033 (Delegate Appointments):**
- Department Head may delegate appointments to other department employees
- Must select a specific employee as the new target
- Both original and new employee shall be notified

**FR-EP-034 (Calendar):**
- View department-wide calendar
- See all employee schedules and appointments
- Identify conflicts

#### 4.2.5 Employee Features

**FR-EP-040 (Dashboard):**
- Personal KPIs: pending, approved, completed appointments
- Today's appointments widget
- Recent visitor activity
- Upcoming appointments (next 7 days)

**FR-EP-041 (Calendar):**
- Personal calendar with all own appointments
- View by day/week/month
- Color-coded by status

**FR-EP-042 (Manage Appointments):**
- View pending appointment requests
- Approve with optional notes
- Reject with mandatory reason
- Reschedule with new date/time
- Complete meeting (marks as `Completed`)

**FR-EP-043 (Appointment History):**
- View all past appointments
- Filter by date range and status
- View visitor details for each appointment

**FR-EP-044 (Notifications):**
- In-app notification center
- Mark as read/unread
- Filter by type (info, warning, reminder, alert)
- Clear all

#### 4.2.6 Receptionist Features

**FR-EP-050 (Dashboard):**
- Today's expected appointments
- Current visitors on premises
- Walk-in count
- Pending check-ins

**FR-EP-051 (Register Walk-In Visitor):**
- Quick registration for walk-in visitors
- Auto-detect if visitor already exists (by email/phone/national ID)
- Assign badge number
- Create visit record

**FR-EP-052 (Check In Visitor):**
- Verify appointment approval before check-in
- Assign badge number
- Record check-in time
- Notify the target employee of visitor arrival
- Record security officer name

**FR-EP-053 (Handle Unknown Destination Visitors):**
- Visitor arrives without knowing their destination
- Receptionist determines correct department/employee
- System suggests matching employees based on visitor's purpose
- Receptionist assigns the correct employee
- Creates visit record with the determined employee

**FR-EP-054 (Redirect Wrong Department):**
- If visitor reaches wrong employee, Receptionist may redirect
- Create new visit record for the correct employee
- Update original visit with redirect note

**FR-EP-055 (View Today's Appointments):**
- See all appointments scheduled for today
- Filter by department/employee
- View visitor details
- Track check-in status

#### 4.2.7 Security Officer Features

**FR-EP-060 (Dashboard):**
- Currently checked-in visitors
- Today's check-in/out count
- Pending check-outs
- Visitor items pending verification

**FR-EP-061 (Verify Visitor):**
- Scan/enter appointment code or badge number
- Verify visitor identity against appointment
- View visitor photo and details
- Confirm visitor is expected

**FR-EP-062 (Record Visitor Items):**
- Record each item the visitor brings in:
  - Item name
  - Quantity
  - Serial number/brand
  - Description
- Support multiple items per visitor
- Link items to visit record

**FR-EP-063 (Verify Serial Numbers):**
- During checkout, verify all recorded items against what the visitor has
- Flag any discrepancies
- Record verification status per item

**FR-EP-064 (Check Out Visitor):**
- Verify employee has marked meeting as `Completed`
- Verify all visitor items
- Record check-out time
- Update visit status to `CheckedOut`
- Release badge

**FR-EP-065 (Verify Employee Completed Meeting):**
- Security cannot check out a visitor unless the employee marks the meeting as completed
- System prevents premature checkout with clear error message

### 4.3 Business Rules

**BR-001:** A visitor must register before requesting an appointment.

**BR-002:** Each visitor has one unique profile (identified by email).

**BR-003:** Appointments require explicit employee/department head approval.

**BR-004:** Pending appointments automatically generate reminder notifications 24 hours before the appointment date.

**BR-005:** Employees may approve, reject, cancel, or reschedule appointments targeting them.

**BR-006:** When an employee becomes unavailable (annual leave, medical leave, resignation, business travel), the system shall:
  1. Identify all future appointments for that employee
  2. Mark them as `EmployeeUnavailable`
  3. Notify affected visitors
  4. Allow visitors to book another appointment with a different employee

**BR-007:** Appointments may be marked as `Confidential`. Only CEO and the assigned employee may view confidential appointment details.

**BR-008:** If two employees share the same name and a visitor reaches the wrong person, the employee can redirect the visitor to the correct one.

**BR-009:** The system supports both Known Destination and Unknown Destination visitors:
  - Known: Visitor specifies employee/department
  - Unknown: Receptionist determines the correct destination

**BR-010:** CEO and Department Heads may delegate or redirect appointments to other employees.

**BR-011:** Employees must explicitly mark a meeting as `Completed` before Security can check the visitor out.

**BR-012:** Visitors may bring multiple items. Each item records: name, quantity, serial number/brand, description.

**BR-013:** Security verifies all items during checkout. Any discrepancy shall be flagged.

**BR-014:** Notification channels: Email, SMS, In-App. All channels are supported for appointment lifecycle events.

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|------------|
| NFR-001 | Page load time shall be < 3 seconds on standard broadband connection |
| NFR-002 | API response time shall be < 500ms for 95th percentile |
| NFR-003 | System shall support 200 concurrent users |
| NFR-004 | Database queries shall be optimized with proper indexing |

### 5.2 Security

| ID | Requirement |
|----|------------|
| NFR-010 | All passwords shall be hashed with BCrypt |
| NFR-011 | JWT tokens shall expire in 24 hours |
| NFR-012 | Refresh tokens shall expire in 7 days |
| NFR-013 | All API endpoints (except public ones) shall require JWT authentication |
| NFR-014 | Role-based authorization shall be enforced on both frontend and backend |
| NFR-015 | CORS shall be configured to allow only the frontend origins |
| NFR-016 | Rate limiting shall be applied to authentication endpoints |
| NFR-017 | SQL injection shall be prevented by parameterized queries (EF Core) |
| NFR-018 | XSS shall be prevented by Angular's built-in sanitization |
| NFR-019 | CSRF protection via SameSite cookies and JWT in Authorization header |
| NFR-020 | Audit logs shall record all data-modifying operations |

### 5.3 Reliability

| ID | Requirement |
|----|------------|
| NFR-030 | System shall have 99.5% uptime |
| NFR-031 | Database shall be backed up daily |
| NFR-032 | Failed email/SMS shall be retried up to 10 times |
| NFR-033 | Global exception handling shall prevent application crashes |

### 5.4 Usability

| ID | Requirement |
|----|------------|
| NFR-040 | Responsive design for desktop (1920px), tablet (768px), and mobile (375px) |
| NFR-041 | Consistent UI using Angular Material design system |
| NFR-042 | Loading indicators for all async operations |
| NFR-043 | Toast notifications for success/error/warning feedback |
| NFR-044 | Confirmation dialogs for destructive actions |

### 5.5 Maintainability

| ID | Requirement |
|----|------------|
| NFR-050 | Follow Clean Architecture with clear layer separation |
| NFR-051 | All public APIs shall have Swagger documentation |
| NFR-052 | Code shall follow SOLID principles |
| NFR-053 | Dependency injection shall be used throughout |
| NFR-054 | Automated migrations for database schema changes |

---

## 6. System Architecture Overview

### 6.1 Backend Architecture

```
EcxVisitorManagement/
├── Controllers/          — API endpoints (thin controllers)
├── Data/                 — DbContext, migrations, configuration
├── DTOs/                 — Request/Response DTOs organized by feature
│   ├── Auth/
│   ├── Appointments/
│   ├── Visitors/
│   ├── Employees/
│   ├── Departments/
│   ├── Visits/
│   ├── Users/
│   ├── Notifications/
│   ├── Dashboard/
│   ├── Reports/
│   └── Common/           — ApiResponse, PageRequest, PagedResponse
├── Enums/                — Shared enumerations
├── Extensions/           — Service registration, middleware extensions
├── Helpers/              — JWT helper, file helper, date helper
├── Interfaces/           — Service and repository interfaces
├── Mapping/              — AutoMapper profiles
├── Middleware/            — Exception handling, audit logging, rate limiting
├── Models/               — Entity classes (EF Core)
├── Repositories/         — Repository implementations
│   └── Implementation/
├── Services/             — Business logic services
│   └── Implementation/
├── Validators/           — FluentValidation validators
├── BackgroundServices/   — Email/SMS queue processors, reminder workers
└── Program.cs            — Application entry point
```

### 6.2 Frontend Architecture (Per Portal)

```
ecx-[portal]/
├── src/
│   ├── app/
│   │   ├── core/                    — Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── appointment.model.ts
│   │   │       └── ...
│   │   ├── features/                — Feature modules (lazy-loaded)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── dashboard/
│   │   │   ├── visitors/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── appointments/
│   │   │   ├── visits/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── layouts/                 — Layout components
│   │   │   ├── main-layout/
│   │   │   ├── auth-layout/
│   │   │   └── public-layout/
│   │   ├── shared/                  — Reusable components, pipes, directives
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── _material.scss
│   ├── assets/
│   │   ├── images/
│   │   │   └── ecx-logo.png
│   │   └── fonts/
│   └── index.html
├── angular.json
├── package.json
├── tsconfig.json
└── tsconfig.app.json
```

### 6.3 Dual Application Strategy

Since both Angular applications share the same API and database, they shall be deployed as separate Angular projects:

```
frontend/
├── visitor-portal/     — Public-facing (port 4200)
│   └── src/app/
│       ├── core/
│       ├── features/
│       │   ├── home/
│       │   ├── about/
│       │   ├── contact/
│       │   ├── auth/ (register, login, forgot-password)
│       │   ├── profile/
│       │   ├── appointments/
│       │   └── notifications/
│       ├── layouts/
│       │   ├── public-layout/
│       │   └── visitor-layout/
│       └── shared/
│
└── employee-portal/    — Internal-facing (port 4201)
    └── src/app/
        ├── core/
        ├── features/
        │   ├── auth/ (login)
        │   ├── admin/
        │   ├── ceo/
        │   ├── department-head/
        │   ├── employee/
        │   ├── receptionist/
        │   ├── security/
        │   ├── shared-features/ (common CRUD)
        │   └── notifications/
        ├── layouts/
        │   ├── auth-layout/
        │   └── main-layout/
        └── shared/
```

---

## 7. Database Requirements

### 7.1 Complete Entity List

#### Existing Tables (11)

| Table | Description |
|-------|-------------|
| `users` | System user accounts for authentication |
| `departments` | Organizational departments |
| `employees` | Staff who host visitors |
| `visitors` | External visitors |
| `visits` | Visit lifecycle records |
| `appointments` | Pre-scheduled appointment requests |
| `notifications` | Employee in-app notifications |
| `audit_logs` | Immutable audit trail |
| `employee_schedules` | Weekly availability per employee |
| `email_queue` | Outbound email queue |
| `sms_queue` | Outbound SMS queue |

#### New Tables (8)

| Table | Description |
|-------|-------------|
| `visitor_items` | Physical items brought by visitors during check-in |
| `appointment_attachments` | Files (PDF, images) attached to appointment requests |
| `appointment_comments` | Discussion thread on appointments |
| `employee_unavailability` | Leave, travel, resignation records |
| `reschedule_requests` | Reschedule workflow records |
| `visitor_notifications` | In-app notifications for visitors |
| `refresh_tokens` | JWT refresh token storage |
| `password_reset_tokens` | Password reset flow tokens |

### 7.2 Modified Tables

#### `users` Table Extensions

```sql
-- Add FK to employees (for internal users who are also employees)
ALTER TABLE users ADD COLUMN employee_id INTEGER REFERENCES employees(id);
ALTER TABLE users ADD COLUMN visitor_id INTEGER REFERENCES visitors(id);
CREATE UNIQUE INDEX uq_users_employee ON users(employee_id) WHERE employee_id IS NOT NULL;
CREATE UNIQUE INDEX uq_users_visitor ON users(visitor_id) WHERE visitor_id IS NOT NULL;

-- Expand role enum
ALTER TYPE user_role ADD VALUE 'CEO';
ALTER TYPE user_role ADD VALUE 'DepartmentHead';
ALTER TYPE user_role ADD VALUE 'Employee';
```

#### `employees` Table Extensions

```sql
-- Link to user account (1:1)
ALTER TABLE employees ADD COLUMN user_id INTEGER REFERENCES users(id);
CREATE UNIQUE INDEX uq_employees_user ON employees(user_id) WHERE user_id IS NOT NULL;
```

#### `appointments` Table Extensions

```sql
ALTER TABLE appointments ADD COLUMN is_confidential BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE appointments ADD COLUMN delegated_to_employee_id INTEGER REFERENCES employees(id);
ALTER TABLE appointments ADD COLUMN original_employee_id INTEGER REFERENCES employees(id);
ALTER TABLE appointments ADD COLUMN redirect_department_id INTEGER REFERENCES departments(id);
ALTER TABLE appointments ADD COLUMN rejection_reason TEXT;
ALTER TABLE appointments ADD COLUMN notes TEXT;
ALTER TABLE appointments ADD COLUMN attachment_url TEXT;
```

#### `visits` Table Extensions

```sql
ALTER TABLE visits ADD COLUMN appointment_id INTEGER REFERENCES appointments(id);
```

#### `notifications` Table Extensions

```sql
ALTER TABLE notifications ADD COLUMN visitor_id INTEGER REFERENCES visitors(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN channel notification_channel NOT NULL DEFAULT 'InApp';
```

### 7.3 New Enum Types

```sql
CREATE TYPE notification_channel AS ENUM ('InApp', 'Email', 'SMS', 'All');
```

### 7.4 New Table Definitions

```sql
-- visitor_items
CREATE TABLE visitor_items (
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

-- appointment_attachments
CREATE TABLE appointment_attachments (
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

-- appointment_comments
CREATE TABLE appointment_comments (
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

-- employee_unavailability
CREATE TABLE employee_unavailability (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    employee_id     INTEGER NOT NULL,
    unavailability_type VARCHAR(50) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    reason          TEXT,
    created_by      INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT pk_employee_unavailability PRIMARY KEY (id),
    CONSTRAINT fk_unavailability_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_unavailability_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT ck_unavailability_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- reschedule_requests
CREATE TABLE reschedule_requests (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY,
    appointment_id      INTEGER NOT NULL,
    requested_by_user_id INTEGER NOT NULL,
    new_date            DATE NOT NULL,
    new_start_time      TIME WITH TIME ZONE NOT NULL,
    new_end_time        TIME WITH TIME ZONE NOT NULL,
    reason              TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'Pending',
    responded_by_user_id INTEGER,
    responded_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_reschedule_requests PRIMARY KEY (id),
    CONSTRAINT fk_reschedule_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_reschedule_requester FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reschedule_responder FOREIGN KEY (responded_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_reschedule_time_order CHECK (new_end_time > new_start_time)
);

-- visitor_notifications
CREATE TABLE visitor_notifications (
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

-- refresh_tokens
CREATE TABLE refresh_tokens (
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
CREATE TABLE password_reset_tokens (
    id              INTEGER GENERATED ALWAYS AS IDENTITY,
    email           VARCHAR(100) NOT NULL,
    token           VARCHAR(500) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uq_reset_token UNIQUE (token)
);
```

---

## 8. API Specification

### 8.1 Base URL

```
Development:  https://localhost:5001/api
Production:   https://api.ecx-vms.et/api
```

### 8.2 Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | No | Login (employee or visitor) |
| `/api/auth/register-visitor` | POST | No | Visitor registration |
| `/api/auth/forgot-password` | POST | No | Request password reset |
| `/api/auth/reset-password` | POST | No | Reset password with token |
| `/api/auth/change-password` | POST | Yes | Change password (authenticated) |
| `/api/auth/refresh-token` | POST | No | Refresh JWT token |
| `/api/auth/logout` | POST | Yes | Revoke refresh token |

### 8.3 Visitors

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/visitors` | GET | Yes | Admin, Receptionist, Security | List visitors (paged) |
| `/api/visitors/{id}` | GET | Yes | Admin, Receptionist, Security, Owner | Get visitor by ID |
| `/api/visitors` | POST | Yes | Admin, Receptionist | Create visitor |
| `/api/visitors/{id}` | PUT | Yes | Admin, Owner | Update visitor |
| `/api/visitors/{id}` | DELETE | Yes | Admin | Soft-delete visitor |
| `/api/visitors/{id}/photo` | POST | Yes | Admin, Owner | Upload profile photo |
| `/api/visitors/{id}/items` | GET | Yes | Security, Admin | Get visitor items |
| `/api/visitors/search` | GET | Yes | Admin, Receptionist | Search visitors |

### 8.4 Employees

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/employees` | GET | Yes | All authenticated | List employees (paged) |
| `/api/employees/{id}` | GET | Yes | All authenticated | Get employee by ID |
| `/api/employees` | POST | Yes | Admin | Create employee |
| `/api/employees/{id}` | PUT | Yes | Admin | Update employee |
| `/api/employees/{id}` | DELETE | Yes | Admin | Delete employee |
| `/api/employees/{id}/schedule` | GET | Yes | Admin, Owner | Get employee schedule |
| `/api/employees/{id}/schedule` | PUT | Yes | Admin, Owner | Update employee schedule |
| `/api/employees/{id}/unavailability` | GET | Yes | Admin, DeptHead | Get unavailability |
| `/api/employees/{id}/unavailability` | POST | Yes | Admin, DeptHead | Mark employee unavailable |
| `/api/employees/available` | GET | Yes | Receptionist, Visitor | List available employees |

### 8.5 Appointments

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/appointments` | GET | Yes | All authenticated | List appointments (paged) |
| `/api/appointments/{id}` | GET | Yes | All authorized | Get appointment by ID |
| `/api/appointments` | POST | Yes | Visitor, Admin | Create appointment |
| `/api/appointments/{id}/approve` | POST | Yes | Employee, DeptHead, Admin | Approve appointment |
| `/api/appointments/{id}/reject` | POST | Yes | Employee, DeptHead, Admin | Reject appointment |
| `/api/appointments/{id}/cancel` | POST | Yes | Visitor (own), Admin | Cancel appointment |
| `/api/appointments/{id}/complete` | POST | Yes | Employee (own) | Complete meeting |
| `/api/appointments/{id}/delegate` | POST | Yes | CEO, DeptHead, Admin | Delegate appointment |
| `/api/appointments/{id}/redirect` | POST | Yes | CEO, DeptHead, Admin, Receptionist | Redirect appointment |
| `/api/appointments/{id}/reschedule` | POST | Yes | Visitor, Employee, DeptHead | Request reschedule |
| `/api/appointments/{id}/reschedule/{reqId}/approve` | POST | Yes | Employee, DeptHead | Approve reschedule |
| `/api/appointments/{id}/confidential` | PATCH | Yes | CEO, Admin | Toggle confidentiality |
| `/api/appointments/{id}/attachments` | GET | Yes | Authorized | List attachments |
| `/api/appointments/{id}/attachments` | POST | Yes | Visitor (own), Admin | Upload attachment |
| `/api/appointments/{id}/comments` | GET | Yes | Authorized | List comments |
| `/api/appointments/{id}/comments` | POST | Yes | Authorized | Add comment |
| `/api/appointments/visitor/{visitorId}` | GET | Yes | Visitor (own), Admin | Get visitor's appointments |
| `/api/appointments/employee/{employeeId}` | GET | Yes | Employee (own), DeptHead, Admin | Get employee's appointments |
| `/api/appointments/pending` | GET | Yes | Employee, DeptHead, Admin | Get pending appointments |
| `/api/appointments/today` | GET | Yes | Receptionist, Security, Admin | Get today's appointments |

### 8.6 Visits

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/visits` | GET | Yes | Admin, Receptionist, Security | List visits (paged) |
| `/api/visits/{id}` | GET | Yes | All authorized | Get visit by ID |
| `/api/visits` | POST | Yes | Receptionist, Admin | Create visit (walk-in) |
| `/api/visits/check-in` | POST | Yes | Receptionist | Check in visitor |
| `/api/visits/{id}/check-out` | POST | Yes | Security | Check out visitor |
| `/api/visits/{id}/cancel` | POST | Yes | Admin | Cancel visit |
| `/api/visits/{id}/items` | GET | Yes | Security | Get visit items |
| `/api/visits/{id}/items` | POST | Yes | Security | Add visitor item |
| `/api/visits/{id}/items/verify` | POST | Yes | Security | Verify items |
| `/api/visits/today` | GET | Yes | Receptionist, Security | Today's visits |
| `/api/visits/active` | GET | Yes | Security, Admin | Active (checked-in) visits |

### 8.7 Departments

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/departments` | GET | Yes | All authenticated | List departments |
| `/api/departments/{id}` | GET | Yes | All authenticated | Get department by ID |
| `/api/departments` | POST | Yes | Admin | Create department |
| `/api/departments/{id}` | PUT | Yes | Admin | Update department |
| `/api/departments/{id}` | DELETE | Yes | Admin | Delete department |
| `/api/departments/{id}/stats` | GET | Yes | Admin, DeptHead | Department statistics |

### 8.8 Users

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/users` | GET | Yes | Admin | List users |
| `/api/users/{id}` | GET | Yes | Admin | Get user by ID |
| `/api/users` | POST | Yes | Admin | Create user |
| `/api/users/{id}` | PUT | Yes | Admin | Update user |
| `/api/users/{id}` | DELETE | Yes | Admin | Delete user |
| `/api/users/{id}/activate` | PATCH | Yes | Admin | Activate user |
| `/api/users/{id}/deactivate` | PATCH | Yes | Admin | Deactivate user |
| `/api/users/{id}/reset-password` | POST | Yes | Admin | Reset user password |

### 8.9 Notifications

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/notifications` | GET | Yes | All authenticated | List notifications |
| `/api/notifications/{id}` | GET | Yes | Owner | Get notification |
| `/api/notifications/unread` | GET | Yes | All authenticated | Get unread count |
| `/api/notifications/{id}/read` | POST | Yes | Owner | Mark as read |
| `/api/notifications/read-all` | POST | Yes | All authenticated | Mark all read |
| `/api/notifications/{id}` | DELETE | Yes | Owner | Delete notification |
| `/api/visitor-notifications` | GET | Yes | Visitor (own) | Visitor notifications |
| `/api/visitor-notifications/unread` | GET | Yes | Visitor (own) | Visitor unread count |
| `/api/visitor-notifications/{id}/read` | POST | Yes | Visitor (own) | Mark as read |

### 8.10 Dashboard

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/dashboard/stats` | GET | Yes | All authenticated | General dashboard stats |
| `/api/dashboard/admin` | GET | Yes | Admin | Admin-specific dashboard |
| `/api/dashboard/ceo` | GET | Yes | CEO | CEO-specific dashboard |
| `/api/dashboard/department-head/{deptId}` | GET | Yes | DeptHead | Department head dashboard |
| `/api/dashboard/employee/{empId}` | GET | Yes | Employee (own) | Employee dashboard |
| `/api/dashboard/receptionist` | GET | Yes | Receptionist | Receptionist dashboard |
| `/api/dashboard/security` | GET | Yes | Security | Security dashboard |

### 8.11 Reports

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/reports/visitors` | GET | Yes | Admin, DeptHead | Visitor reports |
| `/api/reports/appointments` | GET | Yes | Admin, DeptHead | Appointment reports |
| `/api/reports/departments` | GET | Yes | Admin, CEO | Department reports |
| `/api/reports/employees` | GET | Yes | Admin, CEO | Employee reports |
| `/api/reports/export/pdf` | GET | Yes | Admin | Export report as PDF |
| `/api/reports/export/excel` | GET | Yes | Admin | Export report as Excel |

### 8.12 File Upload

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/upload/photo` | POST | Yes | Admin, Owner | Upload photo |
| `/api/upload/attachment` | POST | Yes | Visitor, Admin | Upload attachment |

### 8.13 Search

| Endpoint | Method | Auth | Roles | Description |
|----------|--------|------|-------|-------------|
| `/api/search/global` | GET | Yes | All authenticated | Global search |
| `/api/search/visitors` | GET | Yes | Admin, Receptionist | Search visitors |
| `/api/search/employees` | GET | Yes | All authenticated | Search employees |

---

## 9. Frontend Requirements

### 9.1 Visitor Portal Pages

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Landing/Home | `/` | No | ECX landing page |
| About ECX | `/about` | No | About page |
| Contact | `/contact` | No | Contact page |
| Register | `/auth/register` | No | Visitor registration |
| Login | `/auth/login` | No | Visitor login |
| Forgot Password | `/auth/forgot-password` | No | Password reset request |
| Reset Password | `/auth/reset-password` | No | Password reset form |
| Profile | `/profile` | Yes | View/edit profile |
| Profile Photo | `/profile/photo` | Yes | Upload photo |
| Appointments | `/appointments` | Yes | List own appointments |
| New Appointment | `/appointments/new` | Yes | Request appointment |
| Appointment Detail | `/appointments/:id` | Yes | View appointment |
| Notifications | `/notifications` | Yes | Notification center |

### 9.2 Employee Portal Pages

| Page | Route | Auth | Roles | Description |
|------|-------|------|-------|-------------|
| Login | `/auth/login` | No | — | Employee login |
| Forgot Password | `/auth/forgot-password` | No | — | Password reset |
| **Admin** | | | | |
| Dashboard | `/admin/dashboard` | Yes | Admin | Admin dashboard |
| Calendar | `/admin/calendar` | Yes | Admin | System calendar |
| Manage Employees | `/admin/employees` | Yes | Admin | CRUD employees |
| Manage Visitors | `/admin/visitors` | Yes | Admin | CRUD visitors |
| Manage Departments | `/admin/departments` | Yes | Admin | CRUD departments |
| Manage Users | `/admin/users` | Yes | Admin | CRUD users |
| Manage Appointments | `/admin/appointments` | Yes | Admin | All appointments |
| Reports | `/admin/reports` | Yes | Admin | Reports & analytics |
| Settings | `/admin/settings` | Yes | Admin | System settings |
| **CEO** | | | | |
| Dashboard | `/ceo/dashboard` | Yes | CEO | Executive dashboard |
| Calendar | `/ceo/calendar` | Yes | CEO | Calendar |
| Appointments | `/ceo/appointments` | Yes | CEO | All appointments (incl. confidential) |
| Departments | `/ceo/departments` | Yes | CEO | Department stats |
| Reports | `/ceo/reports` | Yes | CEO | Executive reports |
| **Department Head** | | | | |
| Dashboard | `/dept/dashboard` | Yes | DeptHead | Department dashboard |
| Calendar | `/dept/calendar` | Yes | DeptHead | Department calendar |
| Appointments | `/dept/appointments` | Yes | DeptHead | Department appointments |
| Employees | `/dept/employees` | Yes | DeptHead | Department employees |
| **Employee** | | | | |
| Dashboard | `/emp/dashboard` | Yes | Employee | Personal dashboard |
| Calendar | `/emp/calendar` | Yes | Employee | Personal calendar |
| Appointments | `/emp/appointments` | Yes | Employee | My appointments |
| History | `/emp/history` | Yes | Employee | Appointment history |
| **Receptionist** | | | | |
| Dashboard | `/reception/dashboard` | Yes | Receptionist | Reception dashboard |
| Check In | `/reception/check-in` | Yes | Receptionist | Check in visitor |
| Walk-In | `/reception/walk-in` | Yes | Receptionist | Register walk-in |
| Today's Appointments | `/reception/today` | Yes | Receptionist | Today's schedule |
| Visitors | `/reception/visitors` | Yes | Receptionist | Visitor list |
| **Security** | | | | |
| Dashboard | `/security/dashboard` | Yes | Security | Security dashboard |
| Verify Visitor | `/security/verify` | Yes | Security | Verify visitor |
| Check Out | `/security/check-out` | Yes | Security | Check out visitor |
| Active Visitors | `/security/active` | Yes | Security | Currently on premises |
| **Shared** | | | | |
| Notifications | `/notifications` | Yes | All | Notification center |
| Profile | `/profile` | Yes | All | User profile |
| Change Password | `/change-password` | Yes | All | Change password |

### 9.3 Angular Material Components Required

| Component | Usage |
|-----------|-------|
| MatToolbar | Navigation bars |
| MatSidenav | Sidebar navigation |
| MatCard | Dashboard cards, KPIs |
| MatTable | Data tables with sort/pagination |
| MatPaginator | Table pagination |
| MatSort | Table sorting |
| MatFormField | Form fields |
| MatInput | Text inputs |
| MatSelect | Dropdowns |
| MatDatepicker | Date selection |
| MatButton | Actions |
| MatIcon | Icons |
| MatMenu | Dropdown menus |
| MatTabs | Tabbed views |
| MatChip | Filter chips |
| MatBadge | Notification badges |
| MatSnackBar | Toast notifications |
| MatDialog | Modal dialogs |
| MatTooltip | Tooltips |
| MatProgressBar | Loading indicators |
| MatStepper | Multi-step forms |
| MatExpansionPanel | Collapsible sections |
| MatList | Lists |
| MatCheckbox | Checkboxes |
| MatRadio | Radio buttons |
| MatSlideToggle | Toggle switches |
| MatAvatar | User avatars |
| MatCalendar | Calendar widget |
| MatChart | Charts (via ng2-charts) |

### 9.4 Shared Reusable Components

| Component | Description |
|-----------|-------------|
| `DataTableComponent` | Generic table with sort, filter, pagination, columns config |
| `StatCardComponent` | KPI card with icon, value, label, trend |
| `ConfirmDialogComponent` | Confirmation modal with customizable message |
| `FileUploadComponent` | Drag-and-drop file upload with preview |
| `SearchBarComponent` | Global search with debounced input |
| `CalendarViewComponent` | Monthly/weekly calendar with event rendering |
| `NotificationBellComponent` | Bell icon with unread count badge |
| `StatusBadgeComponent` | Colored status indicator |
| `LoadingSpinnerComponent` | Full-page or inline loading indicator |
| `EmptyStateComponent` | No-data illustration |
| `BreadcrumbsComponent` | Page breadcrumb navigation |
| `PageHeaderComponent` | Page title with actions slot |

---

## 10. Security Requirements

### 10.1 Authentication

- JWT Bearer token authentication
- Access token expiry: 24 hours
- Refresh token expiry: 7 days
- BCrypt password hashing (12 rounds)
- Account lockout after 5 failed login attempts (15-minute window)
- Password reset tokens expire after 1 hour

### 10.2 Authorization

- Role-based access control (RBAC) on all endpoints
- Frontend route guards based on user role
- API endpoint authorization using `[Authorize(Roles = "...")]`
- Policy-based authorization for complex rules (e.g., "only appointment owner can cancel")

### 10.3 Data Protection

- HTTPS enforced in production
- Sensitive data (passwords, tokens) never logged
- CORS restricted to known frontend origins
- SQL injection prevented by EF Core parameterized queries
- XSS prevented by Angular's built-in DOM sanitization
- File upload validation: type, size, name sanitization

### 10.4 Audit

- All data-modifying operations recorded in `audit_logs`
- Audit entries include: user, action, entity, old/new values, IP, user agent
- Audit logs are append-only (no updates or deletes)

---

## 11. Appendices

### Appendix A: Phase Execution Plan

| Phase | Description | Est. Duration |
|-------|------------|---------------|
| 1 | Software Requirements Specification (SRS) | Completed |
| 2 | System Architecture & Project Setup | 2 days |
| 3 | Database Design & Migrations | 2 days |
| 4 | Backend Project Structure | 1 day |
| 5 | API Development (Core) | 5 days |
| 6 | Angular Visitor Portal | 4 days |
| 7 | Angular Employee Portal | 5 days |
| 8 | Authentication & Authorization | 3 days |
| 9 | Notifications (Email, SMS, In-App) | 2 days |
| 10 | Reports & Dashboard | 3 days |
| 11 | Testing (Unit, Integration, E2E) | 3 days |
| 12 | Deployment & DevOps | 2 days |
| **Total** | | **~32 days** |

### Appendix B: Technology Versions

| Technology | Version |
|------------|---------|
| .NET | 10.0 |
| ASP.NET Core | 10.0 |
| Entity Framework Core | 10.0.9 |
| PostgreSQL (Npgsql) | 10.0.2 |
| Angular | 22.0 |
| Angular Material | 22.0 |
| TypeScript | 6.0 |
| BCrypt.Net-Next | 4.2.0 |
| AutoMapper | 12.0.1 |
| FluentValidation | 11.3.1 |
| Swagger/OpenAPI | 10.0.8 |

### Appendix C: Seed Data Requirements

The following seed data shall be created for development/testing:

1. **10 Departments** (existing seed)
2. **6 User roles** with sample users:
   - Admin (1)
   - CEO (1)
   - Department Heads (3)
   - Employees (5)
   - Receptionist (1)
   - Security Officer (1)
3. **10 Employees** (existing seed, expanded with user_id links)
4. **5 Visitors** (existing seed)
5. **15 Appointments** (various statuses)
6. **10 Visits** (various statuses)
7. **Employee schedules** (Mon-Fri for all)
8. **Sample notifications**
9. **Sample audit logs**

### Appendix D: Notification Matrix

| Event | Email | SMS | In-App (Employee) | In-App (Visitor) |
|-------|-------|-----|-------------------|-------------------|
| Appointment Requested | ✅ | ✅ | ✅ | ✅ (Confirmation) |
| Appointment Approved | ✅ | ✅ | ✅ | ✅ |
| Appointment Rejected | ✅ | ✅ | ✅ | ✅ |
| Appointment Cancelled | ✅ | ✅ | ✅ | ✅ |
| Appointment Rescheduled | ✅ | ✅ | ✅ | ✅ |
| Reminder (24h before) | ✅ | ✅ | ✅ | ✅ |
| Employee Unavailable | ✅ | ✅ | — | ✅ |
| Delegated/Redirected | ✅ | ✅ | ✅ | ✅ |
| Meeting Completed | — | — | — | ✅ |

### Appendix E: Status Flow Diagrams

#### Appointment Status Flow

```
                    ┌──────────┐
                    │  Pending  │
                    └────┬─────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
      ┌─────▼──────┐ ┌──▼───────┐ ┌──▼──────────────┐
      │  Approved   │ │ Rejected │ │EmployeeUnavailable│
      └─────┬──────┘ └──────────┘ └─────────────────┘
            │
   ┌────────┼────────┐
   │        │        │
┌──▼────┐ ┌─▼────────┐ ┌▼──────────┐
│Completed│ │Cancelled │ │Rescheduled│
└───────┘ └──────────┘ └───────────┘
```

#### Visit Status Flow

```
     ┌──────────┐
     │ Scheduled │
     └────┬─────┘
          │
    ┌─────▼─────┐
    │ CheckedIn  │
    └─────┬─────┘
          │
    ┌─────▼──────┐
    │ CheckedOut  │
    └────────────┘
```

---

**End of SRS Document**
