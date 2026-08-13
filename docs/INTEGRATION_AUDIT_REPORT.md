# ECX Visitor Management System - Integration Audit Report

**Date:** August 8, 2026
**Status:** All 3 projects build successfully (0 errors); frontends fully integrated with the backend API

---

## Executive Summary

| Project | Errors | Warnings | Build Status |
|---------|--------|----------|-------------|
| Backend (ASP.NET Core, .NET 10) | 0 | 2 (AutoMapper vulnerability) | PASS |
| Visitor Portal (Angular 22) | 0 | 2 (optional chain, Sass deprecation) | PASS |
| Employee Portal (Angular 22) | 0 | 12 (unused imports, content projection, optional chain) | PASS |

The system consists of **13 backend controllers** exposing **~120 endpoints**, consumed by **2 Angular frontends**. All model, route, and type mismatches found during integration have been resolved. The two endpoints previously flagged as missing (`/appointments/upcoming`, `/appointments/stats`) are no longer used by the frontends — the visitor portal lists appointments via the paginated `/appointments` endpoint and derives stats client-side.

---

## 1. Architecture Overview

### Backend
- **Framework:** ASP.NET Core (.NET 10.0)
- **ORM:** EF Core 10.0.9 with Npgsql (PostgreSQL 15, `localhost:5432`, db: `visitormanagement`)
- **Auth:** JWT Bearer Tokens with refresh tokens (rotated via `/auth/refresh-token`)
- **Route Convention:** Explicit `[Route("api/...")]` on each controller (no global prefix)
- **Response Envelope:** `ApiResponse<T>` `{ success, message, data }`
- **Pagination:** `PagedResponse<T>` `{ items, totalCount, page, pageSize, totalPages, hasPrevious, hasNext }`
- **Middleware Pipeline:** ExceptionMiddleware → AuditMiddleware → StaticFiles → CORS → Auth → Controllers
- **Controllers (13):** Auth, Employees, Visitors, Appointments, Visits, Departments, Users, Notifications, EmployeeUnavailability, Dashboard, Reports, Search, Upload

### Frontends
- **Visitor Portal:** `localhost:4200` (Angular 22, TypeScript 6.0.2, Angular Material 22)
- **Employee Portal:** `localhost:4201` (Angular 22, TypeScript 6.0.2, Angular Material 22)
- **API Base URL:** `http://localhost:5281/api`

### Sample Users
| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@ecx.et | Admin@123 | Admin |
| CEO | ceo@ecx.et | Admin@123 | CEO |
| Department Head | it.head@ecx.et | Admin@123 | DepartmentHead |
| Employee | abebe.kebede@ecx.et | Admin@123 | Employee |
| Receptionist | sara.wondimu@ecx.et | Admin@123 | Receptionist |
| Security | tsegaye.berhan@ecx.et | Admin@123 | Security |
| Visitor | yididiya19@gmail.com | Admin@123 | Visitor |

---

## 2. Complete Backend Endpoint Reference

### 2.1 Auth (`/api/auth`)
| Method | Route | Auth | Request | Response | Notes |
|--------|-------|------|---------|----------|-------|
| POST | `/auth/login` | None | `{ email, password }` | `LoginResponse` | Works for staff and visitors |
| POST | `/auth/register-visitor` | None | `{ fullName, email, password, phone, address, nationalId?, organization?, gender? }` | `LoginResponse` | Auto-registers visitor + user |
| POST | `/auth/refresh-token` | None | `{ refreshToken }` | `LoginResponse` | Rotates token |
| POST | `/auth/change-password` | Yes | `{ oldPassword, newPassword }` | null | |
| POST | `/auth/forgot-password` | None | `{ email }` | null | Always 200 (no user enumeration) |
| POST | `/auth/reset-password` | None | `{ token, newPassword }` | null | Token from email |
| GET | `/auth/me` | Yes | - | `UserSessionDto` | Current user + links |
| POST | `/auth/logout` | Yes | `{ refreshToken }` | null | Revokes token |

**LoginResponse:** `{ token, refreshToken, fullName, email, role, userId, employeeId?, visitorId? }`

