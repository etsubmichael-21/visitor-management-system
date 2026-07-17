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
  styles: [`
    .settings-page { max-width: 600px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
    .card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #1e293b; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
    .setting-row:last-child { border-bottom: none; }
    .setting-label { display: block; font-size: 0.875rem; font-weight: 500; color: #1e293b; }
    .setting-desc { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.125rem; }
    .setting-value { font-size: 0.875rem; color: #64748b; }
  `],
})
export class SettingsComponent {}
