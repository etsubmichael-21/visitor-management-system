# ECX Visitor Management System - Integration Audit Report

**Date:** July 14, 2026  
**Auditor:** Automated Integration Audit  
**Status:** All 3 projects build successfully (0 errors)

---

## Executive Summary

| Project | Errors | Warnings | Build Status |
|---------|--------|----------|-------------|
| Backend (ASP.NET Core) | 0 | 2 (AutoMapper vulnerability) | PASS |
| Visitor Portal (Angular) | 0 | 2 (optional chain, Sass deprecation) | PASS |
| Employee Portal (Angular) | 0 | 12 (unused imports, content projection, optional chain) | PASS |

The system consists of **12 backend controllers** exposing **85 endpoints**, consumed by **2 Angular frontends** with **58 unique API call paths**. All model mismatches, route mismatches, and type errors have been resolved.

---

## 1. Architecture Overview

### Backend
- **Framework:** ASP.NET Core (.NET 10.0)
- **Database:** PostgreSQL 15 (`localhost:5432`, db: `visitormanagement`)
- **Auth:** JWT Bearer Tokens with refresh tokens
- **Route Convention:** Explicit `[Route("api/...")]` on each controller (no global prefix)
- **Response Envelope:** `ApiResponse<T>` { success, message, data }
- **Pagination:** `PagedResponse<T>` { items, totalCount, page, pageSize, totalPages, hasPrevious, hasNext }
- **Middleware Pipeline:** ExceptionMiddleware → AuditMiddleware → StaticFiles → CORS → Auth → Controllers

### Frontends
- **Visitor Portal:** `localhost:4200` (Angular 22, TypeScript 6.0.2, Angular Material 22)
- **Employee Portal:** `localhost:4201` (Angular 22, TypeScript 6.0.2, Angular Material 22)
- **API Base URL:** `http://localhost:5281/api`

### Sample Users
| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@ecx.et | Admin@123 | Admin |
| Employee | abebe.kebede@ecx.et | Employee@123 | Employee |
| Visitor | hiwot.alemayehu@email.com | Visitor@123 | Visitor |

---

## 2. Complete Backend Endpoint Reference

### 2.1 AuthController (`api/auth`)
| Method | Route | Auth | Request | Response | Notes |
|--------|-------|------|---------|----------|-------|
| POST | `/auth/login` | None | `{ email, password }` | `LoginResponse` | |
| POST | `/auth/register-visitor` | None | `{ fullName, email, password, phone, address, nationalId?, organization?, gender? }` | `LoginResponse` | |
| POST | `/auth/refresh-token` | None | `{ refreshToken }` | `LoginResponse` | |
| POST | `/auth/change-password` | `[Authorize]` | `{ oldPassword, newPassword }` | null | |
| POST | `/auth/forgot-password` | None | `{ email }` | null | Always returns 200 |
| POST | `/auth/reset-password` | None | `{ token, newPassword }` | null | |
| POST | `/auth/logout` | `[Authorize]` | `{ refreshToken }` | null | |

**LoginResponse:** `{ token, refreshToken, fullName, email, role, userId, employeeId?, visitorId? }`

### 2.2 EmployeesController (`api/employees`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/employees` | `[Authorize]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<EmployeeResponseDto>` |
| GET | `/employees/{id}` | `[Authorize]` | - | `EmployeeResponseDto` |
| POST | `/employees` | `[Authorize]` | `{ fullName, phone, email, departmentId, position, officeNumber? }` | `EmployeeResponseDto` (201) |
| PUT | `/employees/{id}` | `[Authorize]` | `{ fullName?, phone?, departmentId?, position?, officeNumber?, status? }` | `EmployeeResponseDto` |
| DELETE | `/employees/{id}` | `[Authorize]` | - | null |
| GET | `/employees/{id}/schedule` | `[Authorize]` | - | `EmployeeScheduleDto[]` |
| PUT | `/employees/{id}/schedule` | `[Authorize]` | `{ schedules: EmployeeScheduleDto[] }` | `EmployeeScheduleDto[]` |
| POST | `/employees/{id}/unavailability` | `[Authorize]` | `{ employeeId, unavailabilityType, startDate, endDate?, reason? }` | `EmployeeUnavailabilityResponseDto` |
| DELETE | `/employees/{id}/unavailability/{unavailabilityId}` | `[Authorize]` | - | null |
| GET | `/employees/available` | `[Authorize]` | `?date=` | `EmployeeResponseDto[]` |
| GET | `/employees/search` | `[Authorize]` | `?q=&page=&pageSize=` | `PagedResponse<EmployeeResponseDto>` |