### 2.2 Employees (`/api/employees`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/employees` | Yes | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<EmployeeResponseDto>` |
| GET | `/employees/{id}` | Yes | - | `EmployeeResponseDto` |
| POST | `/employees` | Admin,CEO,DeptHead | `{ fullName, phone, email, departmentId, position, officeNumber? }` | `EmployeeResponseDto` (201) |
| PUT | `/employees/{id}` | Admin,CEO,DeptHead | `{ fullName?, phone?, departmentId?, position?, officeNumber?, status? }` | `EmployeeResponseDto` |
| DELETE | `/employees/{id}` | Admin | - | null |
| GET | `/employees/{id}/schedule` | Yes | - | `EmployeeScheduleDto[]` |
| PUT | `/employees/{id}/schedule` | Yes (owner/admin) | `{ schedules: EmployeeScheduleDto[] }` | `EmployeeScheduleDto[]` |
| POST | `/employees/{id}/unavailability` | Yes (owner/admin) | `{ employeeId, unavailabilityType, startDate, endDate?, startTime?, endTime?, repeat?, reason? }` | `EmployeeUnavailabilityResponseDto` |
| DELETE | `/employees/{id}/unavailability/{unavailabilityId}` | Yes (owner/admin) | - | null |
| GET | `/employees/available` | Yes | `?date=` | `EmployeeResponseDto[]` |
| GET | `/employees/search` | Yes | `?q=&page=&pageSize=` | `PagedResponse<EmployeeResponseDto>` |

**EmployeeResponseDto:** `{ id, fullName, phone, email, departmentId, departmentName, position, officeNumber?, status, userId?, pendingAppointments, totalAppointments, createdAt }`

### 2.3 Visitors (`/api/visitors`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/visitors` | Yes | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<VisitorResponseDto>` |
| GET | `/visitors/{id}` | Yes | - | `VisitorResponseDto` |
| GET | `/visitors/me` | Yes (visitor) | - | `VisitorResponseDto` |
| POST | `/visitors` | Yes (staff) | `{ fullName, phone, email, address, nationalId?, organization?, gender? }` | `VisitorResponseDto` (201) |
| PUT | `/visitors/{id}` | Yes (staff) | `{ fullName?, phone?, address?, organization?, gender? }` | `VisitorResponseDto` |
| PUT | `/visitors/me` | Yes (visitor) | `{ fullName?, phone?, address?, organization?, gender? }` | `VisitorResponseDto` |
| DELETE | `/visitors/{id}` | Admin | - | null |
| POST | `/visitors/{id}/photo` | Yes | `IFormFile` (multipart) | `{ photoUrl }` |
| POST | `/visitors/me/photo` | Yes (visitor) | `IFormFile` (multipart) | `{ photoUrl }` |
| GET | `/visitors/search` | Yes | `?q=&page=&pageSize=` | `PagedResponse<VisitorResponseDto>` |

**VisitorResponseDto:** `{ id, fullName, phone, email, address, nationalId?, organization?, gender?, photoUrl?, isActive, totalVisits, totalAppointments, createdAt }`

### 2.4 Appointments (`/api/appointments`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/appointments` | Yes | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<AppointmentResponseDto>` (role-scoped) |
| GET | `/appointments/{id}` | Yes | - | `AppointmentResponseDto` (ownership checked) |
| POST | `/appointments` | Yes | `multipart/form-data` (fields + supporting letter + property letter) | `AppointmentResponseDto` (201) |
| GET | `/appointments/{id}/supporting-letter` | Yes | `?download=` | File |
| GET | `/appointments/{id}/property-authorization-letter` | Yes | - | File |
| GET | `/appointments/property-verifications` | Security,Admin | - | `AppointmentResponseDto[]` (pending) |
| GET | `/appointments/property-verifications/verified` | Security,Admin | - | `AppointmentResponseDto[]` |
| POST | `/appointments/{id}/verify-properties` | Security,Admin | `{ properties }` | `AppointmentPropertyDto[]` |
| POST | `/appointments/{id}/save-property-verification` | Security,Admin | `{ ... }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/approve` | Yes (owner) | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/reject` | Yes (owner) | `{ reason }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/cancel` | Yes (owner) | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/complete` | Yes (owner) | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/delegate` | Yes | `{ newEmployeeId, reason? }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/redirect` | Yes | `{ newEmployeeId, newDepartmentId?, reason? }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/redirect-department` | Admin,CEO | `{ departmentId, reason? }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/assign-employee` | Admin,CEO,DeptHead | `{ employeeId }` | `AppointmentResponseDto` |
| PATCH | `/appointments/{id}/confidential` | Yes (owner/admin) | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/reschedule` | Yes | `{ newDate, newStartTime, newEndTime, reason? }` | `RescheduleResponseDto` |
| GET | `/appointments/{id}/comments` | Yes | - | `AppointmentCommentDto[]` |
| POST | `/appointments/{id}/comments` | Yes | `{ commentText, isInternal }` | `AppointmentCommentDto` |
| GET | `/appointments/{id}/attachments` | Yes | - | `AppointmentAttachmentDto[]` |
| POST | `/appointments/{id}/attachments` | Yes | `IFormFile` (multipart) | `AppointmentAttachmentDto` |
| DELETE | `/appointments/{id}/attachments/{attachmentId}` | Yes (owner) | - | null |
| GET | `/appointments/by-visitor/{visitorId}` | Yes | - | `AppointmentResponseDto[]` |
| GET | `/appointments/by-employee/{employeeId}` | Yes | - | `AppointmentResponseDto[]` |
| GET | `/appointments/pending` | Yes | - | `AppointmentResponseDto[]` (role-scoped) |
| GET | `/appointments/today` | Yes | - | `AppointmentResponseDto[]` (role-scoped) |
| GET | `/appointments/by-department/{departmentId}` | Admin,CEO,DeptHead | - | `AppointmentResponseDto[]` |
| GET | `/appointments/confidential` | Admin,CEO,DeptHead | - | `AppointmentResponseDto[]` |

