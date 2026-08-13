# Software Requirements Specification (SRS)

## ECX Visitor Management System (VMS)

**Version:** 3.0
**Date:** August 8, 2026
**Organization:** Ethiopia Commodity Exchange (ECX)
**Prepared by:** Software Architecture Team
**Status:** FINAL — reflects the fully implemented system

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Implemented System Overview](#3-implemented-system-overview)
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

This Software Requirements Specification (SRS) documents the **ECX Visitor Management System (VMS)** — an enterprise-grade, dual-portal web application that manages visitor reception, appointment scheduling, employee-visitor interactions, property tracking, and security check-in/check-out at Ethiopia Commodity Exchange (ECX).

This document is the authoritative reference for the implemented system and aligns with the live PostgreSQL schema, the ASP.NET Core Web API, and both Angular portals.

### 1.2 Scope

The system consists of:

- **Public Visitor Portal** — external-facing Angular application for visitors to register, manage profiles, request appointments, and receive notifications.
- **Employee Portal** — internal Angular application for ECX staff (Admin, CEO, Department Head, Employee, Receptionist, Security Officer) with role-based dashboards and operations.
- **Shared ASP.NET Core Web API** — a single backend serving both portals with JWT authentication, refresh tokens, and role-based authorization.
- **PostgreSQL Database** — a fully normalized, indexed database with audit trails (21 data tables).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| VMS | Visitor Management System |
| ECX | Ethiopia Commodity Exchange |
| SRS | Software Requirements Specification |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| SPA | Single Page Application |
| API | Application Programming Interface |
| EF Core | Entity Framework Core |
| KPI | Key Performance Indicator |
| ASPR | Appointment Support Property Report |

### 1.4 References

- PostgreSQL 15+ Documentation
- ASP.NET Core 10 (.NET 10) Documentation
- Angular 22 Documentation
- ECX Organizational Structure Document
- Visitor Management Best Practices (Industry Standards)
- `docs/database_documentation.md` — current database schema
- `docs/INTEGRATION_AUDIT_REPORT.md` — endpoint/field alignment audit

---

## 2. Overall Description

### 2.1 Product Perspective

The ECX VMS is an enterprise application following Clean Architecture principles with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Visitor Portal   │    │  Employee Portal  │          │
│  │  (Angular 22)     │    │  (Angular 22)     │          │
│  └────────┬─────────┘    └────────┬─────────┘          │
│           │  :4200               │  :4201              │
│           └───────────┬───────────┘                     │
│                       │   http://localhost:5281/api     │
├───────────────────────┼─────────────────────────────────┤
│                 API GATEWAY (JWT)                        │
├───────────────────────┼─────────────────────────────────┤
│                  BACKEND LAYER                          │
│  ┌──────────────────────────────────────┐               │
│  │     ASP.NET Core Web API (.NET 10)   │               │
│  │  13 Controllers · Services · Repos   │               │
│  │  Background: Email/SMS/Reminder      │               │
│  └──────────────────────────────────────┘               │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                           │
│  ┌──────────────────────────────────────┐               │
│  │       PostgreSQL 15 Database         │               │
│  │       21 tables · EF Core 10         │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 User Classes and Characteristics

| Role | Portal | Access Level | Description |
|------|--------|-------------|-------------|
| **Visitor** | Public | Self-service | Registers, requests appointments, manages profile, reschedules |
| **Admin** | Employee | Full system access | Manages all entities, users, reports, configuration |
| **CEO** | Employee | Executive access | Views all appointments incl. confidential, delegates, redirects |
| **Department Head** | Employee | Department-level | Manages department appointments, employees, approvals |
| **Employee** | Employee | Individual-level | Manages own appointments, calendar, unavailability |
| **Receptionist** | Employee | Front desk | Walk-in registration, check-in, visitor guidance |
| **Security Officer** | Employee | Security checkpoint | Visitor verification, property verification, item tracking, checkout |

### 2.3 Operating Environment

- **Frontend:** Angular 22, TypeScript 6.0.2, Angular Material 22, Node.js 20+
- **Backend:** ASP.NET Core 10, .NET 10 SDK, EF Core 10.0.9, Npgsql
- **Database:** PostgreSQL 15+ (db: `visitormanagement`)
- **Deployment:** IIS/Kestrel; ports: visitor portal 4200, employee portal 4201, API 5281

### 2.4 Design and Implementation Constraints

1. `EcxVisitorManagement` namespace and project structure
2. EF Core migrations manage the schema (9 applied migrations)
3. snake_case database identifiers
4. Data Annotations on models + Fluent API in `AppDbContext`
5. Angular standalone components
6. Responsive design (desktop, tablet, mobile)
7. `ApiResponse<T>` envelope and `PagedResponse<T>` pagination on all endpoints

---

## 3. Implemented System Overview

> Previous versions of this document contained a "Current State & Gap Analysis" section describing planned work. **All critical gaps have been closed.** This section describes what is actually implemented and running.

### 3.1 Backend (ASP.NET Core) — Complete

| Component | Status | Details |
|-----------|--------|---------|
| Models | ✅ Complete | 21 data entities + `Enums.cs` |
| DbContext | ✅ Complete | `AppDbContext` with all DbSets and Fluent API |
| Controllers | ✅ Complete | 13 controllers (see §8) |
| Services | ✅ Complete | Auth, Appointment, Visitor, Employee, Department, User, Notification, Visit, Dashboard, Report services |
| Repositories | ✅ Complete | GenericRepository + feature repositories |
| DTOs | ✅ Complete | Feature-organized request/response DTOs |
| JWT Auth | ✅ Complete | Access + refresh tokens, password reset, change password |
| Background Services | ✅ Complete | `EmailQueueProcessor`, `SmsQueueProcessor`, `AppointmentReminderService` |
| Middleware | ✅ Complete | Exception handling, audit logging |
| AutoMapper | ✅ Complete | MappingProfile configured |
| FluentValidation | ✅ Complete | Validators configured |
| Swagger/OpenAPI | ✅ Complete | API documentation |

### 3.2 Frontend (Angular) — Complete

| Portal | Status | Details |
|--------|--------|---------|
| Visitor Portal | ✅ Complete | `frontend/` on port 4200 — home, about, contact, auth, profile, appointments, visits, notifications |
| Employee Portal | ✅ Complete | `frontend-employee/` on port 4201 — role-based dashboards, appointments, calendar, visits, verify, check-out, reports, settings |
| Auth Guards | ✅ Complete | `authGuard`, `guestGuard` (visitor); `AuthGuard`, `RoleGuard`, `GuestGuard` (employee) |
| Interceptors | ✅ Complete | Auth + error interceptors |
| State | ✅ Complete | Service-based state, localStorage token persistence |

### 3.3 Database — Complete

The live schema contains **21 data tables** (verified against PostgreSQL `information_schema` and the EF model snapshot):

| # | Table | Purpose |
|---|-------|---------|
| 1 | `users` | Authentication accounts (7 roles) |
| 2 | `departments` | Organizational departments |
| 3 | `employees` | Staff who host visitors (linked to users) |
| 4 | `visitors` | External visitors (linked to users) |
| 5 | `visits` | Visit lifecycle records |
| 6 | `appointments` | Pre-scheduled appointment requests |
| 7 | `notifications` | Employee in-app notifications |
| 8 | `audit_logs` | Immutable audit trail |
| 9 | `employee_schedules` | Weekly availability per employee |
| 10 | `email_queue` | Outbound email queue |
| 11 | `sms_queue` | Outbound SMS queue |
| 12 | `visitor_items` | Physical items brought by visitors |
| 13 | `checkout_items` | Items returned/checked at checkout |
| 14 | `appointment_properties` | Property items attached to appointments |
| 15 | `appointment_attachments` | Files attached to appointment requests |
| 16 | `appointment_comments` | Discussion thread on appointments |
| 17 | `employee_unavailability` | Leave/travel/resignation records |
| 18 | `reschedule_requests` | Reschedule workflow records |
| 19 | `visitor_notifications` | In-app notifications for visitors |
| 20 | `refresh_tokens` | JWT refresh token storage |
| 21 | `password_reset_tokens` | Password reset flow tokens |

### 3.4 Enum Values (as implemented in `Models/Enums.cs`)

```
UserRole:            Admin, CEO, DepartmentHead, Employee, Receptionist, Security, Visitor
EmployeeStatus:      Active, Inactive, OnLeave
VisitStatus:         Scheduled, CheckedIn, CheckedOut, Cancelled
AppointmentStatus:   Pending, Approved, Rejected, Cancelled, Completed, EmployeeUnavailable, Rescheduled, Delegated
NotificationType:    Info, Warning, Reminder, Alert
NotificationPriority: Low, Normal, High, Urgent
QueueStatus:         Pending, Sent, Failed, Cancelled
NotificationChannel: InApp, Email, SMS, All
UnavailabilityType:  AnnualLeave, MedicalLeave, BusinessTravel, Resignation, Suspension, Other
RescheduleStatus:    Pending, Approved, Rejected, Expired
```

---

## 4. Functional Requirements

### 4.1 Visitor Portal (Application 1)

#### 4.1.1 ECX Landing Page

**FR-VP-001:** The system displays a public landing page with ECX logo, about section, and contact information.
**FR-VP-002:** Navigation to: Home, About, Contact, Register, Login.
**FR-VP-003:** About page shows ECX mission, vision, and key facts.
**FR-VP-004:** Contact page shows ECX address, phones, email, and a contact form.

#### 4.1.2 Visitor Registration

**FR-VP-010:** Visitors register with: full name, phone, email, password, address, national ID (optional), organization (optional), gender.
**FR-VP-011:** Registration creates both a `visitor` record and a `user` record with role `Visitor`; the two are linked via `users.visitor_id`.
**FR-VP-012:** Email uniqueness is validated during registration.
**FR-VP-013:** Welcome email/SMS is queued via `email_queue`/`sms_queue`.
**FR-VP-014:** Passwords are hashed with BCrypt before storage.
**FR-VP-015:** Registration logs the visitor in and redirects to the dashboard.

#### 4.1.3 Visitor Login

**FR-VP-020:** Authentication via email + password (`POST /api/auth/login`).
**FR-VP-021:** Returns a JWT access token and refresh token.
**FR-VP-022:** Clear error messages for invalid credentials and deactivated accounts.
**FR-VP-023:** `last_login` timestamp tracked.

#### 4.1.4 Forgot Password

**FR-VP-025:** Visitors request a password reset via email (`POST /api/auth/forgot-password`).
**FR-VP-026:** A time-limited reset token (1 hour) is stored in `password_reset_tokens`.
**FR-VP-027:** The reset link is sent via email queue.
**FR-VP-028:** New password set via `POST /api/auth/reset-password`.

#### 4.1.5 Visitor Profile

**FR-VP-030:** Visitors view/edit their profile (`GET/PUT /api/visitors/me`).
**FR-VP-031:** Profile photo upload (max 5MB, jpg/jpeg/png/gif/webp) via `POST /api/visitors/me/photo`.
**FR-VP-032:** Profile changes update the `visitors` table.
**FR-VP-033:** Password change from profile page (`POST /api/auth/change-password`).

#### 4.1.6 Request Appointment

**FR-VP-040:** Visitors select an employee or department to request an appointment.
**FR-VP-041:** Form includes target, date, start/end time, purpose, and optional supporting letter attachment.
**FR-VP-042:** Appointment code generated for each request.
**FR-VP-043:** New appointments default to `Pending` status.
**FR-VP-044:** Appointment method is recorded: `ScheduleMyself` (visitor books directly) or `ReceptionAssistance`.
**FR-VP-045:** Route type recorded: `DirectEmployee` or `Reception`.
**FR-VP-046:** Supporting letter (PDF/image, up to 10MB) may be uploaded; stored on the appointment row (`attachment_*` columns) and retrievable via `GET /api/appointments/{id}/supporting-letter`.
**FR-VP-047:** Visitor may declare property items (`has_properties = true` + `property_letter_*` upload).
**FR-VP-048:** Employee receives an in-app notification.

#### 4.1.7 View Appointment Status

**FR-VP-050:** Visitors view all their appointments with current status.
**FR-VP-051:** Statuses: Pending, Approved, Rejected, Cancelled, Completed, EmployeeUnavailable, Rescheduled, Delegated.
**FR-VP-052:** Appointment code shown for reception reference.
**FR-VP-053:** Confidential appointments hidden from non-CEO/non-owner roles.

#### 4.1.8 Cancel Appointment

**FR-VP-055:** Visitors cancel appointments with status `Pending` or `Approved` (`POST /api/appointments/{id}/cancel`).
**FR-VP-056:** Status updated to `Cancelled`; employee notified.

#### 4.1.9 Request Reschedule

**FR-VP-060:** Visitors request rescheduling of approved/pending appointments (`POST /api/appointments/{id}/reschedule`).
**FR-VP-061:** A `reschedule_requests` row is created (status `Pending`).
**FR-VP-062:** Target employee notified.

#### 4.1.10 Visitor Notifications

**FR-VP-070:** In-app notification center (`GET /api/notifications/visitor/{visitorId}`).
**FR-VP-071:** Notifications stored in `visitor_notifications`.
**FR-VP-072:** Unread count in header (`GET /api/notifications/visitor/{visitorId}/unread/count`).
**FR-VP-073:** Mark read / read-all actions.

### 4.2 Employee Portal (Application 2)

#### 4.2.1 Authentication & Authorization

**FR-EP-001:** All employee portal pages require JWT authentication.
**FR-EP-002:** Role-based access on frontend (`RoleGuard`) and backend (`[Authorize(Roles=...)]`).
**FR-EP-003:** Six employee-facing roles: Admin, CEO, Department Head, Employee, Receptionist, Security Officer.
**FR-EP-004:** Each role has a distinct sidebar menu and route set.

#### 4.2.2 Administrator Features

**FR-EP-010 (Dashboard `GET /api/dashboard/admin`):** total visitors, active/pending appointments, checked-in visitors, department/employee counts, recent activity.
**FR-EP-011 (Calendar):** monthly view with color-coded appointments; `GET /api/appointments`.
**FR-EP-012 (Manage Employees):** CRUD, department assignment, status, schedules (`PUT /api/employees/{id}/schedule`), unavailability.
**FR-EP-013 (Manage Visitors):** list, search, view detail, activate/deactivate.
**FR-EP-014 (Manage Departments):** CRUD (`Admin` only), stats per department.
**FR-EP-015 (Manage Users):** CRUD, role assignment, activate/deactivate, reset password (`Admin` only).
**FR-EP-016 (Manage Appointments):** all appointments system-wide, filter, confidential override.
**FR-EP-017 (Reports & Analytics):** visitor/appointment/department/employee reports + Excel export.
**FR-EP-018 (Search):** global search across visitors and employees (`GET /api/search`).

#### 4.2.3 CEO Features

**FR-EP-020 (Dashboard `GET /api/dashboard/ceo`):** executive KPIs, confidential appointments, delegation activity.
**FR-EP-021 (Confidential Appointments):** CEO/Admin/DeptHead may list confidential appointments (`GET /api/appointments/confidential`).
**FR-EP-022 (Delegate/Redirect):** `POST /api/appointments/{id}/delegate`, `POST /api/appointments/{id}/redirect`, `POST /api/appointments/{id}/redirect-department` (Admin/CEO), `POST /api/appointments/{id}/assign-employee` (Admin/CEO/DeptHead).
**FR-EP-023 (Department Statistics):** department list + stats.

#### 4.2.4 Department Head Features

**FR-EP-030 (Dashboard `GET /api/dashboard/department-head`):** department KPIs scoped to the head's department.
**FR-EP-031 (Approve/Reject Appointments):** `POST /api/appointments/{id}/approve|reject` for department appointments.
**FR-EP-032 (Assign Appointments):** assign to employees within the department.
**FR-EP-033 (Calendar):** department-wide calendar; `GET /api/appointments/by-department/{departmentId}`.

#### 4.2.5 Employee Features

**FR-EP-040 (Dashboard `GET /api/dashboard/employee`):** personal KPIs, today's appointments, upcoming.
**FR-EP-041 (Calendar):** personal calendar.
**FR-EP-042 (Manage Appointments):** approve/reject/cancel/complete; pending list `GET /api/appointments/pending`; today's `GET /api/appointments/today`.
**FR-EP-043 (Appointment History):** via appointment list.
**FR-EP-044 (Notifications):** in-app center, mark read/read-all.

#### 4.2.6 Receptionist Features

**FR-EP-050 (Dashboard `GET /api/dashboard/receptionist`):** today's expected, walk-ins, pending check-ins.
**FR-EP-051 (Register Walk-In):** create visit (`POST /api/visits`).
**FR-EP-052 (Check In Visitor):** `POST /api/visits/check-in` — records badge, security officer, destination known flag.
**FR-EP-053 (Unknown Destination):** `isDestinationKnown=false` visit, later redirected with `redirectNote`.
**FR-EP-054 (Today's Appointments):** `GET /api/visits/reception-today` and `GET /api/appointments/today`.

#### 4.2.7 Security Officer Features

**FR-EP-060 (Dashboard `GET /api/dashboard/security`):** checked-in visitors, pending verifications.
**FR-EP-061 (Verify Visitor):** `security/verify` page — search visitor by appointment code/badge.
**FR-EP-062 (Record Visitor Items):** `POST /api/visits/{id}/items` — item name, quantity, serial number, brand, description.
**FR-EP-063 (Verify Property Items):** `GET /api/appointments/property-verifications`, `GET /api/appointments/property-verifications/verified`, `POST /api/appointments/{id}/verify-properties`, `POST /api/appointments/{id}/save-property-verification`.
**FR-EP-064 (Check Out Visitor):** `POST /api/visits/{id}/check-out` — records checkout items, verifies items (`POST /api/visits/{id}/items/verify`), returns property items (`GET /api/visits/{id}/checkout-items`).
**FR-EP-065 (Active Visitors):** `GET /api/visits/active`.

### 4.3 Business Rules

**BR-001:** A visitor must register before requesting an appointment.
**BR-002:** One visitor profile per unique email.
**BR-003:** Appointments require employee/department-head approval.
**BR-004:** Pending appointments generate reminders 24h before via `AppointmentReminderService`.
**BR-005:** Employees may approve, reject, cancel, reschedule, delegate, or redirect appointments targeting them.
**BR-006:** When an employee becomes unavailable, `HandleEmployeeUnavailabilityAsync` marks affected future appointments `EmployeeUnavailable` and notifies visitors.
**BR-007:** Confidential appointments visible only to CEO, Admin, DepartmentHead, and the assigned employee.
**BR-008:** Unknown-destination visitors are flagged (`is_destination_known = false`) and can be redirected with a `redirect_note`.
**BR-009:** CEO/Admin/DeptHead may assign or delegate appointments; delegation preserves `original_employee_id` and sets `delegated_to_employee_id`.
**BR-010:** Security can only check out a visitor after the employee marks the meeting `Completed`.
**BR-011:** Visitor items must be verified before/at checkout; verification status stored per item.
**BR-012:** Property items (`appointment_properties`) track `verification_status` (`Verified` / `Additional Property`), `is_verified`, `verified_by_user_id`, `verified_at`.
**BR-013:** Checkout items (`checkout_items`) record returned property at checkout, linked to visit and optional appointment property.
**BR-014:** Notification channels: InApp, Email, SMS — all supported via queue tables.
**BR-015:** Failed email/SMS retried up to 10 times (`retry_count`), then `PermanentlyFailed` for email.

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|------------|
| NFR-001 | Page load < 3s on standard broadband |
| NFR-002 | API response < 500ms at 95th percentile |
| NFR-003 | 200 concurrent users supported |
| NFR-004 | Indexed queries for all hot paths |

### 5.2 Security

| ID | Requirement |
|----|------------|
| NFR-010 | BCrypt password hashing |
| NFR-011 | JWT access token expiry (implementation-defined, configurable) |
| NFR-012 | Refresh tokens stored hashed/salted in `refresh_tokens`, revoked on logout |
| NFR-013 | All endpoints except `/api/auth/login`, `register-visitor`, `forgot-password`, `reset-password`, `refresh-token` require JWT |
| NFR-014 | RBAC enforced frontend + backend |
| NFR-015 | CORS restricted to `http://localhost:4200`, `http://localhost:4201` |
| NFR-017 | Parameterized queries via EF Core |
| NFR-018 | XSS prevented by Angular sanitization |
| NFR-019 | JWT in Authorization header (no CSRF surface) |
| NFR-020 | Audit logs record all data-modifying operations |

### 5.3 Reliability

| ID | Requirement |
|----|------------|
| NFR-030 | 99.5% uptime target |
| NFR-031 | Daily database backups |
| NFR-032 | Email/SMS retried up to 10 times, then permanently failed |
| NFR-033 | Global exception handling prevents crashes |

### 5.4 Usability

| ID | Requirement |
|----|------------|
| NFR-040 | Responsive: desktop 1920px, tablet 768px, mobile 375px |
| NFR-041 | Angular Material design system |
| NFR-042 | Loading indicators on all async operations |
| NFR-043 | Toast/snackbar feedback |
| NFR-044 | Confirmation dialogs for destructive actions |

### 5.5 Maintainability

| ID | Requirement |
|----|------------|
| NFR-050 | Clean Architecture layer separation |
| NFR-051 | Swagger/OpenAPI documentation |
| NFR-052 | SOLID principles |
| NFR-053 | Dependency injection throughout |
| NFR-054 | Automated EF Core migrations |

---

## 6. System Architecture Overview

### 6.1 Backend Architecture

```
EcxVisitorManagement/
├── Authentication/        — JWT helpers, refresh token services
├── BackgroundServices/    — EmailQueueProcessor, SmsQueueProcessor, AppointmentReminderService
├── Controllers/           — 13 API controllers (thin)
├── Data/                  — AppDbContext, migrations (9), configuration
├── DTOs/                  — Feature-organized request/response DTOs
│   ├── Appointments/  Auth/  Common/  Dashboard/  Departments/
│   ├── Employees/  Notifications/  Reports/  Users/  Visitors/  Visits/
├── Enums/                 — Shared enumerations
├── Extensions/            — Service registration, ClaimsPrincipalExtensions
├── Helpers/               — JWT helper, file/date helpers
├── Interfaces/            — Service and repository interfaces
├── Mapping/               — AutoMapper profiles
├── Middleware/            — Exception handling, audit logging
├── Migrations/            — EF Core migration history
├── Models/                — 21 entity classes + Enums.cs
├── Repositories/          — GenericRepository + feature repositories
├── Services/              — Business logic services
├── Validators/            — FluentValidation validators
├── uploads/               — Runtime upload storage (photos, attachments, documents)
├── wwwroot/               — Static files (uploaded content served here)
└── Program.cs             — Entry point, middleware pipeline, CORS, Swagger
```

### 6.2 Frontend Architecture

Both portals are standalone Angular 22 applications using lazy-loaded `loadComponent()` routes.

**Visitor Portal (`frontend/`, port 4200):**
- Layouts: `PublicLayoutComponent`, `AuthLayoutComponent`, `VisitorLayoutComponent`
- Features: home, about, contact, auth (login/register/forgot/reset password), dashboard, profile (+ change password), appointments (list/new/detail/reschedule), visits (history), notifications

**Employee Portal (`frontend-employee/`, port 4201):**
- Layouts: `AuthLayoutComponent`, `MainLayoutComponent`
- Features: auth (login, forgot password), dashboards (admin/ceo/dept-head/employee/receptionist/security), appointments, calendar, employees, visitors, departments, users, visits (check-in/check-out/visit-list), verify, reports, notifications, settings
- Guards: `AuthGuard`, `RoleGuard` (data.roles), `GuestGuard`

### 6.3 Dual Application Strategy

```
frontend/            → http://localhost:4200 (visitor portal)
frontend-employee/   → http://localhost:4201 (employee portal)
backend/             → http://localhost:5281/api (shared API)
```

---

## 7. Database Requirements

> Full column-level documentation: `docs/database_documentation.md`.
> Complete ER diagram: `docs/er_diagram.txt`.
> Executable schema: `docs/visitor_management.sql`.

### 7.1 Entity List (21 tables)

| # | Table | Type | Purpose |
|---|-------|------|---------|
| 1 | `users` | Core | Auth accounts (role, employee/visitor FK) |
| 2 | `departments` | Reference | Organization departments |
| 3 | `employees` | Core | Host staff (linked to user) |
| 4 | `visitors` | Core | External visitors (linked to user) |
| 5 | `visits` | Transactional | Visit lifecycle |
| 6 | `appointments` | Transactional | Meeting requests |
| 7 | `notifications` | Transactional | Employee alerts |
| 8 | `audit_logs` | Audit | Data change history |
| 9 | `employee_schedules` | Reference | Weekly availability |
| 10 | `email_queue` | Queue | Outbound emails |
| 11 | `sms_queue` | Queue | Outbound SMS |
| 12 | `visitor_items` | Transactional | Items brought in |
| 13 | `checkout_items` | Transactional | Items returned at checkout |
| 14 | `appointment_properties` | Transactional | Property attached to appointment |
| 15 | `appointment_attachments` | Transactional | Files on appointment |
| 16 | `appointment_comments` | Transactional | Appointment discussion |
| 17 | `employee_unavailability` | Reference | Leave/travel records |
| 18 | `reschedule_requests` | Transactional | Reschedule workflow |
| 19 | `visitor_notifications` | Transactional | Visitor alerts |
| 20 | `refresh_tokens` | Security | Refresh token storage |
| 21 | `password_reset_tokens` | Security | Password reset tokens |

### 7.2 Key Relationships

| Parent | Child | Type |
|--------|-------|------|
| `users` | `employees` | 1:1 via `employees.user_id` |
| `users` | `visitors` | 1:1 via `users.visitor_id` |
| `departments` | `employees` | 1:M via `employees.department_id` |
| `employees` | `visits` | 1:M via `visits.employee_id` |
| `visitors` | `visits` | 1:M via `visits.visitor_id` |
| `employees` | `appointments` | 1:M via `appointments.employee_id` (+ `assigned_employee_id`, `delegated_to_employee_id`, `original_employee_id`) |
| `visitors` | `appointments` | 1:M via `appointments.visitor_id` |
| `appointments` | `visits` | 1:M via `visits.appointment_id` |
| `appointments` | `notifications` | 1:M via `notifications.appointment_id` |
| `appointments` | `visitor_notifications` | 1:M via `visitor_notifications.appointment_id` |
| `appointments` | `appointment_attachments` | 1:M (CASCADE) |
| `appointments` | `appointment_comments` | 1:M (CASCADE) |
| `appointments` | `appointment_properties` | 1:M (CASCADE) |
| `appointments` | `reschedule_requests` | 1:M (CASCADE) |
| `appointments` | `email_queue` / `sms_queue` | 1:M |
| `visits` | `visitor_items` | 1:M (CASCADE) |
| `visits` | `checkout_items` | 1:M (CASCADE) |
| `appointment_properties` | `checkout_items` | 1:M |
| `users` | `refresh_tokens` | 1:M (CASCADE) |
| `users` | `audit_logs` | 1:M |

### 7.3 Migration History (applied, in order)

| Migration | Description |
|-----------|-------------|
| `20260713082828_InitialCreate` | Base schema — 19 tables: users, departments, employees, visitors, visits, appointments, notifications, visitor_notifications, reschedule_requests, appointment_comments, appointment_attachments, employee_schedules, employee_unavailability, visitor_items, email_queue, sms_queue, refresh_tokens, password_reset_tokens, audit_logs |
| `20260731074958_AddRouteType` | `appointments.route_type` |
| `20260731110014_AddAppointmentMethodAndAssignment` | `appointment_method`, `assigned_department_id`, `assigned_employee_id`, `assigned_by`, `assigned_at`, `redirected_from_department_id`, `redirect_reason` |
| `20260731195610_AddSupportingLetter` | `attachment_*` supporting letter columns on appointments |
| `20260804123642_AddAppointmentProperties` | `appointment_properties` table + `property_letter_*` columns on appointments |
| `20260804181825_AddVisitorPropertySelection` | `appointments.has_properties`, `appointment_properties.property_name` |
| `20260804200407_AddUnavailabilityTimeAndRepeat` | `start_time`, `end_time`, `repeat` on `employee_unavailability` |
| `20260805064924_AddPropertyVerificationStatus` | `appointment_properties.verification_status` |
| `20260807065634_AddCheckoutItems` | `checkout_items` table |

---

## 8. API Specification

### 8.1 Base URL

```
Development:  http://localhost:5281/api
```

Response envelope: `ApiResponse<T>` `{ success, message, data }`.
Pagination: `PagedResponse<T>` `{ items, totalCount, page, pageSize, totalPages, hasPrevious, hasNext }`.

### 8.2 Auth (`/api/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/login` | None | Login (employee or visitor) |
| POST | `/auth/register-visitor` | None | Visitor registration |
| POST | `/auth/refresh-token` | None | Refresh JWT token |
| POST | `/auth/change-password` | Yes | Change password |
| POST | `/auth/forgot-password` | None | Request password reset (always 200) |
| POST | `/auth/reset-password` | None | Reset password with token |
| GET | `/auth/me` | Yes | Current user session |
| POST | `/auth/logout` | Yes | Revoke refresh token |

### 8.3 Employees (`/api/employees`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/employees` | Yes | List (paged, search, sort) |
| GET | `/employees/{id}` | Yes | Get by ID |
| POST | `/employees` | Yes | Create |
| PUT | `/employees/{id}` | Yes | Update |
| DELETE | `/employees/{id}` | Yes | Delete |
| GET | `/employees/{id}/schedule` | Yes | Get schedule |
| PUT | `/employees/{id}/schedule` | Yes | Update schedule |
| POST | `/employees/{id}/unavailability` | Yes | Add unavailability |
| DELETE | `/employees/{id}/unavailability/{unavailabilityId}` | Yes | Remove unavailability |
| GET | `/employees/available` | Yes | Available employees (`?date=`) |
| GET | `/employees/search` | Yes | Search (`?q=&page=&pageSize=`) |

### 8.4 Visitors (`/api/visitors`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/visitors` | Yes | List (paged) |
| GET | `/visitors/{id}` | Yes | Get by ID |
| GET | `/visitors/me` | Yes | Own profile |
| POST | `/visitors` | Yes | Create |
| PUT | `/visitors/{id}` | Yes | Update |
| PUT | `/visitors/me` | Yes | Update own profile |
| DELETE | `/visitors/{id}` | Yes | Delete |
| POST | `/visitors/{id}/photo` | Yes | Upload photo |
| POST | `/visitors/me/photo` | Yes | Upload own photo |
| GET | `/visitors/search` | Yes | Search |

### 8.5 Appointments (`/api/appointments`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/appointments` | Yes | List (role-scoped, paged) |
| GET | `/appointments/{id}` | Yes | Get by ID (ownership checked) |
| POST | `/appointments` | Yes | Create (multipart/form-data, supporting letter + property letter) |
| GET | `/appointments/{id}/supporting-letter` | Yes | Download supporting letter (`?download=`) |
| GET | `/appointments/{id}/property-authorization-letter` | Yes | Download property letter |
| GET | `/appointments/property-verifications` | Security,Admin | Pending property verifications |
| GET | `/appointments/property-verifications/verified` | Security,Admin | Verified properties |
| POST | `/appointments/{id}/verify-properties` | Security,Admin | Verify property items |
| POST | `/appointments/{id}/save-property-verification` | Security,Admin | Save property verification |
| POST | `/appointments/{id}/approve` | Yes (owner) | Approve |
| POST | `/appointments/{id}/reject` | Yes (owner) | Reject (`{ reason }`) |
| POST | `/appointments/{id}/cancel` | Yes (owner) | Cancel |
| POST | `/appointments/{id}/complete` | Yes (owner) | Complete meeting |
| POST | `/appointments/{id}/delegate` | Yes | Delegate to employee |
| POST | `/appointments/{id}/redirect` | Yes | Redirect to employee |
| POST | `/appointments/{id}/redirect-department` | Admin,CEO | Redirect to department |
| POST | `/appointments/{id}/assign-employee` | Admin,CEO,DeptHead | Assign to employee |
| PATCH | `/appointments/{id}/confidential` | Yes | Toggle confidential |
| POST | `/appointments/{id}/reschedule` | Yes | Request reschedule |
| GET | `/appointments/{id}/comments` | Yes | List comments |
| POST | `/appointments/{id}/comments` | Yes | Add comment |
| GET | `/appointments/{id}/attachments` | Yes | List attachments |
| POST | `/appointments/{id}/attachments` | Yes | Upload attachment |
| DELETE | `/appointments/{id}/attachments/{attachmentId}` | Yes | Delete attachment |
| GET | `/appointments/by-visitor/{visitorId}` | Yes | Visitor's appointments |
| GET | `/appointments/by-employee/{employeeId}` | Yes | Employee's appointments |
| GET | `/appointments/pending` | Yes | Pending (role-scoped) |
| GET | `/appointments/today` | Yes | Today (role-scoped) |
| GET | `/appointments/by-department/{departmentId}` | Admin,CEO,DeptHead | Department appointments |
| GET | `/appointments/confidential` | Admin,CEO,DeptHead | Confidential appointments |

### 8.6 Visits (`/api/visits`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/visits` | Yes | List (paged) |
| GET | `/visits/reception-today` | Receptionist,Admin | Today's visits for reception |
| GET | `/visits/{id}` | Yes | Get by ID |
| POST | `/visits` | Yes | Create (walk-in) |
| POST | `/visits/check-in` | Yes | Check in visitor |
| POST | `/visits/{id}/check-out` | Yes | Check out visitor |
| POST | `/visits/{id}/cancel` | Yes | Cancel visit |
| GET | `/visits/by-visitor/{visitorId}` | Yes | Visitor's visits |
| GET | `/visits/by-employee/{employeeId}` | Yes | Employee's visits |
| GET | `/visits/today` | Yes | Today's visits |
| GET | `/visits/active` | Yes | Active (checked-in) visits |
| POST | `/visits/{id}/items` | Yes | Add visitor items |
| POST | `/visits/{id}/items/verify` | Yes | Verify items |
| GET | `/visits/{id}/checkout-items` | Yes | Get checkout items |

### 8.7 Departments (`/api/departments`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/departments` | Yes | List (paged) |
| GET | `/departments/{id}` | Yes | Get by ID |
| POST | `/departments` | Admin | Create |
| PUT | `/departments/{id}` | Admin | Update |
| DELETE | `/departments/{id}` | Admin | Delete |
| GET | `/departments/{id}/stats` | Yes | Department stats |
| GET | `/departments/active` | Yes | Active departments |

### 8.8 Users (`/api/users`) — Admin only

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users` | List (paged) |
| GET | `/users/{id}` | Get by ID |
| POST | `/users` | Create |
| PUT | `/users/{id}` | Update |
| DELETE | `/users/{id}` | Delete |
| PATCH | `/users/{id}/activate` | Activate |
| PATCH | `/users/{id}/deactivate` | Deactivate |
| POST | `/users/{id}/reset-password` | Reset password (returns generated password) |

### 8.9 Notifications (`/api/notifications`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notifications` | List (role-scoped) |
| GET | `/notifications/{id}` | Get by ID |
| GET | `/notifications/unread` | Unread list |
| GET | `/notifications/unread/count` | Unread count |
| POST | `/notifications/{id}/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |
| DELETE | `/notifications/{id}` | Delete |
| GET | `/notifications/visitor/{visitorId}` | Visitor notifications |
| GET | `/notifications/visitor/{visitorId}/unread` | Visitor unread |
| POST | `/notifications/visitor/{visitorId}/read/{notificationId}` | Mark visitor read |
| POST | `/notifications/visitor/{visitorId}/read-all` | Mark all visitor read |
| GET | `/notifications/visitor/{visitorId}/unread/count` | Visitor unread count |

### 8.10 Employee Unavailability (`/api/employee-unavailability`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/employee-unavailability` | Yes | List (`?employeeId=`) |
| GET | `/employee-unavailability/{id}` | Yes | Get by ID |
| POST | `/employee-unavailability` | Admin,CEO,DeptHead,Employee | Create (triggers appointment auto-handling) |
| PUT | `/employee-unavailability/{id}` | Admin,CEO,DeptHead,Employee | Update |
| DELETE | `/employee-unavailability/{id}` | Admin,CEO,DeptHead,Employee | Delete |

### 8.11 Dashboard (`/api/dashboard`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/dashboard/stats` | Yes | General stats |
| GET | `/dashboard/admin` | Admin | Admin dashboard |
| GET | `/dashboard/ceo` | CEO | CEO dashboard |
| GET | `/dashboard/department-head` | DepartmentHead | Dept head dashboard |
| GET | `/dashboard/employee` | Yes | Employee dashboard |
| GET | `/dashboard/receptionist` | Receptionist,Admin | Receptionist dashboard |
| GET | `/dashboard/security` | Security,Admin | Security dashboard |
| GET | `/dashboard/visitor` | Yes (visitor) | Visitor dashboard |

### 8.12 Reports (`/api/reports`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/reports/visitors` | Visitor report (`ReportFilterDto`) |
| GET | `/reports/appointments` | Appointment report |
| GET | `/reports/departments` | Department report |
| GET | `/reports/employees` | Employee report |
| GET | `/reports/export/visitors` | Excel export |
| GET | `/reports/export/appointments` | Excel export |
| GET | `/reports/export/visits` | Excel export |

### 8.13 Search (`/api/search`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/search` | Global search (`{ visitors, employees }`) |
| GET | `/search/visitors` | Search visitors |
| GET | `/search/employees` | Search employees |

### 8.14 Upload (`/api/upload`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/upload/photo` | Yes | jpg/jpeg/png/gif/webp, max 5MB → `/uploads/photos/{guid}.{ext}` |
| POST | `/upload/attachment` | Yes | any type, max 10MB → `/uploads/attachments/` |
| POST | `/upload/document` | Yes | pdf/doc/docx/xls/xlsx/txt/csv, max 10MB → `/uploads/documents/` |
| DELETE | `/upload/{type}/{fileName}` | Admin | Delete file |

---

## 9. Frontend Requirements

### 9.1 Visitor Portal Pages (`frontend/`)

| Page | Route | Auth |
|------|-------|------|
| Home | `/` | No |
| About | `/about` | No |
| Contact | `/contact` | No |
| Login | `/auth/login` | No |
| Register | `/auth/register` | No |
| Forgot Password | `/auth/forgot-password` | No |
| Reset Password | `/auth/reset-password` | No |
| Dashboard | `/dashboard` | Yes |
| Profile | `/profile` | Yes |
| Change Password | `/profile/change-password` | Yes |
| Appointments | `/appointments` | Yes |
| New Appointment | `/appointments/new` | Yes |
| Appointment Detail | `/appointments/:id` | Yes |
| Reschedule | `/appointments/:id/reschedule` | Yes |
| Visit History | `/visits` | Yes |
| Notifications | `/notifications` | Yes |

### 9.2 Employee Portal Pages (`frontend-employee/`)

| Page | Route | Roles |
|------|-------|-------|
| Login | `/auth/login` | — |
| Forgot Password | `/auth/forgot-password` | — |
| **Admin** | | |
| Dashboard | `/admin/dashboard` | Admin |
| Employees | `/admin/employees` (+ `/new`, `/:id`, `/:id/edit`) | Admin |
| Visitors | `/admin/visitors` (+ `/:id`) | Admin |
| Departments | `/admin/departments` (+ `/new`, `/:id/edit`) | Admin |
| Users | `/admin/users` (+ `/new`) | Admin |
| Appointments | `/admin/appointments` | Admin |
| Calendar | `/admin/calendar` | Admin |
| Reports | `/admin/reports` | Admin |
| **CEO** | | |
| Dashboard | `/ceo/dashboard` | CEO |
| Appointments | `/ceo/appointments` | CEO |
| Departments | `/ceo/departments` | CEO |
| Reports | `/ceo/reports` | CEO |
| Calendar | `/ceo/calendar` | CEO |
| **Department Head** | | |
| Dashboard | `/dept/dashboard` | DepartmentHead |
| Appointments | `/dept/appointments` | DepartmentHead |
| Employees | `/dept/employees` | DepartmentHead |
| Calendar | `/dept/calendar` | DepartmentHead |
| **Employee** | | |
| Dashboard | `/emp/dashboard` | Employee |
| Appointments | `/emp/appointments` | Employee |
| Calendar | `/emp/calendar` | Employee |
| **Receptionist** | | |
| Dashboard | `/reception/dashboard` | Receptionist |
| Check In | `/reception/check-in` | Receptionist |
| Today's Visits | `/reception/today` | Receptionist |
| **Security** | | |
| Dashboard | `/security/dashboard` | Security |
| Verify Visitor | `/security/verify` | Security |
| Check Out | `/security/check-out` | Security |
| Active Visitors | `/security/active` | Security |
| **Shared** | | |
| Appointment Detail | `/appointments/:id` | All |
| Notifications | `/notifications` | All |
| Settings | `/settings` | All |

---

## 10. Security Requirements

### 10.1 Authentication

- JWT Bearer tokens (access) + `refresh_tokens` table for refresh rotation
- BCrypt password hashing (12 rounds)
- Password reset tokens expire after 1 hour, single-use (`is_used`)

### 10.2 Authorization

- RBAC via `[Authorize(Roles = "...")]` on controllers/actions
- Frontend route guards (`RoleGuard` with `data.roles`)
- Ownership checks in `AppointmentsController` (`CanViewAppointmentAsync`, `EnsureOwnershipAsync`)

### 10.3 Data Protection

- CORS restricted to `localhost:4200` and `localhost:4201`
- Passwords/tokens never logged
- File upload validation (type, size, GUID filenames)
- EF Core parameterized queries prevent SQL injection

### 10.4 Audit

- `audit_logs` records user, action, entity, old/new values, IP, user agent
- Append-only (no update/delete operations)

---

## 11. Appendices

### Appendix A: Implementation Status

| Area | Status |
|------|--------|
| Database schema (21 tables, 9 migrations) | ✅ Deployed |
| Backend API (13 controllers) | ✅ Deployed |
| Visitor Portal | ✅ Deployed (port 4200) |
| Employee Portal | ✅ Deployed (port 4201) |
| Email/SMS/Reminder background services | ✅ Active |
| Reports & Excel export | ✅ Active |
| Property verification & checkout items | ✅ Active |

### Appendix B: Technology Versions

| Technology | Version |
|------------|---------|
| .NET / ASP.NET Core | 10.0 |
| Entity Framework Core | 10.0.9 |
| Npgsql (PostgreSQL) | 10.0.x |
| PostgreSQL | 15+ |
| Angular | 22.0 |
| Angular Material | 22.0 |
| TypeScript | 6.0.2 |
| BCrypt.Net-Next | 4.x |
| AutoMapper | 12.0.x |
| FluentValidation | 11.x |

### Appendix C: Sample Users (seed)

| User | Email | Password | Role |
|------|-------|----------|------|
| System Admin | admin@ecx.et | Admin@123 | Admin |
| CEO Office | ceo@ecx.et | Admin@123 | CEO |
| IT Department Head | it.head@ecx.et | Admin@123 | DepartmentHead |
| HR Department Head | hr.head@ecx.et | Admin@123 | DepartmentHead |
| Employee | abebe.kebede@ecx.et | Admin@123 | Employee |
| Receptionist | sara.wondimu@ecx.et | Admin@123 | Receptionist |
| Security | tsegaye.berhan@ecx.et | Admin@123 | Security |
| Visitor | yididiya19@gmail.com | Admin@123 | Visitor |

### Appendix D: Notification Matrix

| Event | Email | SMS | In-App (Employee) | In-App (Visitor) |
|-------|-------|-----|-------------------|-------------------|
| Appointment Requested | ✅ | ✅ | ✅ | ✅ |
| Appointment Approved | ✅ | ✅ | ✅ | ✅ |
| Appointment Rejected | ✅ | ✅ | ✅ | ✅ |
| Appointment Cancelled | ✅ | ✅ | ✅ | ✅ |
| Appointment Rescheduled | ✅ | ✅ | ✅ | ✅ |
| Reminder (24h) | ✅ | ✅ | ✅ | ✅ |
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
            ┌────────────┼──────────────────────────┐
            │            │                          │
      ┌─────▼──────┐ ┌──▼───────┐      ┌───────────▼─────────┐
      │  Approved   │ │ Rejected │      │ EmployeeUnavailable  │
      └─────┬──────┘ └──────────┘      └─────────────────────┘
            │
   ┌────────┼──────────────┐
   │        │              │
┌──▼────┐ ┌─▼────────┐  ┌──▼─────────┐
│Completed││Cancelled │  │Rescheduled │  → Delegated
└───────┘ └──────────┘  └────────────┘
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

**End of SRS Document (v3.0 FINAL)**