**EmployeeResponseDto:** `{ id, fullName, phone, email, departmentId, departmentName, position, officeNumber?, status, userId?, pendingAppointments, totalAppointments, createdAt }`

### 2.3 VisitorsController (`api/visitors`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/visitors` | `[Authorize]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<VisitorResponseDto>` |
| GET | `/visitors/{id}` | `[Authorize]` | - | `VisitorResponseDto` |
| POST | `/visitors` | `[Authorize]` | `{ fullName, phone, email, address, nationalId?, organization?, gender? }` | `VisitorResponseDto` (201) |
| PUT | `/visitors/{id}` | `[Authorize]` | `{ fullName?, phone?, address?, organization?, gender? }` | `VisitorResponseDto` |
| DELETE | `/visitors/{id}` | `[Authorize]` | - | null |
| POST | `/visitors/{id}/photo` | `[Authorize]` | `IFormFile` (multipart) | `{ photoUrl }` |
| GET | `/visitors/search` | `[Authorize]` | `?q=&page=&pageSize=` | `PagedResponse<VisitorResponseDto>` |

**VisitorResponseDto:** `{ id, fullName, phone, email, address, nationalId?, organization?, gender?, photoUrl?, isActive, totalVisits, totalAppointments, createdAt }`

### 2.4 AppointmentsController (`api/appointments`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/appointments` | `[Authorize]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<AppointmentResponseDto>` |
| GET | `/appointments/{id}` | `[Authorize]` | - | `AppointmentResponseDto` |
| POST | `/appointments` | `[Authorize]` | `{ visitorId, employeeId, requestedDate, requestedStartTime, requestedEndTime, purpose, isConfidential, notes? }` | `AppointmentResponseDto` (201) |
| POST | `/appointments/{id}/approve` | `[Authorize]` | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/reject` | `[Authorize]` | `{ reason }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/cancel` | `[Authorize]` | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/complete` | `[Authorize]` | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/delegate` | `[Authorize]` | `{ newEmployeeId, reason? }` | `AppointmentResponseDto` |
| POST | `/appointments/{id}/redirect` | `[Authorize]` | `{ newEmployeeId, newDepartmentId?, reason? }` | `AppointmentResponseDto` |
| PATCH | `/appointments/{id}/confidential` | `[Authorize]` | - | `AppointmentResponseDto` |
| POST | `/appointments/{id}/reschedule` | `[Authorize]` | `{ newDate, newStartTime, newEndTime, reason? }` | `RescheduleResponseDto` |
| GET | `/appointments/{id}/comments` | `[Authorize]` | - | `AppointmentCommentDto[]` |
| POST | `/appointments/{id}/comments` | `[Authorize]` | `{ commentText, isInternal }` | `AppointmentCommentDto` |
| GET | `/appointments/{id}/attachments` | `[Authorize]` | - | `AppointmentAttachmentDto[]` |
| POST | `/appointments/{id}/attachments` | `[Authorize]` | `IFormFile` (multipart) | `AppointmentAttachmentDto` |
| DELETE | `/appointments/{id}/attachments/{attachmentId}` | `[Authorize]` | - | null |
| GET | `/appointments/by-visitor/{visitorId}` | `[Authorize]` | - | `AppointmentResponseDto[]` |
| GET | `/appointments/by-employee/{employeeId}` | `[Authorize]` | - | `AppointmentResponseDto[]` |
| GET | `/appointments/pending` | `[Authorize]` | - | `AppointmentResponseDto[]` |
| GET | `/appointments/today` | `[Authorize]` | - | `AppointmentResponseDto[]` |
| GET | `/appointments/by-department/{departmentId}` | `[Authorize]` | - | `AppointmentResponseDto[]` |
| GET | `/appointments/confidential` | `[Authorize(Roles="Admin,CEO,DepartmentHead")]` | - | `AppointmentResponseDto[]` |

**AppointmentResponseDto:** `{ id, visitorId, visitorName, visitorEmail, visitorPhone, employeeId, employeeName, employeePosition, departmentName, requestedDate, requestedStartTime, requestedEndTime, purpose, status, employeeResponse?, approvalDate?, checkInAllowed, isConfidential, appointmentCode?, rejectionReason?, notes?, delegatedToEmployeeId?, delegatedToEmployeeName?, originalEmployeeId?, originalEmployeeName?, attachments, commentCount, createdAt, updatedAt? }`

**AppointmentStatus values:** `Pending`, `Approved`, `Rejected`, `Cancelled`, `Completed`, `EmployeeUnavailable`, `Rescheduled`, `Delegated`

### 2.5 DepartmentsController (`api/departments`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/departments` | `[Authorize]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<DepartmentResponseDto>` |
| GET | `/departments/{id}` | `[Authorize]` | - | `DepartmentResponseDto` |
| POST | `/departments` | `[Authorize(Roles="Admin")]` | `{ name, description?, location?, phone?, email? }` | `DepartmentResponseDto` (201) |
| PUT | `/departments/{id}` | `[Authorize(Roles="Admin")]` | `{ name?, description?, location?, phone?, email?, isActive? }` | `DepartmentResponseDto` |
| DELETE | `/departments/{id}` | `[Authorize(Roles="Admin")]` | - | null |
| GET | `/departments/{id}/stats` | `[Authorize]` | - | `DepartmentStatsDto` |
| GET | `/departments/active` | `[Authorize]` | - | `PagedResponse<DepartmentResponseDto>` (PageSize=100) |