**AppointmentResponseDto:** `{ id, visitorId, visitorName, visitorEmail, visitorPhone, employeeId, employeeName, employeePosition, departmentName, requestedDate, requestedStartTime, requestedEndTime, purpose, status, routeType?, appointmentMethod?, employeeResponse?, approvalDate?, checkInAllowed, isConfidential, appointmentCode?, rejectionReason?, notes?, delegatedToEmployeeId?, delegatedToEmployeeName?, originalEmployeeId?, originalEmployeeName?, redirectDepartmentId?, redirectDepartmentName?, assignedDepartmentId?, assignedEmployeeId?, hasProperties, propertyVerificationStatus?, attachment?, propertyLetter?, commentCount, createdAt, updatedAt? }`

**AppointmentStatus values:** `Pending`, `Approved`, `Rejected`, `Cancelled`, `Completed`, `EmployeeUnavailable`, `Rescheduled`, `Delegated`

### 2.5 Visits (`/api/visits`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/visits` | Yes | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<VisitResponseDto>` |
| GET | `/visits/reception-today` | Receptionist,Admin | - | `VisitResponseDto[]` |
| GET | `/visits/{id}` | Yes | - | `VisitResponseDto` |
| POST | `/visits` | Yes | `{ visitorId, employeeId, appointmentId?, purpose, isDestinationKnown, remark? }` | `VisitResponseDto` (201) |
| POST | `/visits/check-in` | Receptionist,Admin | `{ visitorId, employeeId, appointmentId?, purpose, securityOfficer, isDestinationKnown, badgeNumber?, visitorItems? }` | `VisitResponseDto` |
| POST | `/visits/{id}/check-out` | Security,Admin | `{ securityOfficer, remark? }` | `VisitResponseDto` |
| POST | `/visits/{id}/cancel` | Yes | - | `VisitResponseDto` |
| GET | `/visits/by-visitor/{visitorId}` | Yes | - | `VisitResponseDto[]` |
| GET | `/visits/by-employee/{employeeId}` | Yes | - | `VisitResponseDto[]` |
| GET | `/visits/today` | Yes | - | `VisitResponseDto[]` |
| GET | `/visits/active` | Yes | - | `VisitResponseDto[]` (checked-in) |
| POST | `/visits/{id}/items` | Yes | `[{ itemName, quantity, serialNumber?, brand?, description? }]` | `VisitorItemDto[]` |
| POST | `/visits/{id}/items/verify` | Security,Admin | `[{ itemId, isVerified }]` | `VisitorItemDto[]` |
| GET | `/visits/{id}/checkout-items` | Security,Admin | - | `CheckoutItemDto[]` |

**VisitResponseDto:** `{ id, visitorId, visitorName, visitorPhone, visitorEmail, visitorPhotoUrl?, employeeId, employeeName, departmentName, appointmentId?, appointment?, purpose, visitDate, checkInTime?, checkOutTime?, status, badgeNumber?, securityOfficer?, remark?, isDestinationKnown, redirectNote?, visitorItems, allItemsVerified, createdAt }`

**VisitStatus values:** `Scheduled`, `CheckedIn`, `CheckedOut`, `Cancelled`

### 2.6 Departments (`/api/departments`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/departments` | Yes | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<DepartmentResponseDto>` |
| GET | `/departments/{id}` | Yes | - | `DepartmentResponseDto` |
| POST | `/departments` | Admin | `{ name, description?, location?, phone?, email? }` | `DepartmentResponseDto` (201) |
| PUT | `/departments/{id}` | Admin | `{ name?, description?, location?, phone?, email?, isActive? }` | `DepartmentResponseDto` |
| DELETE | `/departments/{id}` | Admin | - | null |
| GET | `/departments/{id}/stats` | Yes | - | `DepartmentStatsDto` |
| GET | `/departments/active` | Yes | - | `PagedResponse<DepartmentResponseDto>` (PageSize=100) |

