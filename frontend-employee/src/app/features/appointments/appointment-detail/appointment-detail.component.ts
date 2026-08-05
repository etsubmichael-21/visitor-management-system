import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Appointment, PropertyVerificationItem } from '../../../core/models/appointment.model';
import { Employee } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/common.model';

type VerificationStatus = 'Verified' | 'Missing' | 'Additional Property' | 'Rejected';

interface VerificationRow {
  key: number;
  id?: number;
  propertyType: string;
  propertyName: string;
  brand: string;
  model: string;
  serialNumber: string;
  quantity: number;
  status: VerificationStatus;
  error?: string;
}

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="appointment-detail">
      <div class="page-header">
        <h1>Appointment Details</h1>
        <a mat-stroked-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      @if (appointment()) {
        <div class="detail-grid">
          <mat-card class="main-card">
            <mat-card-content>
              <div class="apt-header">
                <div>
                  <h2>{{ appointment()!.purpose }}</h2>
                  <span class="ecx-status-badge" [ngClass]="appointment()!.status.toLowerCase()">{{ appointment()!.status }}</span>
                  @if (appointment()!.isConfidential) {
                    <mat-icon class="confidential">lock</mat-icon>
                    <span class="confidential-label">Confidential</span>
                  }
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="info-grid">
                <div class="info-item"><small>Visitor</small><p>{{ appointment()!.visitorName }}</p></div>
                <div class="info-item"><small>Visitor Email</small><p>{{ appointment()!.visitorEmail }}</p></div>
                <div class="info-item"><small>Visitor Phone</small><p>{{ appointment()!.visitorPhone }}</p></div>
                <div class="info-item"><small>Date</small><p>{{ appointment()!.requestedDate }}</p></div>
                <div class="info-item"><small>Time</small><p>{{ appointment()!.requestedStartTime }} - {{ appointment()!.requestedEndTime }}</p></div>
                <div class="info-item"><small>Host</small><p>{{ appointment()!.employeeName || 'N/A' }}</p></div>
                <div class="info-item"><small>Department</small><p>{{ appointment()!.departmentName || 'N/A' }}</p></div>
                <div class="info-item"><small>Purpose</small><p>{{ appointment()!.purpose }}</p></div>
                <div class="info-item"><small>Comments</small><p>{{ appointment()!.commentCount }}</p></div>
                @if (appointment()!.notes) {
                  <div class="info-item full"><small>Notes</small><p>{{ appointment()!.notes }}</p></div>
                }
                @if (appointment()!.rejectionReason) {
                  <div class="info-item full rejection"><small>Rejection Reason</small><p>{{ appointment()!.rejectionReason }}</p></div>
                }
                @if (appointment()!.delegatedToEmployeeName) {
                  <div class="info-item"><small>Delegated To</small><p>{{ appointment()!.delegatedToEmployeeName }}</p></div>
                }
                @if (appointment()!.assignedDepartmentName) {
                  <div class="info-item"><small>Assigned Department</small><p>{{ appointment()!.assignedDepartmentName }}</p></div>
                }
                @if (appointment()!.assignedEmployeeName) {
                  <div class="info-item"><small>Assigned Employee</small><p>{{ appointment()!.assignedEmployeeName }}</p></div>
                }
                @if (appointment()!.redirectedFromDepartmentName) {
                  <div class="info-item"><small>Redirected From</small><p>{{ appointment()!.redirectedFromDepartmentName }}</p></div>
                }
                @if (appointment()!.redirectReason) {
                  <div class="info-item full"><small>Redirect Reason</small><p>{{ appointment()!.redirectReason }}</p></div>
                }
              </div>

              <mat-divider></mat-divider>
              <div class="letter-section">
                <h3>Supporting Letter</h3>
                @if (appointment()!.supportingLetter) {
                  <div class="letter-row">
                    <mat-icon>description</mat-icon>
                    <span class="letter-name">{{ appointment()!.supportingLetter!.originalFileName }}</span>
                  </div>
                  <div class="letter-actions">
                    <button mat-stroked-button color="primary" (click)="viewSupportingLetter()">
                      <mat-icon>visibility</mat-icon> View
                    </button>
                    <button mat-stroked-button (click)="downloadSupportingLetter()">
                      <mat-icon>download</mat-icon> Download
                    </button>
                  </div>
                } @else {
                  <p class="no-letter">No supporting letter uploaded.</p>
                }
              </div>

              <mat-divider></mat-divider>
              <div class="property-section">
                <div class="property-section-head">
                  <h3>Visitor Properties</h3>
                  @if (appointment()!.properties?.length) {
                    <span class="property-status" [class.verified]="appointment()!.allPropertiesVerified" [class.unverified]="!appointment()!.allPropertiesVerified">
                      <mat-icon>{{ appointment()!.allPropertiesVerified ? 'verified' : 'warning' }}</mat-icon>
                      {{ appointment()!.allPropertiesVerified ? 'Property Verified' : 'Verification Required' }}
                    </span>
                  }
                </div>

                @if (canEditProperties()) {
                  <div class="verification-table-wrap">
                    <table class="verification-table">
                      <thead>
                        <tr>
                          <th>Property Type</th>
                          <th>Property Name</th>
                          <th>Brand</th>
                          <th>Model</th>
                          <th>Serial Number</th>
                          <th>Qty</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of verificationRows(); track row.key) {
                          <tr [class.invalid]="row.error">
                            <td>
                              <mat-form-field appearance="outline">
                                <mat-label>Type</mat-label>
                                <mat-select [(ngModel)]="row.propertyType" (ngModelChange)="onVerificationTypeChange(row)">
                                  @for (type of propertyTypes; track type) {
                                    <mat-option [value]="type">{{ type }}</mat-option>
                                  }
                                </mat-select>
                              </mat-form-field>
                            </td>
                            <td>
                              @if (row.propertyType === 'Other') {
                                <mat-form-field appearance="outline">
                                  <mat-label>Name *</mat-label>
                                  <input matInput [(ngModel)]="row.propertyName" placeholder="e.g. Custom device">
                                </mat-form-field>
                              }
                            </td>
                            <td>
                              <mat-form-field appearance="outline">
                                <mat-label>Brand</mat-label>
                                <input matInput [(ngModel)]="row.brand">
                              </mat-form-field>
                            </td>
                            <td>
                              <mat-form-field appearance="outline">
                                <mat-label>Model</mat-label>
                                <input matInput [(ngModel)]="row.model">
                              </mat-form-field>
                            </td>
                            <td>
                              <mat-form-field appearance="outline">
                                <mat-label>Serial</mat-label>
                                <input matInput [(ngModel)]="row.serialNumber">
                              </mat-form-field>
                            </td>
                            <td>
                              <mat-form-field appearance="outline" class="qty-field">
                                <mat-label>Qty</mat-label>
                                <input matInput type="number" min="1" [(ngModel)]="row.quantity">
                              </mat-form-field>
                            </td>
                            <td>
                              <mat-form-field appearance="outline" class="status-field">
                                <mat-label>Status</mat-label>
                                <mat-select [(ngModel)]="row.status">
                                  @for (s of verificationStatuses; track s) {
                                    <mat-option [value]="s">{{ s }}</mat-option>
                                  }
                                </mat-select>
                              </mat-form-field>
                            </td>
                            <td>
                              <button type="button" mat-icon-button matTooltip="Remove property" aria-label="Remove property" (click)="removeVerificationRow($index)">
                                <mat-icon>delete_outline</mat-icon>
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  @if (verificationError()) {
                    <p class="verification-error"><mat-icon>error</mat-icon> {{ verificationError() }}</p>
                  }

                  <div class="verification-actions">
                    <button type="button" mat-stroked-button color="primary" (click)="addVerificationRow()">
                      <mat-icon>add</mat-icon> Add Property
                    </button>
                    <button mat-raised-button color="primary" class="verify-props-btn" (click)="saveVerification()" [disabled]="verifyingProps()">
                      <mat-icon>verified_user</mat-icon> {{ verifyingProps() ? 'Saving...' : 'Verify Properties' }}
                    </button>
                  </div>
                } @else if (appointment()!.properties?.length) {
                  <div class="property-list">
                    @for (p of appointment()!.properties; track p.id) {
                      <div class="property-item" [class.unverified]="!p.isVerified">
                        <div class="property-item-name">
                          <mat-icon>{{ p.isVerified ? 'check_circle' : 'schedule' }}</mat-icon>
                          <strong>{{ p.propertyName || p.propertyType || 'Property item' }}</strong>
                          @if (p.quantity > 1) {
                            <span class="property-qty">×{{ p.quantity }}</span>
                          }
                          @if (p.verificationStatus) {
                            <span class="property-status-chip">{{ p.verificationStatus }}</span>
                          }
                        </div>
                        @if (p.brand) {
                          <div class="property-item-line"><span>Brand:</span> {{ p.brand }}</div>
                        }
                        @if (p.model) {
                          <div class="property-item-line"><span>Model:</span> {{ p.model }}</div>
                        }
                        @if (p.serialNumber) {
                          <div class="property-item-line"><span>Serial Number:</span> {{ p.serialNumber }}</div>
                        }
                        @if (p.description) {
                          <div class="property-item-line"><span>Description:</span> {{ p.description }}</div>
                        }
                        @if (p.isVerified && p.verifiedByUserName) {
                          <div class="property-item-line verified-by"><span>Verified by:</span> {{ p.verifiedByUserName }}</div>
                        }
                      </div>
                    }
                  </div>

                  @if (!appointment()!.allPropertiesVerified) {
                    <p class="property-warn"><mat-icon>warning</mat-icon> Security must verify these property items before check-in.</p>
                  }
                } @else {
                  <p class="no-letter">No visitor properties declared.</p>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <div class="action-panel">
            <mat-card>
              <mat-card-header><mat-card-title>Actions</mat-card-title></mat-card-header>
              <mat-card-content>
                @if (appointment()!.status === 'Pending' && canDecide()) {
                  <button mat-raised-button color="primary" class="action-btn" (click)="approveAppointment()">
                    <mat-icon>check_circle</mat-icon> Approve
                  </button>
                  <button mat-raised-button color="warn" class="action-btn" (click)="showRejectForm.set(true)">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                  <button mat-stroked-button color="primary" class="action-btn" (click)="showDelegateForm.set(true)">
                    <mat-icon>forward</mat-icon> Delegate
                  </button>
                }
                @if (appointment()!.status === 'Pending' && canRedirect()) {
                  <button mat-stroked-button color="accent" class="action-btn" (click)="showRedirectForm.set(true)">
                    <mat-icon>swap_horiz</mat-icon> Redirect to Department
                  </button>
                }
                @if (appointment()!.status === 'Pending' && canAssign()) {
                  <button mat-raised-button color="primary" class="action-btn" (click)="showAssignForm.set(true)">
                    <mat-icon>assignment_ind</mat-icon> {{ appointment()!.assignedEmployeeId ? 'Reassign Employee' : 'Assign Employee' }}
                  </button>
                }
                @if (appointment()!.status === 'Approved' && canDecide()) {
                  <button mat-raised-button color="primary" class="action-btn" (click)="completeAppointment()">
                    <mat-icon>done_all</mat-icon> Mark Complete
                  </button>
                }
                @if ((appointment()!.status === 'Pending' || appointment()!.status === 'Approved') && canDecide()) {
                  <button mat-stroked-button color="warn" class="action-btn" (click)="cancelAppointment()">
                    <mat-icon>cancel</mat-icon> Cancel
                  </button>
                }
              </mat-card-content>
            </mat-card>

            @if (showRejectForm()) {
              <mat-card>
                <mat-card-header><mat-card-title>Rejection Reason</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reason</mat-label>
                    <textarea matInput [(ngModel)]="rejectReason" rows="3"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="showRejectForm.set(false)">Cancel</button>
                    <button mat-raised-button color="warn" (click)="rejectAppointment()" [disabled]="!rejectReason">Reject</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            @if (showDelegateForm()) {
              <mat-card>
                <mat-card-header><mat-card-title>Delegate To</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Employee</mat-label>
                    <mat-select [(ngModel)]="delegateEmployeeId">
                      @for (emp of employees(); track emp.id) {
                        <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Notes</mat-label>
                    <textarea matInput [(ngModel)]="delegateNotes" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="showDelegateForm.set(false)">Cancel</button>
                    <button mat-raised-button color="primary" (click)="delegateAppointment()" [disabled]="!delegateEmployeeId">Delegate</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            @if (showRedirectForm()) {
              <mat-card>
                <mat-card-header><mat-card-title>Redirect to Department</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Department</mat-label>
                    <mat-select [(ngModel)]="redirectDepartmentId">
                      @for (dept of departments(); track dept.id) {
                        <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reason (Optional)</mat-label>
                    <textarea matInput [(ngModel)]="redirectReason" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="showRedirectForm.set(false)">Cancel</button>
                    <button mat-raised-button color="accent" (click)="redirectToDepartment()" [disabled]="!redirectDepartmentId">Redirect</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            @if (showAssignForm()) {
              <mat-card>
                <mat-card-header><mat-card-title>Assign Employee</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Employee</mat-label>
                    <mat-select [(ngModel)]="assignEmployeeId">
                      @for (emp of assignableEmployees(); track emp.id) {
                        <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Notes (Optional)</mat-label>
                    <textarea matInput [(ngModel)]="assignNotes" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="showAssignForm.set(false)">Cancel</button>
                    <button mat-raised-button color="primary" (click)="assignEmployee()" [disabled]="!assignEmployeeId">Assign</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-header><mat-card-title>Timeline</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot" style="background: #0F6B3A;"></div>
                    <div><small>Created</small><p>{{ appointment()!.createdAt }}</p></div>
                  </div>
                  @if (appointment()!.updatedAt) {
                    <div class="timeline-item">
                      <div class="timeline-dot" style="background: #0F6B3A;"></div>
                      <div><small>Last Updated</small><p>{{ appointment()!.updatedAt }}</p></div>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./appointment-detail.component.scss']
})
export class AppointmentDetailComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  appointment = signal<Appointment | null>(null);
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  showRejectForm = signal(false);
  showDelegateForm = signal(false);
  showRedirectForm = signal(false);
  showAssignForm = signal(false);
  verifyingProps = signal(false);
  verificationRows = signal<VerificationRow[]>([]);
  verificationError = signal('');
  propertyTypes = ['Laptop', 'Desktop Computer', 'Monitor', 'Printer', 'Camera', 'Mobile Phone', 'Tablet', 'External Hard Drive', 'USB Flash Drive', 'Network Device', 'Other'];
  verificationStatuses: VerificationStatus[] = ['Verified', 'Missing', 'Additional Property', 'Rejected'];
  private nextRowKey = 1;
  rejectReason = '';
  delegateEmployeeId: number | null = null;
  delegateNotes = '';
  redirectDepartmentId: number | null = null;
  redirectReason = '';
  assignEmployeeId: number | null = null;
  assignNotes = '';

  assignableEmployees = computed(() => {
    const apt = this.appointment();
    const role = this.authService.getUserRole();
    if (role !== 'DepartmentHead' || !apt) {
      return this.employees().filter(e => e.status === 'Active');
    }
    const departmentId = apt.assignedDepartmentId ?? apt.departmentId;
    return this.employees().filter(e => e.departmentId === departmentId && e.status === 'Active');
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadAppointment(Number(id));

    this.employeeService.getAll({ limit: 200 }).subscribe({
      next: (res) => { if (res.success && res.data) this.employees.set(res.data.items || []); }
    });

    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.departments.set(res.data || []); }
    });
  }

  loadAppointment(id: number): void {
    this.appointmentService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.appointment.set(res.data);
          this.buildVerificationRows();
        }
      }
    });
  }

  canEditProperties = computed(() => {
    const apt = this.appointment();
    if (!apt || !apt.properties?.length || apt.allPropertiesVerified) return false;
    const role = this.authService.getUserRole();
    return role === 'Security' || role === 'Admin';
  });

  canDecide(): boolean {
    const role = this.authService.getUserRole();
    if (role === 'Admin' || role === 'CEO') return true;
    if (role === 'DepartmentHead') return false;

    const user = this.authService.getCurrentUser();
    const apt = this.appointment();
    if (!user || !apt) return false;
    if (apt.assignedEmployeeId === user.employeeId) return true;
    if (apt.assignedEmployeeId == null && apt.employeeId === user.employeeId) return true;
    return apt.delegatedToEmployeeId === user.employeeId;
  }

  canAssign(): boolean {
    const role = this.authService.getUserRole();
    return role === 'Admin' || role === 'CEO' || role === 'DepartmentHead';
  }

  canRedirect(): boolean {
    const role = this.authService.getUserRole();
    return role === 'Admin' || role === 'CEO';
  }
  buildVerificationRows(): void {
    const apt = this.appointment();
    const rows: VerificationRow[] = (apt?.properties ?? []).map((p) => ({
      key: this.nextRowKey++,
      id: p.id,
      propertyType: p.propertyType || '',
      propertyName: p.propertyName || '',
      brand: p.brand || '',
      model: p.model || '',
      serialNumber: p.serialNumber || '',
      quantity: p.quantity > 0 ? p.quantity : 1,
      status: (p.verificationStatus as VerificationStatus) || 'Verified',
    }));
    this.verificationRows.set(rows);
    this.verificationError.set('');
  }

  addVerificationRow(): void {
    this.verificationRows.update((rows) => [
      ...rows,
      {
        key: this.nextRowKey++,
        propertyType: '',
        propertyName: '',
        brand: '',
        model: '',
        serialNumber: '',
        quantity: 1,
        status: 'Additional Property',
      },
    ]);
    this.verificationError.set('');
  }

  removeVerificationRow(index: number): void {
    this.verificationRows.update((rows) => rows.filter((_, i) => i !== index));
    this.verificationError.set('');
  }

  onVerificationTypeChange(row: VerificationRow): void {
    if (row.propertyType !== 'Other') {
      row.propertyName = '';
    }
    row.error = undefined;
  }

  saveVerification(): void {
    const apt = this.appointment();
    if (!apt) return;

    const rows = this.verificationRows();
    let firstError: string | null = null;
    const checked = rows.map((r) => {
      const row: VerificationRow = { ...r, error: undefined };
      if (!row.propertyType?.trim()) {
        row.error = 'Property Type is required for every property item.';
      } else if (row.propertyType === 'Other' && !row.propertyName?.trim()) {
        row.error = 'Property Name is required when Property Type is Other.';
      } else if (!row.quantity || row.quantity < 1) {
        row.error = 'Quantity must be greater than zero.';
      }
      if (row.error && !firstError) firstError = row.error;
      return row;
    });
    this.verificationRows.set(checked);
    this.verificationError.set(firstError ?? '');
    if (firstError) {
      this.snackBar.open(firstError, 'Close', { duration: 4000 });
      return;
    }

    this.verifyingProps.set(true);
    const items: PropertyVerificationItem[] = rows.map((r) => ({
      id: r.id,
      propertyType: r.propertyType.trim(),
      propertyName: r.propertyName.trim() || undefined,
      brand: r.brand.trim() || undefined,
      model: r.model.trim() || undefined,
      serialNumber: r.serialNumber.trim() || undefined,
      quantity: r.quantity,
      verificationStatus: r.status,
    }));
    this.appointmentService.savePropertyVerification(apt.id, items).subscribe({
      next: (res) => {
        this.verifyingProps.set(false);
        if (res.success) {
          this.snackBar.open('Property verification saved', 'Close', { duration: 3000 });
          this.loadAppointment(apt.id);
        }
      },
      error: (err) => {
        this.verifyingProps.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save property verification', 'Close', { duration: 3000 });
      }
    });
  }

  approveAppointment(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.appointmentService.approve({ appointmentId: apt.id }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment approved', 'Close', { duration: 3000 }); this.loadAppointment(apt.id); }
      },
      error: () => this.snackBar.open('Failed to approve', 'Close', { duration: 3000 })
    });
  }

  rejectAppointment(): void {
    const apt = this.appointment();
    if (!apt || !this.rejectReason) return;
    this.appointmentService.reject({ appointmentId: apt.id, reason: this.rejectReason }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment rejected', 'Close', { duration: 3000 }); this.showRejectForm.set(false); this.loadAppointment(apt.id); }
      }
    });
  }

  delegateAppointment(): void {
    const apt = this.appointment();
    if (!apt || !this.delegateEmployeeId) return;
    this.appointmentService.delegate({ appointmentId: apt.id, delegateToEmployeeId: this.delegateEmployeeId, notes: this.delegateNotes }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment delegated', 'Close', { duration: 3000 }); this.showDelegateForm.set(false); this.loadAppointment(apt.id); }
      }
    });
  }

  redirectToDepartment(): void {
    const apt = this.appointment();
    if (!apt || !this.redirectDepartmentId) return;
    this.appointmentService.redirectToDepartment({ appointmentId: apt.id, newDepartmentId: this.redirectDepartmentId, reason: this.redirectReason }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment redirected to department', 'Close', { duration: 3000 }); this.showRedirectForm.set(false); this.loadAppointment(apt.id); }
      },
      error: () => this.snackBar.open('Failed to redirect appointment', 'Close', { duration: 3000 })
    });
  }

  assignEmployee(): void {
    const apt = this.appointment();
    if (!apt || !this.assignEmployeeId) return;
    this.appointmentService.assignEmployee({ appointmentId: apt.id, newEmployeeId: this.assignEmployeeId, notes: this.assignNotes }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Employee assigned to appointment', 'Close', { duration: 3000 }); this.showAssignForm.set(false); this.loadAppointment(apt.id); }
      },
      error: () => this.snackBar.open('Failed to assign employee', 'Close', { duration: 3000 })
    });
  }

  completeAppointment(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.appointmentService.complete(apt.id).subscribe({
      next: (res) => { if (res.success) { this.snackBar.open('Marked as complete', 'Close', { duration: 3000 }); this.loadAppointment(apt.id); } }
    });
  }

  cancelAppointment(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.appointmentService.cancel(apt.id).subscribe({
      next: (res) => { if (res.success) { this.snackBar.open('Appointment cancelled', 'Close', { duration: 3000 }); this.loadAppointment(apt.id); } }
    });
  }

  goBack(): void { window.history.back(); }

  viewSupportingLetter(): void {
    const apt = this.appointment();
    if (!apt?.supportingLetter) return;
    this.appointmentService.getSupportingLetter(apt.id, false).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      error: () => this.snackBar.open('Failed to load supporting letter', 'Close', { duration: 3000 })
    });
  }

  downloadSupportingLetter(): void {
    const apt = this.appointment();
    if (!apt?.supportingLetter) return;
    const letter = apt.supportingLetter;
    this.appointmentService.getSupportingLetter(apt.id, true).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = letter.originalFileName || 'supporting-letter';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download supporting letter', 'Close', { duration: 3000 })
    });
  }
}