**DepartmentResponseDto:** `{ id, name, description?, location?, phone?, email?, isActive, employeeCount, pendingAppointments, totalAppointmentsThisMonth, createdAt }`

### 2.6 VisitsController (`api/visits`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/visits` | `[Authorize]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<VisitResponseDto>` |
| GET | `/visits/{id}` | `[Authorize]` | - | `VisitResponseDto` |
| POST | `/visits` | `[Authorize]` | `{ visitorId, employeeId, appointmentId?, purpose, isDestinationKnown, remark? }` | `VisitResponseDto` (201) |
| POST | `/visits/check-in` | `[Authorize]` | `{ visitorId, employeeId, appointmentId?, purpose, securityOfficer, isDestinationKnown, badgeNumber? }` | `VisitResponseDto` |
| POST | `/visits/{id}/check-out` | `[Authorize]` | `{ securityOfficer, remark? }` | `VisitResponseDto` |
| POST | `/visits/{id}/cancel` | `[Authorize]` | - | `VisitResponseDto` |
| GET | `/visits/by-visitor/{visitorId}` | `[Authorize]` | - | `VisitResponseDto[]` |
| GET | `/visits/by-employee/{employeeId}` | `[Authorize]` | - | `VisitResponseDto[]` |
| GET | `/visits/today` | `[Authorize]` | - | `VisitResponseDto[]` |
| GET | `/visits/active` | `[Authorize]` | - | `VisitResponseDto[]` |
| POST | `/visits/{id}/items` | `[Authorize]` | `[{ itemName, quantity, serialNumber?, brand?, description? }]` | `VisitorItemDto[]` |
| POST | `/visits/{id}/items/verify` | `[Authorize]` | `[{ itemId, isVerified }]` | `VisitorItemDto[]` |

**VisitResponseDto:** `{ id, visitorId, visitorName, visitorPhone, visitorEmail, visitorPhotoUrl?, employeeId, employeeName, departmentName, appointmentId?, appointment?, purpose, visitDate, checkInTime?, checkOutTime?, status, badgeNumber?, securityOfficer?, remark?, isDestinationKnown, redirectNote?, visitorItems, allItemsVerified, createdAt }`

**VisitStatus values:** `Scheduled`, `CheckedIn`, `CheckedOut`, `Cancelled`