**DepartmentResponseDto:** `{ id, name, description?, location?, phone?, email?, isActive, employeeCount, pendingAppointments, totalAppointmentsThisMonth, createdAt }`

### 2.7 Users (`/api/users`) — Admin only
| Method | Route | Request | Response |
|--------|-------|---------|----------|
| GET | `/users` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<UserResponseDto>` |
| GET | `/users/{id}` | - | `UserResponseDto` |
| POST | `/users` | `{ fullName, email, password, role, employeeId?, visitorId? }` | `UserResponseDto` (201) |
| PUT | `/users/{id}` | `{ fullName?, email?, role?, isActive? }` | `UserResponseDto` |
| DELETE | `/users/{id}` | - | null |
| PATCH | `/users/{id}/activate` | - | `UserResponseDto` |
| PATCH | `/users/{id}/deactivate` | - | `UserResponseDto` |
| POST | `/users/{id}/reset-password` | - | `{ newPassword }` |

### 2.8 Notifications (`/api/notifications`)
| Method | Route | Request | Response |
|--------|-------|---------|----------|
| GET | `/notifications` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<NotificationResponseDto>` (role-scoped) |
| GET | `/notifications/{id}` | - | `NotificationResponseDto` |
| GET | `/notifications/unread` | - | `NotificationResponseDto[]` |
| GET | `/notifications/unread/count` | - | `{ count: number }` |
| POST | `/notifications/{id}/read` | - | null |
| POST | `/notifications/read-all` | - | null |
| DELETE | `/notifications/{id}` | - | null |
| GET | `/notifications/visitor/{visitorId}` | `?page&pageSize` | `PagedResponse<VisitorNotificationResponseDto>` |
| GET | `/notifications/visitor/{visitorId}/unread` | - | `VisitorNotificationResponseDto[]` |
| POST | `/notifications/visitor/{visitorId}/read/{notificationId}` | - | null |
| POST | `/notifications/visitor/{visitorId}/read-all` | - | null |
| GET | `/notifications/visitor/{visitorId}/unread/count` | - | `{ count: number }` |

**NotificationResponseDto:** `{ id, employeeId, appointmentId?, title, message, notificationType, priority, isRead, readAt?, channel, createdAt }`

### 2.9 Employee Unavailability (`/api/employee-unavailability`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/employee-unavailability` | Yes | `?employeeId=` | `EmployeeUnavailabilityResponseDto[]` |
| GET | `/employee-unavailability/{id}` | Yes | - | `EmployeeUnavailabilityResponseDto` |
| POST | `/employee-unavailability` | Admin,CEO,DeptHead,Employee | `{ employeeId, unavailabilityType, startDate, endDate?, startTime?, endTime?, repeat?, reason? }` | `EmployeeUnavailabilityResponseDto` |
| PUT | `/employee-unavailability/{id}` | Admin,CEO,DeptHead,Employee | same as create | `EmployeeUnavailabilityResponseDto` |
| DELETE | `/employee-unavailability/{id}` | Admin,CEO,DeptHead,Employee | - | null |

> Creating/updating unavailability triggers automatic handling of conflicting pending appointments (auto-reject with `EmployeeUnavailable` status and notification).

### 2.10 Dashboard (`/api/dashboard`)
| Method | Route | Auth | Response |
|--------|-------|------|----------|
| GET | `/dashboard/stats` | Yes | `DashboardStatsDto` |
| GET | `/dashboard/admin` | Admin | `AdminDashboardDto` |
| GET | `/dashboard/ceo` | CEO | `CeoDashboardDto` |
| GET | `/dashboard/department-head` | DepartmentHead | `DepartmentHeadDashboardDto` |
| GET | `/dashboard/employee` | Yes | `EmployeeDashboardDto` |
| GET | `/dashboard/receptionist` | Receptionist,Admin | `ReceptionistDashboardDto` |
| GET | `/dashboard/security` | Security,Admin | `SecurityDashboardDto` |
| GET | `/dashboard/visitor` | Visitor | `VisitorDashboardDto` |

**DashboardStatsDto:** `{ totalVisitorsToday, totalVisitorsThisWeek, totalVisitorsThisMonth, activeAppointments, pendingAppointments, checkedInVisitors, totalEmployees, totalDepartments, unreadNotifications }`

