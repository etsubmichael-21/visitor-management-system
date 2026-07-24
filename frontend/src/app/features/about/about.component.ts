import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="about-page">
      <section class="about-hero">
        <h1>About <span class="accent">ECX</span></h1>
        <p>Transforming how organizations manage visitor access and facility security.</p>
      </section>

      <section class="about-content">
        <div class="content-grid">
          <mat-card class="about-card">
            <mat-card-content>
              <mat-icon class="card-icon green">visibility</mat-icon>
              <h3>Our Vision</h3>
              <p>To be the leading provider of intelligent visitor management solutions, creating safer and more efficient workplace environments across the globe.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="about-card">
            <mat-card-content>
              <mat-icon class="card-icon gold">flag</mat-icon>
              <h3>Our Mission</h3>
              <p>To empower organizations with cutting-edge technology that simplifies visitor management, enhances security protocols, and improves the overall visitor experience.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="about-card">
            <mat-card-content>
              <mat-icon class="card-icon blue">auto_awesome</mat-icon>
              <h3>Our Values</h3>
              <p>Innovation, integrity, and excellence drive everything we do. We are committed to delivering reliable solutions that our clients can trust.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <section class="timeline-section">
        <h2>Our Journey</h2>
        <div class="timeline">
          @for (item of timeline; track item.year) {
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-year">{{ item.year }}</span>
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
          }
        </div>
      </section>

      <section class="team-section">
        <h2>Leadership Team</h2>
        <div class="team-grid">
          @for (member of team; track member.name) {
            <div class="team-member">
              <div class="member-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <h4>{{ member.name }}</h4>
              <span class="member-role">{{ member.role }}</span>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  timeline = [
    { year: '2019', title: 'Founded', description: 'ECX Visitor Management was established to modernize facility access.' },
    { year: '2020', title: 'Digital Transformation', description: 'Launched fully digital visitor management platform during the pandemic.' },
    { year: '2022', title: 'Enterprise Scale', description: 'Expanded to serve 50+ enterprise clients across multiple industries.' },
    { year: '2024', title: 'AI Integration', description: 'Introduced AI-powered analytics for visitor flow optimization.' },
  ];

  team = [
    { name: 'Sarah Johnson', role: 'Chief Executive Officer' },
    { name: 'Michael Chen', role: 'Chief Technology Officer' },
    { name: 'Amara Okafor', role: 'Head of Operations' },
  ];
}