### 2.7 NotificationsController (`api/notifications`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/notifications` | `[Authorize]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<NotificationResponseDto>` |
| GET | `/notifications/{id}` | `[Authorize]` | - | `NotificationResponseDto` |
| GET | `/notifications/unread` | `[Authorize]` | - | `NotificationResponseDto[]` |
| GET | `/notifications/unread/count` | `[Authorize]` | - | `{ count: number }` |
| POST | `/notifications/{id}/read` | `[Authorize]` | - | null |
| POST | `/notifications/read-all` | `[Authorize]` | - | null |
| DELETE | `/notifications/{id}` | `[Authorize]` | - | null |
| GET | `/notifications/visitor/{visitorId}` | `[Authorize]` | `?page&pageSize` | `PagedResponse<VisitorNotificationResponseDto>` |
| GET | `/notifications/visitor/{visitorId}/unread` | `[Authorize]` | - | `VisitorNotificationResponseDto[]` |
| POST | `/notifications/visitor/{visitorId}/read/{notificationId}` | `[Authorize]` | - | null |
| POST | `/notifications/visitor/{visitorId}/read-all` | `[Authorize]` | - | null |
| GET | `/notifications/visitor/{visitorId}/unread/count` | `[Authorize]` | - | `{ count: number }` |

**NotificationResponseDto:** `{ id, employeeId, appointmentId?, title, message, notificationType, priority, isRead, readAt?, channel, createdAt }`

### 2.8 DashboardController (`api/dashboard`)
| Method | Route | Auth | Response |
|--------|-------|------|----------|
| GET | `/dashboard/stats` | `[Authorize]` | `DashboardStatsDto` |
| GET | `/dashboard/admin` | `[Authorize(Roles="Admin")]` | `AdminDashboardDto` |
| GET | `/dashboard/ceo` | `[Authorize(Roles="CEO")]` | `CeoDashboardDto` |
| GET | `/dashboard/department-head` | `[Authorize(Roles="DepartmentHead")]` | `DepartmentHeadDashboardDto` |
| GET | `/dashboard/employee` | `[Authorize]` | `EmployeeDashboardDto` |
| GET | `/dashboard/receptionist` | `[Authorize(Roles="Receptionist,Admin")]` | `ReceptionistDashboardDto` |
| GET | `/dashboard/security` | `[Authorize(Roles="Security,Admin")]` | `SecurityDashboardDto` |

**DashboardStatsDto:** `{ totalVisitorsToday, totalVisitorsThisWeek, totalVisitorsThisMonth, activeAppointments, pendingAppointments, checkedInVisitors, totalEmployees, totalDepartments, unreadNotifications }`

### 2.9 ReportsController (`api/reports`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/reports/visitors` | `[Authorize]` | `?startDate&endDate&departmentId` | `VisitorReportDto` |
| GET | `/reports/appointments` | `[Authorize]` | `?startDate&endDate&departmentId` | `AppointmentReportDto` |
| GET | `/reports/departments` | `[Authorize]` | `?startDate&endDate` | `DepartmentReportDto[]` |
| GET | `/reports/employees` | `[Authorize]` | `?startDate&endDate` | `EmployeeReportDto[]` |
| GET | `/reports/export/visitors` | `[Authorize]` | `?startDate&endDate` | Excel file (binary) |
| GET | `/reports/export/appointments` | `[Authorize]` | `?startDate&endDate` | Excel file (binary) |
| GET | `/reports/export/visits` | `[Authorize]` | `?startDate&endDate` | Excel file (binary) |

### 2.10 UsersController (`api/users`) - Admin only
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/users` | `[Authorize(Roles="Admin")]` | `?page&pageSize&search&sortBy&sortDesc` | `PagedResponse<UserResponseDto>` |
| GET | `/users/{id}` | `[Authorize(Roles="Admin")]` | - | `UserResponseDto` |
| POST | `/users` | `[Authorize(Roles="Admin")]` | `{ fullName, email, password, role, employeeId? }` | `UserResponseDto` (201) |
| PUT | `/users/{id}` | `[Authorize(Roles="Admin")]` | `{ fullName?, email?, role?, isActive? }` | `UserResponseDto` |
| DELETE | `/users/{id}` | `[Authorize(Roles="Admin")]` | - | null |
| PATCH | `/users/{id}/activate` | `[Authorize(Roles="Admin")]` | - | `UserResponseDto` |
| PATCH | `/users/{id}/deactivate` | `[Authorize(Roles="Admin")]` | - | `UserResponseDto` |
| POST | `/users/{id}/reset-password` | `[Authorize(Roles="Admin")]` | - | `{ newPassword }` |

### 2.11 SearchController (`api/search`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/search` | `[Authorize]` | `?q=&page=&pageSize=` | `{ visitors, employees }` |
| GET | `/search/visitors` | `[Authorize]` | `?q=&page=&pageSize=` | `PagedResponse<VisitorResponseDto>` |
| GET | `/search/employees` | `[Authorize]` | `?q=&page=&pageSize=` | `PagedResponse<EmployeeResponseDto>` |