### 2.11 Reports (`/api/reports`)
| Method | Route | Request | Response |
|--------|-------|---------|----------|
| GET | `/reports/visitors` | `?startDate&endDate&departmentId` | `VisitorReportDto` |
| GET | `/reports/appointments` | `?startDate&endDate&departmentId` | `AppointmentReportDto` |
| GET | `/reports/departments` | `?startDate&endDate` | `DepartmentReportDto[]` |
| GET | `/reports/employees` | `?startDate&endDate` | `EmployeeReportDto[]` |
| GET | `/reports/export/visitors` | `?startDate&endDate` | Excel file (binary) |
| GET | `/reports/export/appointments` | `?startDate&endDate` | Excel file (binary) |
| GET | `/reports/export/visits` | `?startDate&endDate` | Excel file (binary) |

### 2.12 Search (`/api/search`)
| Method | Route | Request | Response |
|--------|-------|---------|----------|
| GET | `/search` | `?q=&page=&pageSize=` | `{ visitors, employees }` (global) |
| GET | `/search/visitors` | `?q=&page=&pageSize=` | `PagedResponse<VisitorResponseDto>` |
| GET | `/search/employees` | `?q=&page=&pageSize=` | `PagedResponse<EmployeeResponseDto>` |

### 2.13 Upload (`/api/upload`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| POST | `/upload/photo` | Yes | `IFormFile` (jpg/jpeg/png/gif/webp, max 5MB) | `{ url }` |
| POST | `/upload/attachment` | Yes | `IFormFile` (any, max 10MB) | `{ url, fileName, size }` |
| POST | `/upload/document` | Yes | `IFormFile` (pdf/doc/docx/xls/xlsx/txt/csv, max 10MB) | `{ url, fileName, size }` |
| DELETE | `/upload/{type}/{fileName}` | Admin | - | null |

---

## 3. Frontend-to-Backend Integration Map

### 3.1 Visitor Portal Services (`frontend/`)
| Service Method | HTTP | Backend Endpoint | Status |
|---------------|------|------------------|--------|
| `authService.login()` | POST | `/auth/login` | ✅ Aligned |
| `authService.register()` | POST | `/auth/register-visitor` | ✅ Aligned |
| `authService.refreshToken()` | POST | `/auth/refresh-token` | ✅ Aligned |
| `authService.changePassword()` | POST | `/auth/change-password` | ✅ Aligned |
| `authService.forgotPassword()` | POST | `/auth/forgot-password` | ✅ Aligned |
| `authService.resetPassword()` | POST | `/auth/reset-password` | ✅ Aligned |
| `authService.me()` | GET | `/auth/me` | ✅ Aligned |
| `authService.logout()` | POST | `/auth/logout` | ✅ Aligned |
| `visitorService.getProfile()` | GET | `/visitors/me` | ✅ Aligned |
| `visitorService.updateProfile()` | PUT | `/visitors/me` | ✅ Aligned |
| `visitorService.uploadPhoto()` | POST | `/visitors/me/photo` | ✅ Aligned |
| `appointmentService.getAppointments()` | GET | `/appointments` (page/limit) | ✅ Aligned |
| `appointmentService.getAppointment()` | GET | `/appointments/{id}` | ✅ Aligned |
| `appointmentService.createAppointment()` | POST | `/appointments` | ✅ Aligned |
| `appointmentService.rescheduleAppointment()` | POST | `/appointments/{id}/reschedule` | ✅ Aligned |
| `appointmentService.cancelAppointment()` | POST | `/appointments/{id}/cancel` | ✅ Aligned |
| `appointmentService.getComments()` | GET | `/appointments/{id}/comments` | ✅ Aligned |
| `appointmentService.addComment()` | POST | `/appointments/{id}/comments` | ✅ Aligned |
| `appointmentService.getByVisitor()` | GET | `/appointments/by-visitor/{visitorId}` | ✅ Aligned |
| `visitService.getAll()` | GET | `/visits` | ✅ Aligned |
| `visitService.getById()` | GET | `/visits/{id}` | ✅ Aligned |
| `visitService.getByVisitor()` | GET | `/visits/by-visitor/{visitorId}` | ✅ Aligned |
| `notificationService.getNotifications()` | GET | `/notifications/visitor/{visitorId}` | ✅ Aligned |
| `notificationService.getUnreadCount()` | GET | `/notifications/visitor/{visitorId}/unread/count` | ✅ Aligned |
| `notificationService.markAsRead()` | POST | `/notifications/visitor/{visitorId}/read/{notificationId}` | ✅ Aligned |
| `notificationService.markAllAsRead()` | POST | `/notifications/visitor/{visitorId}/read-all` | ✅ Aligned |
| `dashboardService.getStats()` | GET | `/dashboard/visitor` | ✅ Aligned |

