import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">System configuration</p>
      </div>
      <div class="card">
        <h3>General Settings</h3>
        <div class="setting-row">
          <div>
            <span class="setting-label">System Name</span>
            <span class="setting-desc">ECX Visitor Management System</span>
          </div>
          <span class="setting-value">v1.0.0</span>
        </div>
        <div class="setting-row">
          <div>
            <span class="setting-label">Default Page Size</span>
            <span class="setting-desc">Number of records per page in data tables</span>
          </div>
          <span class="setting-value">10</span>
        </div>
        <div class="setting-row">
          <div>
            <span class="setting-label">Session Timeout</span>
            <span class="setting-desc">Automatic logout after inactivity</span>
          </div>
          <span class="setting-value">30 minutes</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {}