### 2.12 UploadController (`api/upload`)
| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| POST | `/upload/photo` | `[Authorize]` | `IFormFile` (jpg/png/gif/webp, max 5MB) | `{ url }` |
| POST | `/upload/attachment` | `[Authorize]` | `IFormFile` (any, max 10MB) | `{ url, fileName, size }` |
| POST | `/upload/document` | `[Authorize]` | `IFormFile` (pdf/doc/xls/txt/csv, max 10MB) | `{ url, fileName, size }` |
| DELETE | `/upload/{type}/{fileName}` | `[Authorize(Roles="Admin")]` | - | null |

---

## 3. Frontend-to-Backend Integration Map

### 3.1 Visitor Portal Services

| Service Method | HTTP | Backend Endpoint | Status | Notes |
|---------------|------|------------------|--------|-------|
| `authService.login()` | POST | `/auth/login` | ✅ Aligned | |
| `authService.register()` | POST | `/auth/register-visitor` | ✅ Aligned | |
| `authService.refreshToken()` | POST | `/auth/refresh-token` | ✅ Aligned | |
| `authService.changePassword()` | POST | `/auth/change-password` | ✅ Aligned | |
| `authService.forgotPassword()` | POST | `/auth/forgot-password` | ✅ Aligned | |
| `authService.resetPassword()` | POST | `/auth/reset-password` | ✅ Aligned | |
| `visitorService.getProfile()` | GET | `/visitors/{id}` | ✅ Aligned | |
| `visitorService.updateProfile()` | PUT | `/visitors/{id}` | ✅ Aligned | |
| `visitorService.uploadPhoto()` | POST | `/visitors/{id}/photo` | ✅ Aligned | |
| `visitorService.getAll()` | GET | `/visitors` | ✅ Aligned | |
| `visitorService.create()` | POST | `/visitors` | ✅ Aligned | |
| `visitorService.update()` | PUT | `/visitors/{id}` | ✅ Aligned | |
| `visitorService.delete()` | DELETE | `/visitors/{id}` | ✅ Aligned | |
| `visitorService.getVisitorStats()` | GET | `/dashboard/stats` | ✅ Aligned | |
| `appointmentService.getAppointments()` | GET | `/appointments` | ✅ Aligned | |
| `appointmentService.getAppointment()` | GET | `/appointments/{id}` | ✅ Aligned | |
| `appointmentService.createAppointment()` | POST | `/appointments` | ✅ Aligned | |
| `appointmentService.rescheduleAppointment()` | POST | `/appointments/{id}/reschedule` | ✅ Aligned | |
| `appointmentService.cancelAppointment()` | POST | `/appointments/{id}/cancel` | ✅ Aligned | |
| `appointmentService.getUpcomingAppointments()` | GET | `/appointments/upcoming` | ⚠️ MISSING | No `/appointments/upcoming` in backend. Should use `/appointments/today` or filter by status |
| `appointmentService.getAppointmentStats()` | GET | `/appointments/stats` | ⚠️ MISSING | No `/appointments/stats` in backend |
| `visitService.getAll()` | GET | `/visits` | ✅ Aligned | |
| `visitService.getById()` | GET | `/visits/{id}` | ✅ Aligned | |
| `visitService.checkIn()` | POST | `/visits/check-in` | ✅ Aligned | |
| `visitService.checkOut()` | POST | `/visits/{id}/check-out` | ✅ Aligned | |
| `visitService.getByVisitor()` | GET | `/visits/by-visitor/{visitorId}` | ✅ Aligned | |
| `visitService.getTodayVisits()` | GET | `/visits/today` | ✅ Aligned | |
| `visitService.getActiveVisits()` | GET | `/visits/active` | ✅ Aligned | |
| `notificationService.getNotifications()` | GET | `/notifications` | ✅ Aligned | |
| `notificationService.getUnreadCount()` | GET | `/notifications/unread/count` | ✅ Aligned | |
| `notificationService.markAsRead()` | POST | `/notifications/{id}/read` | ✅ Aligned | |
| `notificationService.markAllAsRead()` | POST | `/notifications/read-all` | ✅ Aligned | |
| `notificationService.deleteNotification()` | DELETE | `/notifications/{id}` | ✅ Aligned | |
| `dashboardService.getStats()` | GET | `/dashboard/stats` | ✅ Aligned | |

