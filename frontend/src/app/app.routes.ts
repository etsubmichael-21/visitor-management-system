import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { VisitorLayoutComponent } from './layouts/visitor-layout/visitor-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: VisitorLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/visitor-dashboard/visitor-dashboard.component').then((m) => m.VisitorDashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/change-password',
        loadComponent: () => import('./features/profile/change-password/change-password.component').then((m) => m.ChangePasswordComponent),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then((m) => m.AppointmentListComponent),
      },
      {
        path: 'appointments/new',
        loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then((m) => m.AppointmentFormComponent),
      },
      {
        path: 'appointments/new/details',
        redirectTo: 'appointments/new',
        pathMatch: 'full',
      },
      {
        path: 'appointments/:id',
        loadComponent: () => import('./features/appointments/appointment-detail/appointment-detail.component').then((m) => m.AppointmentDetailComponent),
      },
      {
        path: 'appointments/:id/reschedule',
        loadComponent: () => import('./features/appointments/reschedule/reschedule.component').then((m) => m.RescheduleComponent),
      },
      {
        path: 'visits',
        loadComponent: () => import('./features/visits/visit-history/visit-history.component').then((m) => m.VisitHistoryComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
