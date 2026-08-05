import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <mat-icon>verified</mat-icon>
          Trusted by 50+ Companies
        </div>
        <h1>
          Smart Visitor<br>
          <span class="gradient-text">Management System</span>
        </h1>
        <p class="hero-desc">
          Streamline your visit experience. Schedule appointments, get instant approvals,
          check in seamlessly, and stay connected — all from one modern portal.
        </p>
        <div class="hero-actions">
          <button mat-flat-button type="button" class="btn-primary" (click)="onBookAppointment()">
            <mat-icon>person_add</mat-icon>
            Book Appointment
          </button>
          <a mat-stroked-button routerLink="/auth/login" class="btn-outline">
            <mat-icon>login</mat-icon>
            Sign In
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-val">10K+</span>
            <span class="stat-lbl">Visitors</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-val">50+</span>
            <span class="stat-lbl">Companies</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-val">99.9%</span>
            <span class="stat-lbl">Uptime</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-card card-1">
          <mat-icon class="card-icon green">event_available</mat-icon>
          <div>
            <div class="card-title">Appointment Confirmed</div>
            <div class="card-sub">Tomorrow at 10:00 AM</div>
          </div>
        </div>
        <div class="visual-card card-2">
          <mat-icon class="card-icon gold">notifications_active</mat-icon>
          <div>
            <div class="card-title">Check-In Ready</div>
            <div class="card-sub">Badge #B-042 assigned</div>
          </div>
        </div>
        <div class="visual-card card-3">
          <mat-icon class="card-icon blue">shield</mat-icon>
          <div>
            <div class="card-title">Secure Access</div>
            <div class="card-sub">Verified &amp; approved</div>
          </div>
        </div>
        <div class="visual-center">
          <div class="center-ring"></div>
          <mat-icon>apartment</mat-icon>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <div class="section-inner">
        <span class="section-badge">How It Works</span>
        <h2>Three Simple Steps</h2>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-num">1</div>
            <div class="step-icon-wrap"><mat-icon>person_add</mat-icon></div>
            <h3>Register</h3>
            <p>Create your visitor account in under a minute with your email and phone number.</p>
          </div>
          <div class="step-connector"><mat-icon>arrow_forward</mat-icon></div>
          <div class="step-card">
            <div class="step-num">2</div>
            <div class="step-icon-wrap"><mat-icon>event</mat-icon></div>
            <h3>Book Appointment</h3>
            <p>Choose your host, pick a date and time, and submit your visit request instantly.</p>
          </div>
          <div class="step-connector"><mat-icon>arrow_forward</mat-icon></div>
          <div class="step-card">
            <div class="step-num">3</div>
            <div class="step-icon-wrap"><mat-icon>badge</mat-icon></div>
            <h3>Check In</h3>
            <p>Get your badge at reception and enjoy a seamless, secure visit experience.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-inner">
        <span class="section-badge">Features</span>
        <h2>Everything You Need</h2>
        <div class="features-grid">
          @for (f of features; track f.title) {
            <div class="feature-card">
              <div class="feature-icon" [style.background]="f.bg">
                <mat-icon [style.color]="f.color">{{ f.icon }}</mat-icon>
              </div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-inner">
        <h2>Ready to Get Started?</h2>
        <p>Create your visitor account and schedule your first visit in minutes.</p>
        <div class="cta-actions">
          <a mat-flat-button routerLink="/auth/register" class="btn-primary-lg">
            <mat-icon>how_to_reg</mat-icon>
            Create Free Account
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  features = [
    { icon: 'event_available', title: 'Easy Scheduling', desc: 'Book appointments with your host in advance. Pick your preferred date and time.', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669' },
    { icon: 'speed', title: 'Fast Check-In', desc: 'Skip the queue with pre-approved digital passes and streamlined check-in.', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706' },
    { icon: 'notifications_active', title: 'Real-time Updates', desc: 'Receive instant notifications about your appointment status and visitor updates.', bg: 'linear-gradient(135deg, #dbeafe, #93c5fd)', color: '#2563eb' },
    { icon: 'lock', title: 'Secure Access', desc: 'Enterprise-grade security ensures your data and facility access are fully protected.', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#db2777' },
  ];

  onBookAppointment(): void {
    if (this.authService.isLoggedIn && !this.authService.isTokenExpired()) {
      this.router.navigate(['/appointments/new']);
    } else {
      this.router.navigate(['/auth/register']);
    }
  }
}
