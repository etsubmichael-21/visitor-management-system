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
            <mat-icon style="color: #D4A017;">schedule</mat-icon>
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
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  form = {
    name: '',
    email: '',
    subject: 'general',
    message: '',
  };

  contactInfo = [
    { icon: 'location_on', title: 'Address', lines: ['123 Business Center Drive', 'New York, NY 10001'], color: '#0F6B3A' },
    { icon: 'phone', title: 'Phone', lines: ['+1 (555) 123-4567', '+1 (555) 987-6543'], color: '#D4A017' },
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
