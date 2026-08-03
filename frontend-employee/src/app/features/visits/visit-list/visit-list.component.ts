import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { VisitService } from '../../../core/services/visit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Visit } from '../../../core/models/visit.model';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule
  ],
  template: `
    <div class="visit-list">
      <div class="page-header">
        <h1>{{ pageTitle() }}</h1>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="loadVisits()" placeholder="Search visits...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="loadVisits()">
              <mat-option value="">All</mat-option>
              <mat-option value="Expected">Expected</mat-option>
              <mat-option value="CheckedIn">Checked In</mat-option>
              <mat-option value="CheckedOut">Checked Out</mat-option>
              <mat-option value="Cancelled">Cancelled</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card>
        <div class="table-container">
          <table mat-table [dataSource]="visits()">
            <ng-container matColumnDef="visitor">
              <th mat-header-cell *matHeaderCellDef>Visitor</th>
              <td mat-cell *matCellDef="let v">
                <strong>{{ v.visitorName || 'N/A' }}</strong>
              </td>
            </ng-container>
            <ng-container matColumnDef="host">
              <th mat-header-cell *matHeaderCellDef>Host</th>
              <td mat-cell *matCellDef="let v">{{ v.employeeName || 'N/A' }}</td>
            </ng-container>
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let v">{{ v.departmentName || 'N/A' }}</td>
            </ng-container>
            <ng-container matColumnDef="purpose">
              <th mat-header-cell *matHeaderCellDef>Purpose</th>
              <td mat-cell *matCellDef="let v">{{ v.purpose }}</td>
            </ng-container>
            <ng-container matColumnDef="checkIn">
              <th mat-header-cell *matHeaderCellDef>Check In</th>
              <td mat-cell *matCellDef="let v">{{ v.checkInTime || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="checkOut">
              <th mat-header-cell *matHeaderCellDef>Check Out</th>
              <td mat-cell *matCellDef="let v">{{ v.checkOutTime || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v">
                <span class="ecx-status-badge" [ngClass]="v.status.toLowerCase()">{{ v.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="badge">
              <th mat-header-cell *matHeaderCellDef>Badge</th>
              <td mat-cell *matCellDef="let v">{{ v.badgeNumber || '-' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
        <mat-paginator [length]="totalCount()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)" showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styleUrls: ['./visit-list.component.scss']
})
export class VisitListComponent implements OnInit {
  private visitService = inject(VisitService);
  private authService = inject(AuthService);

  displayedColumns = ['visitor', 'host', 'department', 'purpose', 'checkIn', 'checkOut', 'status', 'badge'];
  visits = signal<Visit[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  searchTerm = '';
  selectedStatus = '';

  pageTitle = signal('Visits');

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    if (role === 'Security') this.pageTitle.set('Active Visitors');
    else if (role === 'Receptionist') this.pageTitle.set('Today\'s Visits');
    this.loadVisits();
  }

  loadVisits(): void {
    const filter: any = { page: (this.currentPage() + 1).toString(), pageSize: this.pageSize().toString() };
    if (this.searchTerm) filter.search = this.searchTerm;
    if (this.selectedStatus) filter.status = this.selectedStatus;

    const role = this.authService.getUserRole();
    if (role === 'Security') filter.isActive = 'true';

    const endpoint = role === 'Receptionist' ? '/visits/reception-today' : '/visits';
    const request$ = role === 'Receptionist'
      ? this.visitService.getReceptionToday(filter)
      : this.visitService.getAll(filter);

    console.log(`[VisitList] SelectedStatus=${this.selectedStatus || '(all)'} Role=${role} | API=${endpoint}?${new URLSearchParams(filter).toString()} | Requesting...`);

    request$.subscribe({
      next: (res) => {
        if (res.success && res.data) {
          console.log(`[VisitList] SelectedStatus=${this.selectedStatus || '(all)'} | API=${endpoint} | ResponseCount=${res.data.items?.length ?? 0} TotalCount=${res.data.totalCount ?? 0}`);
          this.visits.set(res.data.items || []);
          this.totalCount.set(res.data.totalCount || 0);
        }
      }
    });
  }

  onPageChange(event: PageEvent): void { this.pageSize.set(event.pageSize); this.currentPage.set(event.pageIndex); this.loadVisits(); }
}