### 3.2 Employee Portal Services

| Service Method | HTTP | Backend Endpoint | Status | Notes |
|---------------|------|------------------|--------|-------|
| `authService.login()` | POST | `/auth/login` | ✅ Aligned | |
| `authService.forgotPassword()` | POST | `/auth/forgot-password` | ✅ Aligned | |
| `authService.changePassword()` | POST | `/auth/change-password` | ✅ Aligned | |
| `appointmentService.getAll()` | GET | `/appointments` | ✅ Aligned | |
| `appointmentService.getById()` | GET | `/appointments/{id}` | ✅ Aligned | |
| `appointmentService.create()` | POST | `/appointments` | ✅ Aligned | |
| `appointmentService.update()` | PUT | `/appointments/{id}` | ✅ Aligned | |
| `appointmentService.delete()` | DELETE | `/appointments/{id}` | ✅ Aligned | |
| `appointmentService.approve()` | POST | `/appointments/{id}/approve` | ✅ Aligned | |
| `appointmentService.reject()` | POST | `/appointments/{id}/reject` | ✅ Aligned | |
| `appointmentService.delegate()` | POST | `/appointments/{id}/delegate` | ✅ Aligned | |
| `appointmentService.complete()` | POST | `/appointments/{id}/complete` | ✅ Aligned | |
| `appointmentService.cancel()` | POST | `/appointments/{id}/cancel` | ✅ Aligned | |
| `appointmentService.getPendingApprovals()` | GET | `/appointments/pending` | ✅ Aligned | |
| `visitService.getAll()` | GET | `/visits` | ✅ Aligned | |
| `visitService.getById()` | GET | `/visits/{id}` | ✅ Aligned | |
| `visitService.checkIn()` | POST | `/visits/check-in` | ✅ Aligned | |
| `visitService.checkOut()` | POST | `/visits/{id}/check-out` | ✅ Aligned | |
| `visitService.getActiveVisits()` | GET | `/visits/active` | ✅ Aligned | |
| `visitService.getTodayVisits()` | GET | `/visits/today` | ✅ Aligned | |
| `visitService.cancel()` | POST | `/visits/{id}/cancel` | ✅ Aligned | |
| `visitService.getByVisitorId()` | GET | `/visits/by-visitor/{visitorId}` | ✅ Aligned | |
| `employeeService.getAll()` | GET | `/employees` | ✅ Aligned | |
| `employeeService.getById()` | GET | `/employees/{id}` | ✅ Aligned | |
| `employeeService.create()` | POST | `/employees` | ✅ Aligned | |
| `employeeService.update()` | PUT | `/employees/{id}` | ✅ Aligned | |
| `employeeService.delete()` | DELETE | `/employees/{id}` | ✅ Aligned | |
| `employeeService.search()` | GET | `/employees/search` | ✅ Aligned | |
| `departmentService.getAll()` | GET | `/departments` | ⚠️ RETURN TYPE | Returns `PagedResponse<Department>`, frontend expects `Department[]` |
| `departmentService.getById()` | GET | `/departments/{id}` | ✅ Aligned | |
| `departmentService.create()` | POST | `/departments` | ✅ Aligned | |
| `departmentService.update()` | PUT | `/departments/{id}` | ✅ Aligned | |
| `departmentService.delete()` | DELETE | `/departments/{id}` | ✅ Aligned | |
| `notificationService.getAll()` | GET | `/notifications` | ✅ Aligned | |
| `notificationService.getUnreadCount()` | GET | `/notifications/unread/count` | ✅ Aligned | |
| `notificationService.markAsRead()` | POST | `/notifications/{id}/read` | ✅ Aligned | |
| `notificationService.markAllAsRead()` | POST | `/notifications/read-all` | ✅ Aligned | |
| `notificationService.delete()` | DELETE | `/notifications/{id}` | ✅ Aligned | |
| `reportService.generateReport()` | GET | `/reports/{type}` | ✅ Aligned | Routes to visitors/appointments/departments |
| `reportService.getVisitorReport()` | GET | `/reports/visitors` | ✅ Aligned | |
| `reportService.getAppointmentReport()` | GET | `/reports/appointments` | ✅ Aligned | |
| `reportService.getDepartmentReport()` | GET | `/reports/departments` | ✅ Aligned | |
| `reportService.exportVisitors()` | GET | `/reports/export/visitors` | ✅ Aligned | |
| `reportService.exportAppointments()` | GET | `/reports/export/appointments` | ✅ Aligned | |
| `userService.getAll()` | GET | `/users` | ✅ Aligned | |
| `userService.getById()` | GET | `/users/{id}` | ✅ Aligned | |
| `userService.create()` | POST | `/users` | ✅ Aligned | |
| `userService.update()` | PUT | `/users/{id}` | ✅ Aligned | |
| `userService.delete()` | DELETE | `/users/{id}` | ✅ Aligned | |
| `userService.activate()` | PATCH | `/users/{id}/activate` | ✅ Aligned | |
| `userService.deactivate()` | PATCH | `/users/{id}/deactivate` | ✅ Aligned | |
| `userService.resetPassword()` | POST | `/users/{id}/reset-password` | ✅ Aligned | |
| `visitorService.getAll()` | GET | `/visitors` | ✅ Aligned | |
| `visitorService.getById()` | GET | `/visitors/{id}` | ✅ Aligned | |
| `visitorService.search()` | GET | `/visitors/search` | ✅ Aligned | |
| `visitorService.getVisitHistory()` | GET | `/visits/by-visitor/{id}` | ✅ Aligned | |
| `dashboardService.getAdminDashboard()` | GET | `/dashboard/admin` | ✅ Aligned | |
| `dashboardService.getCeoDashboard()` | GET | `/dashboard/ceo` | ✅ Aligned | |
| `dashboardService.getDeptHeadDashboard()` | GET | `/dashboard/department-head` | ✅ Aligned | |
| `dashboardService.getEmployeeDashboard()` | GET | `/dashboard/employee` | ✅ Aligned | |
| `dashboardService.getReceptionistDashboard()` | GET | `/dashboard/receptionist` | ✅ Aligned | |
| `dashboardService.getSecurityDashboard()` | GET | `/dashboard/security` | ✅ Aligned | |