### 3.2 Employee Portal Services (`frontend-employee/`)
| Service Method | HTTP | Backend Endpoint | Status |
|---------------|------|------------------|--------|
| `authService.login()` | POST | `/auth/login` | ✅ Aligned |
| `authService.forgotPassword()` | POST | `/auth/forgot-password` | ✅ Aligned |
| `authService.changePassword()` | POST | `/auth/change-password` | ✅ Aligned |
| `authService.me()` | GET | `/auth/me` | ✅ Aligned |
| `appointmentService.getAll()` | GET | `/appointments` | ✅ Aligned |
| `appointmentService.getById()` | GET | `/appointments/{id}` | ✅ Aligned |
| `appointmentService.create()` | POST | `/appointments` | ✅ Aligned |
| `appointmentService.approve()` | POST | `/appointments/{id}/approve` | ✅ Aligned |
| `appointmentService.reject()` | POST | `/appointments/{id}/reject` | ✅ Aligned |
| `appointmentService.delegate()` | POST | `/appointments/{id}/delegate` | ✅ Aligned |
| `appointmentService.redirect()` | POST | `/appointments/{id}/redirect` | ✅ Aligned |
| `appointmentService.redirectDepartment()` | POST | `/appointments/{id}/redirect-department` | ✅ Aligned |
| `appointmentService.assignEmployee()` | POST | `/appointments/{id}/assign-employee` | ✅ Aligned |
| `appointmentService.complete()` | POST | `/appointments/{id}/complete` | ✅ Aligned |
| `appointmentService.cancel()` | POST | `/appointments/{id}/cancel` | ✅ Aligned |
| `appointmentService.toggleConfidential()` | PATCH | `/appointments/{id}/confidential` | ✅ Aligned |
| `appointmentService.getPending()` | GET | `/appointments/pending` | ✅ Aligned |
| `appointmentService.getToday()` | GET | `/appointments/today` | ✅ Aligned |
| `appointmentService.getByDepartment()` | GET | `/appointments/by-department/{departmentId}` | ✅ Aligned |
| `appointmentService.getConfidential()` | GET | `/appointments/confidential` | ✅ Aligned |
| `appointmentService.getComments()` | GET | `/appointments/{id}/comments` | ✅ Aligned |
| `appointmentService.addComment()` | POST | `/appointments/{id}/comments` | ✅ Aligned |
| `appointmentService.getPropertyVerifications()` | GET | `/appointments/property-verifications` | ✅ Aligned |
| `appointmentService.verifyProperties()` | POST | `/appointments/{id}/verify-properties` | ✅ Aligned |
| `appointmentService.savePropertyVerification()` | POST | `/appointments/{id}/save-property-verification` | ✅ Aligned |
| `visitService.getAll()` | GET | `/visits` | ✅ Aligned |
| `visitService.getById()` | GET | `/visits/{id}` | ✅ Aligned |
| `visitService.checkIn()` | POST | `/visits/check-in` | ✅ Aligned |
| `visitService.checkOut()` | POST | `/visits/{id}/check-out` | ✅ Aligned |
| `visitService.cancel()` | POST | `/visits/{id}/cancel` | ✅ Aligned |
| `visitService.getActive()` | GET | `/visits/active` | ✅ Aligned |
| `visitService.getToday()` | GET | `/visits/today` | ✅ Aligned |
| `visitService.getReceptionToday()` | GET | `/visits/reception-today` | ✅ Aligned |
| `visitService.getByVisitorId()` | GET | `/visits/by-visitor/{visitorId}` | ✅ Aligned |
| `visitService.getCheckoutItems()` | GET | `/visits/{id}/checkout-items` | ✅ Aligned |
| `visitService.addItems()` | POST | `/visits/{id}/items` | ✅ Aligned |
| `visitService.verifyItems()` | POST | `/visits/{id}/items/verify` | ✅ Aligned |
| `employeeService.getAll()` | GET | `/employees` | ✅ Aligned |
| `employeeService.getById()` | GET | `/employees/{id}` | ✅ Aligned |
| `employeeService.create()` | POST | `/employees` | ✅ Aligned |
| `employeeService.update()` | PUT | `/employees/{id}` | ✅ Aligned |
| `employeeService.delete()` | DELETE | `/employees/{id}` | ✅ Aligned |
| `employeeService.getAvailable()` | GET | `/employees/available` | ✅ Aligned |
| `employeeService.search()` | GET | `/employees/search` | ✅ Aligned |
| `employeeService.getSchedule()` | GET | `/employees/{id}/schedule` | ✅ Aligned |
| `employeeService.updateSchedule()` | PUT | `/employees/{id}/schedule` | ✅ Aligned |
| `employeeService.getUnavailability()` | GET | `/employee-unavailability?employeeId=` | ✅ Aligned |
| `employeeService.createUnavailability()` | POST | `/employee-unavailability` | ✅ Aligned |
| `employeeService.updateUnavailability()` | PUT | `/employee-unavailability/{id}` | ✅ Aligned |
| `employeeService.deleteUnavailability()` | DELETE | `/employee-unavailability/{id}` | ✅ Aligned |
| `departmentService.getAll()` | GET | `/departments/active` (dropdown) | ✅ Aligned |
| `departmentService.getById()` | GET | `/departments/{id}` | ✅ Aligned |
| `departmentService.create()` | POST | `/departments` | ✅ Aligned |
| `departmentService.update()` | PUT | `/departments/{id}` | ✅ Aligned |
| `departmentService.delete()` | DELETE | `/departments/{id}` | ✅ Aligned |
| `departmentService.getStats()` | GET | `/departments/{id}/stats` | ✅ Aligned |
| `notificationService.getAll()` | GET | `/notifications` | ✅ Aligned |
| `notificationService.getUnreadCount()` | GET | `/notifications/unread/count` | ✅ Aligned |
| `notificationService.markAsRead()` | POST | `/notifications/{id}/read` | ✅ Aligned |
| `notificationService.markAllAsRead()` | POST | `/notifications/read-all` | ✅ Aligned |
| `notificationService.delete()` | DELETE | `/notifications/{id}` | ✅ Aligned |
| `reportService.getVisitorReport()` | GET | `/reports/visitors` | ✅ Aligned |
| `reportService.getAppointmentReport()` | GET | `/reports/appointments` | ✅ Aligned |
| `reportService.getDepartmentReport()` | GET | `/reports/departments` | ✅ Aligned |
| `reportService.getEmployeeReport()` | GET | `/reports/employees` | ✅ Aligned |
| `reportService.exportVisitors()` | GET | `/reports/export/visitors` | ✅ Aligned |
| `reportService.exportAppointments()` | GET | `/reports/export/appointments` | ✅ Aligned |
| `reportService.exportVisits()` | GET | `/reports/export/visits` | ✅ Aligned |
| `userService.getAll()` | GET | `/users` | ✅ Aligned |
| `userService.getById()` | GET | `/users/{id}` | ✅ Aligned |
| `userService.create()` | POST | `/users` | ✅ Aligned |
| `userService.update()` | PUT | `/users/{id}` | ✅ Aligned |
| `userService.delete()` | DELETE | `/users/{id}` | ✅ Aligned |
| `userService.activate()` | PATCH | `/users/{id}/activate` | ✅ Aligned |
| `userService.deactivate()` | PATCH | `/users/{id}/deactivate` | ✅ Aligned |
| `userService.resetPassword()` | POST | `/users/{id}/reset-password` | ✅ Aligned |
| `visitorService.getAll()` | GET | `/visitors` | ✅ Aligned |
| `visitorService.getById()` | GET | `/visitors/{id}` | ✅ Aligned |
| `visitorService.create()` | POST | `/visitors` | ✅ Aligned |
| `visitorService.update()` | PUT | `/visitors/{id}` | ✅ Aligned |
| `visitorService.delete()` | DELETE | `/visitors/{id}` | ✅ Aligned |
| `visitorService.search()` | GET | `/visitors/search` | ✅ Aligned |
| `searchService.globalSearch()` | GET | `/search` | ✅ Aligned |
| `searchService.searchVisitors()` | GET | `/search/visitors` | ✅ Aligned |
| `searchService.searchEmployees()` | GET | `/search/employees` | ✅ Aligned |
| `uploadService.uploadPhoto()` | POST | `/upload/photo` | ✅ Aligned |
| `uploadService.uploadAttachment()` | POST | `/upload/attachment` | ✅ Aligned |
| `uploadService.uploadDocument()` | POST | `/upload/document` | ✅ Aligned |
| `dashboardService.getAdminDashboard()` | GET | `/dashboard/admin` | ✅ Aligned |
| `dashboardService.getCeoDashboard()` | GET | `/dashboard/ceo` | ✅ Aligned |
| `dashboardService.getDeptHeadDashboard()` | GET | `/dashboard/department-head` | ✅ Aligned |
| `dashboardService.getEmployeeDashboard()` | GET | `/dashboard/employee` | ✅ Aligned |
| `dashboardService.getReceptionistDashboard()` | GET | `/dashboard/receptionist` | ✅ Aligned |
| `dashboardService.getSecurityDashboard()` | GET | `/dashboard/security` | ✅ Aligned |

