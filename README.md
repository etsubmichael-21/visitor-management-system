# ECX Visitor Management System

Enterprise Visitor Management System for Ethiopia Commodity Exchange (ECX).

## Architecture

- **Backend:** ASP.NET Core 10 Web API with Clean Architecture
- **Database:** PostgreSQL 15+
- **Frontend (Visitor Portal):** Angular 22 with Angular Material (port 4200)
- **Frontend (Employee Portal):** Angular 22 with Angular Material (port 4201)
- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-Based Access Control (6 roles)

## Project Structure

```
VisitorManagement/
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # API endpoints (12 controllers)
│   ├── Services/             # Business logic (11 services)
│   ├── Repositories/         # Data access (10 repositories)
│   ├── Models/               # Entity classes (20 entities)
│   ├── DTOs/                 # Data transfer objects
│   ├── Data/                 # DbContext
│   ├── BackgroundServices/   # Email/SMS processors, reminders
│   ├── Middleware/           # Exception handling, audit logging
│   └── Mapping/              # AutoMapper profiles
├── frontend/                 # Visitor Portal (Angular 22)
│   └── src/app/
│       ├── core/             # Auth, guards, interceptors, services
│       ├── features/         # Home, About, Contact, Auth, Profile, Appointments
│       ├── layouts/          # Public, Auth, Visitor layouts
│       └── shared/           # Reusable components
├── frontend-employee/        # Employee Portal (Angular 22)
│   └── src/app/
│       ├── core/             # Auth, guards, interceptors, services
│       ├── features/         # 6 role-specific dashboards, CRUD features
│       ├── layouts/          # Auth, Main layouts
│       └── shared/           # Reusable components
└── docs/                     # SRS, database docs, ER diagram, migrations
```

## Quick Start

### Prerequisites

- .NET 10 SDK
- Node.js 20+
- PostgreSQL 15+

### Development Setup

1. **Database:**
   ```bash
   # Create the database
   psql -U postgres -c "CREATE DATABASE visitor_management;"
   
   # Run schema
   psql -U postgres -d visitor_management -f docs/visitor_management.sql
   
   # Run migration v2
   psql -U postgres -d visitor_management -f docs/migration_v2.sql
   ```

2. **Backend:**
   ```bash
   cd backend
   dotnet restore
   dotnet run
   # API available at http://localhost:5001
   # Swagger at http://localhost:5001/swagger
   ```

3. **Visitor Portal:**
   ```bash
   cd frontend
   npm install
   npm start
   # Available at http://localhost:4200
   ```

4. **Employee Portal:**
   ```bash
   cd frontend-employee
   npm install
   npm start
   # Available at http://localhost:4201
   ```

### Docker Setup

```bash
docker-compose up -d
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecx.et | Admin@123 |
| CEO | ceo@ecx.et | Admin@123 |
| Receptionist | sara.wondimu@ecx.et | Admin@123 |
| Security | tsegaye.berhan@ecx.et | Admin@123 |

## API Documentation

Visit http://localhost:5001/swagger for interactive Swagger documentation.

## Key Features

### Visitor Portal
- ECX Landing Page with About and Contact
- Visitor Registration and Login
- Profile Management with Photo Upload
- Appointment Request with Attachments
- Appointment Status Tracking
- Reschedule and Cancel Appointments
- In-App Notifications

### Employee Portal
- **Admin:** Full system management, user/role management, reports
- **CEO:** Executive dashboard, confidential appointments, delegation
- **Department Head:** Department approvals, employee management
- **Employee:** Personal calendar, appointment management
- **Receptionist:** Walk-in registration, check-in/out
- **Security:** Visitor verification, item tracking, checkout

### System Features
- JWT Authentication with Refresh Tokens
- Role-Based Authorization (6 roles)
- Email and SMS Notifications
- Background Queue Processing
- Audit Logging
- Swagger API Documentation
- Responsive Design
- Export Reports (PDF/Excel)