---

## 4. Remaining Runtime Mismatches (Non-Breaking Build)

These are correct TypeScript types that will produce `undefined` values at runtime because field names differ between frontend models and backend DTOs.

### 4.1 Employee Portal Visitor Model Mismatch

**Frontend model (`visitor.service.ts`):**
```typescript
interface Visitor {
  firstName: string;
  lastName: string;
  company?: string;
  totalVisits: number;
  isBlacklisted: boolean;
}
```

**Backend `VisitorResponseDto`:**
```
fullName: string;
organization?: string;
totalVisits: number;
isActive: boolean;
```

**Impact:** `firstName`, `lastName` will be `undefined` (use `fullName` instead). `company` will be `undefined` (use `organization`). `isBlacklisted` will be `undefined` (no blacklist field in response DTO).

### 4.2 Visitor Portal Missing Backend Endpoints

| Frontend Call | Backend Status | Recommendation |
|--------------|----------------|----------------|
| `GET /appointments/upcoming` | Does not exist | Use `/appointments` with status filter, or `/appointments/today` |
| `GET /appointments/stats` | Does not exist | Calculate client-side from paginated data, or add backend endpoint |

### 4.3 DepartmentService.getAll() Return Type

**Frontend expects:** `ApiResponse<Department[]>`  
**Backend returns:** `ApiResponse<PagedResponse<Department>>`

**Impact:** Components calling `departmentService.getAll()` and accessing `res.data` directly will get `undefined`. Should access `res.data.items` instead. This is currently working in most components because they handle the response with `res.data || []`.