---

## 4. Integration Resolutions Applied

All mismatches identified in earlier audit passes have been resolved. The
following is the record of what was fixed:

### 4.1 Auth & Response Model Alignment
- `LoginResponse` flattened to match backend `{ token, refreshToken, fullName, email, role, userId, employeeId?, visitorId? }`.
- `RegisterRequest` fields aligned: `fullName`, `organization`, `address`, `nationalId`, `gender`.
- `ChangePasswordRequest` aligned: `oldPassword` / `newPassword`.
- `ResetPasswordRequest` aligned: `token` / `newPassword`.
- `PagedResponse` aligned: `items`, `totalCount`, `page`, `pageSize`, `totalPages`, `hasPrevious`, `hasNext`.

### 4.2 Dashboard Components (6 employee dashboards + visitor dashboard)
- `totalVisitors` → `totalVisitorsToday`; `todayVisitors` → `totalVisitorsToday`; `activeVisitors` → `checkedInVisitors`.
- `totalAppointments` → `activeAppointments`; `userName` → `user.fullName`.
- All fallback/mock fields aligned to the real dashboard DTOs.

### 4.3 Calendar Component
- `scheduledTime` → `requestedStartTime`; `title` → `purpose`; `hostEmployeeName` → `employeeName`; `scheduledDate` → `requestedDate`.
- Calendar loads via `appointmentService.getAll()` (paged) — no separate calendar endpoint exists.

