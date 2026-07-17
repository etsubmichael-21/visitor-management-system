import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  template: `
    <div class="contact-page">
      <section class="contact-hero">
        <h1>Contact <span class="accent">Us</span></h1>
        <p>Have questions? We'd love to hear from you.</p>
      </section>

      <div class="contact-grid">
        <mat-card class="contact-form-card">
          <mat-card-content>
            <h2>Send us a Message</h2>
            <form (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput [(ngModel)]="form.name" name="name" required>
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="form.email" name="email" type="email" required>
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Subject</mat-label>
                <mat-select [(ngModel)]="form.subject" name="subject" required>
                  <mat-option value="general">General Inquiry</mat-option>
                  <mat-option value="support">Technical Support</mat-option>
                  <mat-option value="sales">Sales</mat-option>
                  <mat-option value="feedback">Feedback</mat-option>
                </mat-select>
                <mat-icon matPrefix>subject</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Message</mat-label>
                <textarea matInput [(ngModel)]="form.message" name="message" rows="5" required></textarea>
                <mat-icon matPrefix>message</mat-icon>
              </mat-form-field>

              <button mat-flat-button color="primary" type="submit" class="submit-btn">
                <mat-icon>send</mat-icon>
                Send Message
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="contact-info">
          @for (info of contactInfo; track info.title) {
            <div class="info-card">
              <mat-icon [style.color]="info.color">{{ info.icon }}</mat-icon>
              <h3>{{ info.title }}</h3>
              @for (line of info.lines; track line) {
                <p>{{ line }}</p>
              }
            </div>
          }

          <div class="hours-card">
            <mat-icon style="color: #d4a017;">schedule</mat-icon>
            <h3>Office Hours</h3>
            <div class="hours-grid">
              @for (h of hours; track h.day) {
                <div class="hours-row">
                  <span class="day">{{ h.day }}</span>
                  <span class="time">{{ h.time }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page { max-width: 1200px; margin: 0 auto; padding: 0 24px 60px; }

    .contact-hero {
      text-align: center;
      padding: 60px 0 40px;
    }

    .contact-hero h1 {
      font-size: 40px;
      font-weight: 800;
      color: #1b5e20;
    }

    .accent { color: #d4a017; }

    .contact-hero p {
      color: #64748b;
      font-size: 18px;
      margin-top: 12px;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 32px;
      align-items: start;
    }

    .contact-form-card h2 {
      font-size: 22px;
      font-weight: 600;
      color: #1b5e20;
      margin-bottom: 24px;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: #2e7d32 !important;
    }

    .submit-btn mat-icon { margin-right: 8px; }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-card, .hours-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .info-card mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      margin-bottom: 8px;
    }

    .info-card h3, .hours-card h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .info-card p {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
    }

    .hours-card mat-icon { margin-bottom: 8px; }

    .hours-grid { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }

    .hours-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .day { color: #64748b; }
    .time { color: #1e293b; font-weight: 500; }

    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; }
      .contact-hero h1 { font-size: 32px; }
    }
  `],
})
export class ContactComponent {
  form = {
    name: '',
    email: '',
    subject: 'general',
    message: '',
  };

  contactInfo = [
    { icon: 'location_on', title: 'Address', lines: ['123 Business Center Drive', 'New York, NY 10001'], color: '#2e7d32' },
    { icon: 'phone', title: 'Phone', lines: ['+1 (555) 123-4567', '+1 (555) 987-6543'], color: '#d4a017' },
    { icon: 'email', title: 'Email', lines: ['support&#64;ecx-visitor.com', 'info&#64;ecx-visitor.com'], color: '#1565c0' },
  ];

  hours = [
    { day: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', time: '9:00 AM - 2:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ];

  onSubmit(): void {
    alert('Thank you for your message! We will get back to you within 24 hours.');
    this.form = { name: '', email: '', subject: 'general', message: '' };
  }
}