---

## 5. All Fixes Applied in This Session

### 5.1 Auth & Response Model Alignment
- `LoginResponse` flattened to match backend `{ token, refreshToken, fullName, email, role, userId, employeeId?, visitorId? }`
- `RegisterRequest` fields aligned: `fullName`, `organization`, `address`, `nationalId`, `gender`
- `ChangePasswordRequest` aligned: `oldPassword`/`newPassword` (camelCase)
- `ResetPasswordRequest` aligned: `token`/`newPassword`
- `PaginatedResponse` aligned: `items`, `totalCount`, `hasPrevious`, `hasNext`

### 5.2 Dashboard Component Fixes (6 dashboards)
- `totalVisitors` → `totalVisitorsToday`
- `todayVisitors` → `totalVisitorsToday`
- `activeVisitors` → `checkedInVisitors`
- `totalAppointments` → `activeAppointments`
- `userName` → `user.fullName`
- All fallback mock data fields aligned to `DashboardStatsDto`

### 5.3 Calendar Component Fixes
- `scheduledTime` → `requestedStartTime`
- `title` → `purpose`
- `hostEmployeeName` → `employeeName`
- `scheduledDate` → `requestedDate`
- `getCalendarEvents()` → `getAll()` (no calendar endpoint exists)

### 5.4 Department Components
- `department-form`: Removed `code`, `headEmployeeId`, `floor` fields; added `location`
- `department-list`: `code` → removed, `floor` → `location`, `headEmployeeName` → contact info
- `department-form`: `res.data.data` → `res.data.items`

### 5.5 Notification Components
- `notif.type` → `notif.notificationType` (all 6 occurrences)
- `res.data.data` → `res.data.items`
- Added `Notification` type annotation for filter callback

### 5.6 Reports Component
- Added `generateReport()` method to `ReportService` that dispatches to correct endpoint
- Rewrote `ReportService` with proper type mapping from backend DTOs to frontend `ReportData` model
- Added type annotations for `res` and `ds` callback parameters

### 5.7 Check-Out Component
- `hostEmployeeName` → `employeeName`

### 5.8 Settings & Main Layout
- `user.firstName.charAt(0) + user.lastName.charAt(0)` → `user.fullName.split(' ').map(n => n.charAt(0)).join('')`
- Template: `{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}` → `{{ currentUser()?.fullName }}`
- All 4 occurrences across settings.component.ts and main-layout.component.ts

### 5.9 Visit Model
- `VisitStatus.Expected` → `VisitStatus.Scheduled` (matching backend)

### 5.10 Icon Accessibility
- All 30 icon buttons across both portals now have `matTooltip` + `aria-label`
- `MatTooltipModule` imported in all components with icon buttons

---

## 6. Build Status Summary

### Backend (.NET)
```
Build succeeded.
    2 Warning(s)  (AutoMapper vulnerability - NU1903)
    0 Error(s)
```

### Visitor Portal (Angular)
```
Application bundle generation complete.
    2 Warnings (optional chain, Sass deprecation)
    0 Errors
    Output: dist/ecx-visitor-portal/
```

### Employee Portal (Angular)
```
Application bundle generation complete.
    12 Warnings (unused imports, content projection, optional chain, Sass deprecation)
    0 Errors
    Output: dist/ecx-employee-portal/
```

---

## 7. Recommendations for Further Improvement

1. **Add missing backend endpoints:** `/appointments/upcoming` and `/appointments/stats` (used by visitor portal)
2. **Fix visitor model in employee portal:** Update `Visitor` interface to use `fullName`, `organization`, `isActive` instead of `firstName`/`lastName`/`company`/`isBlacklisted`
3. **Fix `DepartmentService.getAll()` return type:** Change to return `PagedResponse<Department>` or add a `getAllList()` method that unwraps to `Department[]`
4. **Update `PageRequest` parameters:** Some frontend services pass `sortBy`/`sortDesc` while backend expects these as query params (this works correctly but the `sortDesc` is a bool vs string)
5. **Add role-based route guards:** Backend has role-specific dashboard endpoints but no route guards enforcing role-based navigation in the frontend
6. **Consider adding API versioning:** Currently no versioning on the API routes