### 4.4 Department Components
- Removed `code`, `headEmployeeId`, `floor`; added `location`.
- `department-form` unwraps `res.data.items` (paged list).

### 4.5 Notification Components
- `notif.type` → `notif.notificationType`; `res.data.data` → `res.data.items`.

### 4.6 Visit Model
- `VisitStatus.Expected` → `VisitStatus.Scheduled` (matching backend).

### 4.7 Unavailability / Scheduling
- Unavailability time-range and repeat fields wired to the backend
  (`startTime`, `endTime`, `repeat`) added after the
  `AddUnavailabilityTimeAndRepeat` migration.
- Conflicting appointments are auto-handled by the backend when unavailability
  is created/updated.

### 4.8 Visitor Items & Checkout
- Check-in passes `visitorItems`; security verifies via
  `/visits/{id}/items/verify`; check-out surfaces checkout items via
  `/visits/{id}/checkout-items`.

### 4.9 Icon Accessibility
- All icon buttons across both portals have `matTooltip` + `aria-label`.
- `MatTooltipModule` imported in all components with icon buttons.

---

## 5. Build Status Summary

### Backend (.NET 10)
```
Build succeeded.
    2 Warning(s)  (AutoMapper vulnerability - NU1903)
    0 Error(s)
```

### Visitor Portal (Angular 22)
```
Application bundle generation complete.
    2 Warnings (optional chain, Sass deprecation)
    0 Errors
    Output: dist/ecx-visitor-portal/
```

### Employee Portal (Angular 22)
```
Application bundle generation complete.
    12 Warnings (unused imports, content projection, optional chain, Sass deprecation)
    0 Errors
    Output: dist/ecx-employee-portal/
```

---

## 6. Remaining Observations (Non-Breaking)

1. **AutoMapper vulnerability warning (NU1903):** Transitive dependency advisory;
   does not affect the runtime build. Consider upgrading AutoMapper when a
   patched version is available.
2. **Two build warnings** in the visitor portal and **twelve** in the employee
   portal (unused imports, content projection, optional chain, Sass
   deprecation) — cosmetic only, no runtime impact.
3. **`sortDesc` passed as boolean query param:** Works correctly with the
   backend binder; some services could standardize on `true`/`false` strings.
4. **No API versioning:** endpoints are unversioned (acceptable for this
   deployment stage).

---

## 7. Recommendations for Further Improvement

1. **Add role-based route guards** in the employee portal for
   `/admin`, `/ceo`, `/dept`, `/reception`, `/security` sections — currently
   enforced server-side; client guards would improve UX. *(Partial: employee
   portal already applies `RoleGuard` with `data.roles` on lazy routes.)*
2. **Add pagination to today/active lists** if visit volumes grow.
3. **Index queue tables** on `status` if queue volume grows (currently scanned
   without an index).
4. **Add API versioning** when a public API is required.
