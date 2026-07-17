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
  styles: [`
    .about-page { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

    .about-hero {
      text-align: center;
      padding: 60px 0 40px;
    }

    .about-hero h1 {
      font-size: 40px;
      font-weight: 800;
      color: #1b5e20;
    }

    .accent { color: #d4a017; }

    .about-hero p {
      color: #64748b;
      font-size: 18px;
      margin-top: 12px;
    }

    .about-content { padding: 0 0 40px; }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .about-card { padding: 12px; text-align: center; }
    .about-card h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin: 12px 0 8px; }
    .about-card p { color: #64748b; font-size: 14px; line-height: 1.7; }

    .card-icon { font-size: 40px; width: 40px; height: 40px; }
    .card-icon.green { color: #2e7d32; }
    .card-icon.gold { color: #d4a017; }
    .card-icon.blue { color: #1565c0; }

    .timeline-section {
      padding: 40px 0;
      text-align: center;
    }

    .timeline-section h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 32px;
    }

    .timeline {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
      padding-left: 32px;
      text-align: left;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #c8e6c9;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 32px;
    }

    .timeline-dot {
      position: absolute;
      left: -28px;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #2e7d32;
      border: 3px solid #c8e6c9;
    }

    .timeline-year {
      font-size: 12px;
      font-weight: 700;
      color: #d4a017;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .timeline-content h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 4px 0;
    }

    .timeline-content p {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
    }

    .team-section {
      padding: 40px 0 60px;
      text-align: center;
    }

    .team-section h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 32px;
    }

    .team-grid {
      display: flex;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
    }

    .team-member { text-align: center; }

    .member-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }

    .member-avatar mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #2e7d32;
    }

    .team-member h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .member-role {
      font-size: 13px;
      color: #d4a017;
      font-weight: 500;
    }
  `],
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
