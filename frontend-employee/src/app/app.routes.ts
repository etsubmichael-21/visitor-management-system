import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [GuestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Admin routes
      { path: 'admin/dashboard', loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/employees', loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/employees/new', loadComponent: () => import('./features/employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/employees/:id', loadComponent: () => import('./features/employees/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/employees/:id/edit', loadComponent: () => import('./features/employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/visitors', loadComponent: () => import('./features/visitors/visitor-list/visitor-list.component').then(m => m.VisitorListComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/visitors/:id', loadComponent: () => import('./features/visitors/visitor-detail/visitor-detail.component').then(m => m.VisitorDetailComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/departments', loadComponent: () => import('./features/departments/department-list/department-list.component').then(m => m.DepartmentListComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/departments/new', loadComponent: () => import('./features/departments/department-form/department-form.component').then(m => m.DepartmentFormComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/departments/:id/edit', loadComponent: () => import('./features/departments/department-form/department-form.component').then(m => m.DepartmentFormComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/users', loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/users/new', loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/appointments', loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/calendar', loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },
      { path: 'admin/reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent), canActivate: [RoleGuard], data: { roles: ['Admin'] } },

      // CEO routes
      { path: 'ceo/dashboard', loadComponent: () => import('./features/dashboard/ceo-dashboard/ceo-dashboard.component').then(m => m.CeoDashboardComponent), canActivate: [RoleGuard], data: { roles: ['CEO'] } },
      { path: 'ceo/appointments', loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent), canActivate: [RoleGuard], data: { roles: ['CEO'] } },
      { path: 'ceo/departments', loadComponent: () => import('./features/departments/department-list/department-list.component').then(m => m.DepartmentListComponent), canActivate: [RoleGuard], data: { roles: ['CEO'] } },
      { path: 'ceo/reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent), canActivate: [RoleGuard], data: { roles: ['CEO'] } },
      { path: 'ceo/calendar', loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent), canActivate: [RoleGuard], data: { roles: ['CEO'] } },

      // Department Head routes
      { path: 'dept/dashboard', loadComponent: () => import('./features/dashboard/dept-head-dashboard/dept-head-dashboard.component').then(m => m.DeptHeadDashboardComponent), canActivate: [RoleGuard], data: { roles: ['DepartmentHead'] } },
      { path: 'dept/appointments', loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent), canActivate: [RoleGuard], data: { roles: ['DepartmentHead'] } },
      { path: 'dept/employees', loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent), canActivate: [RoleGuard], data: { roles: ['DepartmentHead'] } },
      { path: 'dept/calendar', loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent), canActivate: [RoleGuard], data: { roles: ['DepartmentHead'] } },

      // Employee routes
      { path: 'emp/dashboard', loadComponent: () => import('./features/dashboard/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent), canActivate: [RoleGuard], data: { roles: ['Employee'] } },
      { path: 'emp/appointments', loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent), canActivate: [RoleGuard], data: { roles: ['Employee'] } },
      { path: 'emp/calendar', loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent), canActivate: [RoleGuard], data: { roles: ['Employee'] } },

      // Receptionist routes
      { path: 'reception/dashboard', loadComponent: () => import('./features/dashboard/receptionist-dashboard/receptionist-dashboard.component').then(m => m.ReceptionistDashboardComponent), canActivate: [RoleGuard], data: { roles: ['Receptionist'] } },
      { path: 'reception/check-in', loadComponent: () => import('./features/visits/check-in/check-in.component').then(m => m.CheckInComponent), canActivate: [RoleGuard], data: { roles: ['Receptionist'] } },
      { path: 'reception/today', loadComponent: () => import('./features/visits/visit-list/visit-list.component').then(m => m.VisitListComponent), canActivate: [RoleGuard], data: { roles: ['Receptionist'] } },

      // Security routes
      { path: 'security/dashboard', loadComponent: () => import('./features/dashboard/security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent), canActivate: [RoleGuard], data: { roles: ['Security'] } },
      { path: 'security/verify', loadComponent: () => import('./features/verify/verify.component').then(m => m.VerifyComponent), canActivate: [RoleGuard], data: { roles: ['Security'] } },
      { path: 'security/check-out', loadComponent: () => import('./features/visits/check-out/check-out.component').then(m => m.CheckOutComponent), canActivate: [RoleGuard], data: { roles: ['Security'] } },
      { path: 'security/active', loadComponent: () => import('./features/visits/visit-list/visit-list.component').then(m => m.VisitListComponent), canActivate: [RoleGuard], data: { roles: ['Security'] } },

      // Shared routes
      { path: 'appointments/:id', loadComponent: () => import('./features/appointments/appointment-detail/appointment-detail.component').then(m => m.AppointmentDetailComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
