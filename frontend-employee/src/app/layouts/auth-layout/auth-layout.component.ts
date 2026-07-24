import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  template: `
    <div class="auth-layout">
      <div class="auth-left">
        <div class="brand">
          <div class="logo-circle">
            <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="auth-logo-img">
          </div>
          <h1>ECX</h1>
          <p>Visitor Management System</p>
          <p class="subtitle">Employee Portal</p>
        </div>
      </div>
      <div class="auth-right">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {}
