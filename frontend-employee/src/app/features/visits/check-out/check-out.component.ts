import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VisitService } from '../../../core/services/visit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Visit, VisitStatus } from '../../../core/models/visit.model';

interface ReturnedItemRow {
  key: number;
  itemName: string;
  description: string;
  quantity: number;
  remarks: string;
  error?: string;
}

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule,
    MatTableModule, MatTooltipModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="check-out">
      <div class="page-header">
        <h1>Visitor Check-Out</h1>
      </div>

      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>how_to_reg</mat-icon> Active Visitors
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width search-field">
            <mat-label>Search by Badge Number or Name</mat-label>
            <input matInput [(ngModel)]="searchTerm" placeholder="Filter active visitors...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          @if (activeLoading()) {
            <div class="loading-row"><mat-spinner diameter="24"></mat-spinner></div>
          } @else if (filteredActive().length) {
            <div class="table-container">
              <table mat-table [dataSource]="filteredActive()">
                <ng-container matColumnDef="visitor">
                  <th mat-header-cell *matHeaderCellDef>Visitor Name</th>
                  <td mat-cell *matCellDef="let v"><strong>{{ v.visitorName || 'N/A' }}</strong></td>
                </ng-container>
                <ng-container matColumnDef="badge">
                  <th mat-header-cell *matHeaderCellDef>Badge Number</th>
                  <td mat-cell *matCellDef="let v">{{ v.badgeNumber || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="host">
                  <th mat-header-cell *matHeaderCellDef>Host</th>
                  <td mat-cell *matCellDef="let v">{{ v.employeeName || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let v">{{ v.departmentName || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="checkIn">
                  <th mat-header-cell *matHeaderCellDef>Check-In Time</th>
                  <td mat-cell *matCellDef="let v">{{ v.checkInTime || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let v">
                    <span class="ecx-status-badge checkedin">Checked In</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let v">
                    <button mat-raised-button color="warn" class="row-action" (click)="selectVisitor(v)">
                      <mat-icon>logout</mat-icon> Check Out
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="activeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: activeColumns;"></tr>
              </table>
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon>check_circle</mat-icon>
              <p>No active visitors in the building</p>
            </div>
          }
        </mat-card-content>
      </mat-card>

      @if (selectedVisitor()) {
        <mat-card class="checkout-form-card">
          <mat-card-header>
            <mat-card-title>Check-Out: {{ selectedVisitor()!.visitorName }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="visitor-summary">
              <p><strong>Badge #:</strong> {{ selectedVisitor()!.badgeNumber || 'N/A' }}</p>
              <p><strong>Host:</strong> {{ selectedVisitor()!.employeeName }}</p>
              <p><strong>Department:</strong> {{ selectedVisitor()!.departmentName }}</p>
              <p><strong>Checked In:</strong> {{ selectedVisitor()!.checkInTime }}</p>
              <p><strong>Items Carried In:</strong> {{ itemsSummary(selectedVisitor()!) }}</p>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Security Officer</mat-label>
              <input matInput [(ngModel)]="securityOfficer" placeholder="Officer name">
            </mat-form-field>

            <div class="returned-items-section">
              <div class="returned-items-head">
                <h3>Returned Items</h3>
                @if (visitorHasItems(selectedVisitor()!)) {
                  <span class="property-status unverified">
                    <mat-icon>info</mat-icon> Visitor brought in items &mdash; confirm returned items
                  </span>
                }
              </div>

              @if (returnedItems().length) {
                <div class="verification-table-wrap">
                  <table class="verification-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Remarks</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of returnedItems(); track row.key) {
                        <tr [class.invalid]="row.error">
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Item Name *</mat-label>
                              <input matInput [(ngModel)]="row.itemName" placeholder="e.g. Laptop">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Description</mat-label>
                              <input matInput [(ngModel)]="row.description">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline" class="qty-field">
                              <mat-label>Qty</mat-label>
                              <input matInput type="number" min="1" [(ngModel)]="row.quantity">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Remarks</mat-label>
                              <input matInput [(ngModel)]="row.remarks">
                            </mat-form-field>
                          </td>
                          <td>
                            <button type="button" mat-icon-button matTooltip="Remove item" aria-label="Remove item" (click)="removeReturnedItem($index)">
                              <mat-icon>delete_outline</mat-icon>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                @if (returnedItemsError()) {
                  <p class="verification-error"><mat-icon>error</mat-icon> {{ returnedItemsError() }}</p>
                }
              }

              <div class="verification-actions">
                <button type="button" mat-stroked-button color="primary" (click)="addReturnedItem()">
                  <mat-icon>add</mat-icon> Add Item
                </button>
              </div>
            </div>

            <div class="checkbox-row">
              <mat-checkbox [(ngModel)]="badgeReturned" color="primary">Badge Returned</mat-checkbox>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput [(ngModel)]="notes" rows="2"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button (click)="cancelSelection()">Cancel</button>
              <button mat-raised-button color="warn" (click)="checkOut()" [disabled]="isLoading() || !badgeReturned">
                @if (isLoading()) { <mat-spinner diameter="20"></mat-spinner> }
                <mat-icon>logout</mat-icon> Complete Check-Out
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon> Checked-Out Visitors
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (checkedOutLoading()) {
            <div class="loading-row"><mat-spinner diameter="24"></mat-spinner></div>
          } @else if (checkedOutVisitors().length) {
            <div class="table-container">
              <table mat-table [dataSource]="checkedOutVisitors()">
                <ng-container matColumnDef="visitor">
                  <th mat-header-cell *matHeaderCellDef>Visitor Name</th>
                  <td mat-cell *matCellDef="let v"><strong>{{ v.visitorName || 'N/A' }}</strong></td>
                </ng-container>
                <ng-container matColumnDef="badge">
                  <th mat-header-cell *matHeaderCellDef>Badge Number</th>
                  <td mat-cell *matCellDef="let v">{{ v.badgeNumber || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="host">
                  <th mat-header-cell *matHeaderCellDef>Host</th>
                  <td mat-cell *matCellDef="let v">{{ v.employeeName || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let v">{{ v.departmentName || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="checkIn">
                  <th mat-header-cell *matHeaderCellDef>Check-In Time</th>
                  <td mat-cell *matCellDef="let v">{{ v.checkInTime || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="checkOut">
                  <th mat-header-cell *matHeaderCellDef>Check-Out Time</th>
                  <td mat-cell *matCellDef="let v">{{ v.checkOutTime || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="duration">
                  <th mat-header-cell *matHeaderCellDef>Duration</th>
                  <td mat-cell *matCellDef="let v">{{ formatDuration(v.checkInTime, v.checkOutTime) }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let v">
                    <span class="ecx-status-badge checkedout">Checked Out</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="checkedOutColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: checkedOutColumns;"></tr>
              </table>
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon>history</mat-icon>
              <p>No visitors have checked out yet</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit {
  private visitService = inject(VisitService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  activeColumns = ['visitor', 'badge', 'host', 'department', 'checkIn', 'status', 'actions'];
  checkedOutColumns = ['visitor', 'badge', 'host', 'department', 'checkIn', 'checkOut', 'duration', 'status'];

  activeVisitors = signal<Visit[]>([]);
  checkedOutVisitors = signal<Visit[]>([]);
  selectedVisitor = signal<Visit | null>(null);
  activeLoading = signal(false);
  checkedOutLoading = signal(false);
  isLoading = signal(false);
  searchTerm = '';
  securityOfficer = 'Security Officer';
  returnedItems = signal<ReturnedItemRow[]>([]);
  returnedItemsError = signal('');
  badgeReturned = false;
  notes = '';
  private nextItemKey = 1;

  filteredActive = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.activeVisitors();
    return this.activeVisitors().filter(v =>
      v.visitorName?.toLowerCase().includes(term) ||
      v.badgeNumber?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.fullName) this.securityOfficer = user.fullName;
    this.loadActiveVisitors();
    this.loadCheckedOutVisitors();

    const visitId = this.route.snapshot.queryParamMap.get('visitId');
    if (visitId) {
      this.visitService.getById(Number(visitId)).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const v = res.data;
            this.activeVisitors.update(list => list.some(x => x.id === v.id) ? list : [v, ...list]);
            this.selectedVisitor.set(v);
          }
        }
      });
    }
  }

  loadActiveVisitors(): void {
    this.activeLoading.set(true);
    this.visitService.getActiveVisits().subscribe({
      next: (res) => {
        this.activeLoading.set(false);
        if (res.success && res.data) this.activeVisitors.set(res.data);
      },
      error: () => this.activeLoading.set(false)
    });
  }

  loadCheckedOutVisitors(): void {
    this.checkedOutLoading.set(true);
    this.visitService.getAll({ page: 1, pageSize: 100, status: 'CheckedOut' }).subscribe({
      next: (res) => {
        this.checkedOutLoading.set(false);
        if (res.success && res.data) this.checkedOutVisitors.set(res.data.items || []);
      },
      error: () => this.checkedOutLoading.set(false)
    });
  }

  selectVisitor(visitor: Visit): void { this.selectedVisitor.set(visitor); }

  cancelSelection(): void { this.selectedVisitor.set(null); }

  visitorHasItems(v: Visit): boolean {
    const items = v.visitorItems as any;
    if (Array.isArray(items)) return items.length > 0;
    return !!(items && String(items).trim() && String(items).trim().toLowerCase() !== 'none');
  }

  addReturnedItem(): void {
    this.returnedItems.update((rows) => [
      ...rows,
      { key: this.nextItemKey++, itemName: '', description: '', quantity: 1, remarks: '' },
    ]);
    this.returnedItemsError.set('');
  }

  removeReturnedItem(index: number): void {
    this.returnedItems.update((rows) => rows.filter((_, i) => i !== index));
    this.returnedItemsError.set('');
  }

  private rowHasData(row: ReturnedItemRow): boolean {
    return !!(row.itemName?.trim() || row.description?.trim() || row.remarks?.trim());
  }

  private buildRemark(): string {
    const parts: string[] = [];
    const items = this.returnedItems().filter((r) => this.rowHasData(r));
    if (items.length) {
      const lines = items.map((i) => {
        let line = i.itemName.trim();
        if (i.quantity > 0) line += ` (Qty: ${i.quantity})`;
        if (i.description?.trim()) line += ` - ${i.description.trim()}`;
        if (i.remarks?.trim()) line += ` [${i.remarks.trim()}]`;
        return line;
      });
      parts.push(`Returned Items: ${lines.join('; ')}`);
    }
    if (this.notes?.trim()) parts.push(this.notes.trim());
    return parts.join(' | ');
  }

  itemsSummary(v: Visit): string {
    const items = v.visitorItems as any;
    if (!items) return 'None';
    if (Array.isArray(items)) {
      if (!items.length) return 'None';
      return items.map((i: any) => i.itemName ?? i.name ?? '').filter(Boolean).join(', ');
    }
    return String(items);
  }

  formatDuration(checkIn?: string, checkOut?: string): string {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '-';
    const totalMins = Math.round((end - start) / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }

  checkOut(): void {
    const visitor = this.selectedVisitor();
    if (!visitor) return;

    const checked = this.returnedItems().map((r) => ({ ...r, error: undefined as string | undefined }));
    let firstError: string | null = null;
    for (const row of checked) {
      if (!this.rowHasData(row)) continue;
      if (!row.itemName?.trim()) {
        row.error = 'Item Name is required for every returned item.';
      } else if (row.quantity < 1) {
        row.error = 'Quantity must be greater than zero.';
      }
      if (row.error && !firstError) firstError = row.error;
    }
    this.returnedItems.set(checked);

    if (!firstError && this.visitorHasItems(visitor) && checked.filter((r) => this.rowHasData(r)).length === 0) {
      firstError = 'Visitor brought items into the building. Enter at least one returned item.';
      this.returnedItemsError.set(firstError);
      this.snackBar.open(firstError, 'Close', { duration: 4000 });
      return;
    }
    if (firstError) {
      this.returnedItemsError.set(firstError);
      this.snackBar.open(firstError, 'Close', { duration: 4000 });
      return;
    }

    this.isLoading.set(true);
    this.visitService.checkOut(visitor.id, {
      securityOfficer: this.securityOfficer || 'Security Officer',
      remark: this.buildRemark()
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.snackBar.open('Visitor checked out successfully', 'Close', { duration: 3000 });
          this.activeVisitors.update(list => list.filter(v => v.id !== visitor.id));
          const checkedOut: Visit = res.data
            ? { ...res.data }
            : { ...visitor, status: 'CheckedOut' as VisitStatus, checkOutTime: new Date().toISOString() };
          this.checkedOutVisitors.update(list => [checkedOut, ...list]);
          this.selectedVisitor.set(null);
          this.returnedItems.set([]);
          this.returnedItemsError.set('');
          this.badgeReturned = false;
          this.notes = '';
        }
      },
      error: (err) => { this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Check-out failed', 'Close', { duration: 3000 }); }
    });
  }
}
