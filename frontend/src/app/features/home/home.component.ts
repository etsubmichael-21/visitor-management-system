import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">Welcome to ECX</div>
        <h1 class="hero-title">
          Visitor Management
          <span class="highlight">Made Simple</span>
        </h1>
        <p class="hero-subtitle">
          Streamline your visit experience with our intelligent visitor management system.
          Schedule appointments, check in seamlessly, and stay connected.
        </p>
        <div class="hero-actions">
          <a mat-flat-button color="primary" routerLink="/auth/register" class="cta-primary">
            <mat-icon>person_add</mat-icon>
            Get Started
          </a>
          <a mat-stroked-button routerLink="/about" class="cta-secondary">
            Learn More
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-graphic">
          <div class="graphic-circle circle-1"></div>
          <div class="graphic-circle circle-2"></div>
          <div class="graphic-icon">
            <mat-icon>security</mat-icon>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="features-inner">
        <h2 class="section-title">Why Choose ECX Visitor Portal</h2>
        <p class="section-subtitle">A modern solution for managing facility access and visitor experiences</p>

        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <mat-card class="feature-card">
              <mat-card-content>
                <div class="feature-icon" [style.background]="feature.bgColor">
                  <mat-icon [style.color]="feature.iconColor">{{ feature.icon }}</mat-icon>
                </div>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="stats-inner">
        @for (stat of stats; track stat.label) {
          <div class="stat-item">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        }
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-inner">
        <h2>Ready to Get Started?</h2>
        <p>Create your account and start scheduling visits in minutes.</p>
        <a mat-flat-button color="primary" routerLink="/auth/register" class="cta-btn">
          <mat-icon>how_to_reg</mat-icon>
          Create Free Account
        </a>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 24px;
      gap: 60px;
    }

    .hero-content { flex: 1; }

    .hero-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }

    .hero-title {
      font-size: 48px;
      font-weight: 800;
      color: #1b5e20;
      line-height: 1.15;
      margin-bottom: 20px;
    }

    .hero-title .highlight {
      display: block;
      color: #d4a017;
    }

    .hero-subtitle {
      font-size: 18px;
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 32px;
      max-width: 500px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .cta-primary {
      padding: 0 28px;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: #2e7d32 !important;
    }

    .cta-primary mat-icon { margin-right: 8px; }

    .cta-secondary {
      padding: 0 24px;
      height: 48px;
      font-size: 16px;
      border-color: #2e7d32 !important;
      color: #2e7d32 !important;
    }

    .cta-secondary mat-icon { margin-left: 8px; }

    .hero-visual { flex: 0 0 400px; }

    .hero-graphic {
      position: relative;
      width: 350px;
      height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .graphic-circle {
      position: absolute;
      border-radius: 50%;
    }

    .circle-1 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(46, 125, 50, 0.12) 0%, rgba(46, 125, 50, 0.02) 70%);
      animation: pulse 4s ease-in-out infinite;
    }

    .circle-2 {
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(212, 160, 23, 0.15) 0%, rgba(212, 160, 23, 0.03) 70%);
      animation: pulse 4s ease-in-out infinite 1s;
    }

    .graphic-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #2e7d32, #388e3c);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 40px rgba(46, 125, 50, 0.3);
    }

    .graphic-icon mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #d4a017;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }

    .features {
      background: #f9fafb;
      padding: 80px 24px;
    }

    .features-inner {
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 12px;
    }

    .section-subtitle {
      text-align: center;
      color: #64748b;
      font-size: 16px;
      margin-bottom: 48px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }

    .feature-card {
      text-align: center;
      padding: 32px 24px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-4px);
    }

    .feature-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .feature-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .feature-card h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10px;
    }

    .feature-card p {
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
    }

    .stats-section {
      background: linear-gradient(135deg, #1b5e20, #2e7d32);
      padding: 60px 24px;
    }

    .stats-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 32px;
    }

    .stat-item { text-align: center; }

    .stat-number {
      font-size: 40px;
      font-weight: 800;
      color: #d4a017;
    }

    .stat-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 4px;
    }

    .cta-section {
      padding: 80px 24px;
      text-align: center;
    }

    .cta-inner { max-width: 600px; margin: 0 auto; }

    .cta-section h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 12px;
    }

    .cta-section p {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 32px;
    }

    .cta-btn {
      padding: 0 32px;
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      background: #2e7d32 !important;
    }

    .cta-btn mat-icon { margin-right: 8px; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; text-align: center; padding: 40px 24px; }
      .hero-subtitle { margin-left: auto; margin-right: auto; }
      .hero-actions { justify-content: center; }
      .hero-visual { display: none; }
      .hero-title { font-size: 32px; }
      .section-title { font-size: 24px; }
      .stat-number { font-size: 28px; }
    }
  `],
})
export class HomeComponent {
  features = [
    {
      icon: 'event_available',
      title: 'Easy Scheduling',
      description: 'Book appointments in advance with your host. Choose your preferred date and time.',
      bgColor: '#e8f5e9',
      iconColor: '#2e7d32',
    },
    {
      icon: 'speed',
      title: 'Fast Check-In',
      description: 'Skip the queue with pre-approved digital passes and streamlined check-in.',
      bgColor: '#fff8e1',
      iconColor: '#d4a017',
    },
    {
      icon: 'notifications_active',
      title: 'Real-time Updates',
      description: 'Receive instant notifications about your appointment status and visitor updates.',
      bgColor: '#e3f2fd',
      iconColor: '#1565c0',
    },
    {
      icon: 'security',
      title: 'Secure Access',
      description: 'Enterprise-grade security ensures your data and facility access are fully protected.',
      bgColor: '#fce4ec',
      iconColor: '#c62828',
    },
  ];

  stats = [
    { value: '10K+', label: 'Visitors Managed' },
    { value: '50+', label: 'Partner Companies' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'Satisfaction' },
  ];
}
