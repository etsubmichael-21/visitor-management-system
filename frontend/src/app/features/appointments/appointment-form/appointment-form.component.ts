import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentRequest } from '../../../core/models/appointment.model';
import { Department } from '../../../core/models/department.model';
import { Employee } from '../../../core/models/employee.model';

interface PropertyRow {
  propertyName: string;
  propertyType: string;
  brand: string;
  model: string;
  serialNumber: string;
  quantity: number;
  description: string;
}

@Component({
  selector: 'app-appointment-success-toast',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  styles: [
    `
    :host { display: block; }
    .toast {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 6px 0;
      min-width: 320px;
      max-width: 480px;
    }
    .toast-icon {
      color: #ffffff;
      font-size: 30px;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
    }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
    }
    .toast-message {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.92);
      line-height: 1.45;
      margin-top: 3px;
    }
    .toast-close {
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.85);
    }
    .toast-close mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    ::ng-deep .vm-appointment-success .mdc-snackbar__surface {
      background: #0F6B3A;
      border-radius: 10px;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.28);
    }
    `,
  ],
  template: `
    <div class="toast">
      <mat-icon class="toast-icon" aria-hidden="true">check_circle</mat-icon>
      <div class="toast-body">
        <div class="toast-title">Appointment Submitted Successfully</div>
        <div class="toast-message">Your appointment has been submitted successfully and is awaiting approval. A notification will be sent once your appointment is reviewed.</div>
      </div>
      <button mat-icon-button class="toast-close" aria-label="Close notification" (click)="dismiss()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
})
export class AppointmentSubmissionSuccessToastComponent {
  private snackBarRef = inject(MatSnackBarRef<AppointmentSubmissionSuccessToastComponent>);

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}

const APPOINTMENT_SUBMISSION_SUCCESS_KEY = 'ecx_appointment_submission_success';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="appointment-form-page fade-in">
      <div class="page-header">
        <a mat-icon-button routerLink="/appointments" class="back-btn" matTooltip="Back to appointments" aria-label="Go back to appointments">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="page-title">Request Appointment</h1>
          <p class="page-subtitle">Schedule a visit to ECX facilities</p>
        </div>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
      @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>
        }

        @if (successMessage) {
          <div class="success-banner">
            <mat-icon>check_circle</mat-icon>
            {{ successMessage }}
          </div>
        }

          <form (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>info</mat-icon>
                Visit Details
              </h3>

              <p class="field-label">How would you like to arrange your appointment?</p>
              <mat-radio-group [(ngModel)]="appointmentMethod" name="appointmentMethod" class="radio-group" (ngModelChange)="onMethodChange()">
                <mat-radio-button value="ScheduleMyself">Schedule myself with a specific employee</mat-radio-button>
                <mat-radio-button value="ReceptionAssistance">Request assistance from the reception desk</mat-radio-button>
              </mat-radio-group>

              <mat-checkbox class="confidential-checkbox" color="primary" [(ngModel)]="form.isConfidential" name="isConfidential">
                This is a confidential visit
              </mat-checkbox>
              @if (form.isConfidential) {
                <div class="info-box">
                  <mat-icon>lock</mat-icon>
                  <span>Confidential visits are handled discreetly. The host employee approves the visit and Security is notified once it is approved.</span>
                </div>
              }
            </div>

            @if (isReceptionRoute) {
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon>front_desk</mat-icon>
                  Reception Assistance
                </h3>

                <mat-form-field appearance="outline">
                  <mat-label>Assigned To</mat-label>
                  <input matInput [value]="'Reception Desk'" readonly>
                  <mat-icon matPrefix>front_desk</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Preferred Department (Optional)</mat-label>
                  <mat-select [(ngModel)]="departmentId" name="departmentId" (selectionChange)="onPreferredDepartmentChange($event.value)">
                    <mat-option [value]="0">No preference</mat-option>
                    @for (dept of departments; track dept.id) {
                      <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                    }
                  </mat-select>
                  <mat-icon matPrefix>business</mat-icon>
                </mat-form-field>

                <p class="field-hint">Our receptionist will help you reach the right employee. Your preferred department will guide them.</p>
              </div>
            } @else {
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon>apartment</mat-icon>
                  Department & Host
                </h3>

                <mat-form-field appearance="outline">
                  <mat-label>Department</mat-label>
                  <mat-select [(ngModel)]="departmentId" name="departmentId" required (selectionChange)="onDepartmentChange($event.value)">
                    @for (dept of departments; track dept.id) {
                      <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                    }
                  </mat-select>
                  <mat-icon matPrefix>business</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Host Employee</mat-label>
                  <mat-select [(ngModel)]="form.employeeId" name="employeeId" required [disabled]="!departmentId">
                    @if (loadingEmployees) {
                      <mat-option disabled>Loading employees...</mat-option>
                    } @else if (!departmentId) {
                      <mat-option value="">Select department first</mat-option>
                    } @else if (employees.length === 0) {
                      <mat-option value="">No employees in this department</mat-option>
                    } @else {
                      @for (emp of employees; track emp.id) {
                        <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                      }
                    }
                  </mat-select>
                  <mat-icon matPrefix>person</mat-icon>
                </mat-form-field>
              </div>
            }

            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>event</mat-icon>
                Schedule Details
              </h3>

              <mat-form-field appearance="outline">
                <mat-label>Visit Date</mat-label>
                <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" name="scheduledDate" required [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <div class="time-row">
                <mat-form-field appearance="outline">
                  <mat-label>Start Time</mat-label>
                  <input matInput type="time" [(ngModel)]="form.requestedStartTime" name="requestedStartTime" required>
                  <mat-icon matPrefix>schedule</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>End Time (Optional)</mat-label>
                  <input matInput type="time" [(ngModel)]="form.requestedEndTime" name="requestedEndTime">
                  <mat-icon matPrefix>schedule</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>description</mat-icon>
                Purpose & Notes
              </h3>

              <mat-form-field appearance="outline">
                <mat-label>Purpose of Visit</mat-label>
                <input matInput [(ngModel)]="form.purpose" name="purpose" required placeholder="e.g. Business Meeting, Interview, Delivery">
                <mat-icon matPrefix>info</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Additional Notes</mat-label>
                <textarea matInput [(ngModel)]="form.notes" name="notes" rows="4" placeholder="Any specific requirements or information for your host..."></textarea>
                <mat-icon matPrefix>notes</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>attach_file</mat-icon>
                Supporting Letter (Optional)
              </h3>

              <p class="field-hint">You may upload an official request letter or supporting document if available. This is optional.</p>

              @if (!selectedFile) {
                <div class="file-dropzone" [class.drag-active]="dragActive" (click)="fileInput.click()" (dragover)="onDragOver($event)" (dragleave)="dragActive = false" (drop)="onFileDrop($event)">
                  <mat-icon>cloud_upload</mat-icon>
                  <p class="drop-title">Drag & drop your file here, or <span class="browse">browse</span></p>
                  <p class="drop-hint">PDF, DOC, DOCX, JPG, JPEG, PNG &mdash; max 10 MB</p>
                  <input #fileInput type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" (change)="onFileSelected($event)">
                </div>
              } @else {
                <div class="file-selected">
                  <mat-icon class="file-selected-icon">description</mat-icon>
                  <div class="file-info">
                    <span class="file-name">{{ selectedFile.name }}</span>
                    <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                  </div>
                  <button mat-icon-button class="file-remove" matTooltip="Remove file" aria-label="Remove file" (click)="removeFile()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }

              @if (fileError) {
                <div class="file-error">
                  <mat-icon>error</mat-icon>
                  <span>{{ fileError }}</span>
                </div>
              }

              @if (uploadProgress > 0 && uploadProgress < 100) {
                <div class="upload-progress">
                  <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
                  <span class="upload-progress-label">{{ uploadProgress }}% uploading...</span>
                </div>
              }
            </div>

            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>inventory_2</mat-icon>
                Visitor Properties (Optional)
              </h3>

              <p class="field-label">Will you bring any company property into the ECX facility?</p>
              <mat-radio-group [(ngModel)]="wantsProperties" name="wantsProperties" class="radio-group" (ngModelChange)="onPropertiesToggle()">
                <mat-radio-button [value]="false">No</mat-radio-button>
                <mat-radio-button [value]="true">Yes</mat-radio-button>
              </mat-radio-group>

              <div class="property-panel-wrap" [class.expanded]="wantsProperties">
                <div class="property-panel-inner">
                  @for (row of propertyRows; track $index) {
                    <div class="property-row">
                      <div class="property-row-head">
                        <span class="property-row-label">Property {{ $index + 1 }}</span>
                        <button type="button" mat-icon-button matTooltip="Remove property" aria-label="Remove property" (click)="removePropertyRow($index)">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                      <div class="property-grid">
                        @if (row.propertyType === 'Other') {
                          <mat-form-field appearance="outline">
                            <mat-label>Property Name *</mat-label>
                            <input matInput [(ngModel)]="row.propertyName" [ngModelOptions]="{standalone: true}" placeholder="e.g. Custom device name">
                          </mat-form-field>
                        }
                        <mat-form-field appearance="outline">
                          <mat-label>Property Type</mat-label>
                          <mat-select [(ngModel)]="row.propertyType" [ngModelOptions]="{standalone: true}" (ngModelChange)="onPropertyTypeChange(row)">
                            @for (type of propertyTypes; track type) {
                              <mat-option [value]="type">{{ type }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Brand (Optional)</mat-label>
                          <input matInput [(ngModel)]="row.brand" [ngModelOptions]="{standalone: true}">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Model (Optional)</mat-label>
                          <input matInput [(ngModel)]="row.model" [ngModelOptions]="{standalone: true}">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Serial Number *</mat-label>
                          <input matInput [(ngModel)]="row.serialNumber" [ngModelOptions]="{standalone: true}">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Quantity</mat-label>
                          <input matInput type="number" min="1" [(ngModel)]="row.quantity" [ngModelOptions]="{standalone: true}">
                        </mat-form-field>
                      </div>
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Description (Optional)</mat-label>
                        <textarea matInput [(ngModel)]="row.description" [ngModelOptions]="{standalone: true}" rows="2"></textarea>
                      </mat-form-field>
                    </div>
                  }

                  <button type="button" mat-stroked-button color="primary" class="add-property-btn" (click)="addPropertyRow()">
                    <mat-icon>add</mat-icon> Add Another Property
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <a mat-stroked-button routerLink="/appointments">Cancel</a>
              <button mat-flat-button color="primary" type="submit" [disabled]="submitting">
                @if (submitting) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <span>Submit Request</span>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  form: AppointmentRequest = {
    employeeId: 0,
    requestedDate: '',
    requestedStartTime: '',
    requestedEndTime: '',
    purpose: '',
    isConfidential: false,
    routeType: 'DirectEmployee',
    appointmentMethod: 'ScheduleMyself',
    notes: '',
  };

  departmentId = 0;
  isReceptionRoute = false;
  appointmentMethod: 'ScheduleMyself' | 'ReceptionAssistance' = 'ScheduleMyself';

  departments: Department[] = [];
  employees: Employee[] = [];
  loadingEmployees = false;
  selectedDate: Date | null = null;
  minDate = new Date();
  submitting = false;
  errorMessage = '';
  successMessage = '';

  selectedFile: File | null = null;
  fileError = '';
  dragActive = false;
  uploadProgress = 0;
  private readonly maxFileSize = 10 * 1024 * 1024;
  private readonly allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  private readonly allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  propertyTypes = ['Laptop', 'Desktop Computer', 'Monitor', 'Printer', 'Camera', 'Mobile Phone', 'Tablet', 'External Hard Drive', 'USB Flash Drive', 'Network Device', 'Other'];
  wantsProperties = false;
  propertyRows: PropertyRow[] = [];

  ngOnInit(): void {
    this.showPostSubmissionToastIfNeeded();
    this.departmentService.getDepartments().subscribe({
      next: (depts) => (this.departments = depts),
      error: () => {
        this.errorMessage = 'Failed to load departments. Make sure you are logged in.';
      },
    });
  }

  private showPostSubmissionToastIfNeeded(): void {
    try {
      if (!sessionStorage.getItem(APPOINTMENT_SUBMISSION_SUCCESS_KEY)) return;
      sessionStorage.removeItem(APPOINTMENT_SUBMISSION_SUCCESS_KEY);
      this.snackBar.openFromComponent(AppointmentSubmissionSuccessToastComponent, {
        duration: 4000,
        panelClass: ['vm-appointment-success'],
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    } catch {
      // Storage access failed; the toast is a nice-to-have and should never block the form.
    }
  }

  onMethodChange(): void {
    this.isReceptionRoute = this.appointmentMethod === 'ReceptionAssistance';
    this.form.routeType = this.isReceptionRoute ? 'Reception' : 'DirectEmployee';
    this.form.employeeId = 0;
    this.employees = [];
    if (!this.isReceptionRoute) this.departmentId = 0;
  }

  onPreferredDepartmentChange(deptId: number): void {
    this.departmentId = deptId;
  }

  onDepartmentChange(deptId: number): void {
    this.form.employeeId = 0;
    this.employees = [];
    if (!deptId) return;

    this.loadingEmployees = true;
    this.employeeService.getByDepartment(deptId).subscribe({
      next: (emps) => {
        this.employees = emps;
        this.loadingEmployees = false;
      },
      error: () => {
        this.employees = [];
        this.loadingEmployees = false;
      },
    });
  }

  onSubmit(): void {
    if (this.submitting) return;

    if (!this.selectedDate) {
      this.errorMessage = 'Please select a visit date.';
      return;
    }
    if (!this.form.requestedStartTime) {
      this.errorMessage = 'Please select a start time.';
      return;
    }
    if (!this.form.purpose?.trim()) {
      this.errorMessage = 'Please enter a purpose for your visit.';
      return;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${this.selectedDate.getFullYear()}-${pad(this.selectedDate.getMonth() + 1)}-${pad(this.selectedDate.getDate())}`;
    this.form.requestedDate = dateStr;

    const combineToISO = (time: string): string => {
      const [h, m] = time.split(':').map(Number);
      const dt = new Date(this.selectedDate!);
      dt.setHours(h, m, 0, 0);
      return dt.toISOString();
    };

    this.form.requestedStartTime = combineToISO(this.form.requestedStartTime);
    if (this.form.requestedEndTime) {
      this.form.requestedEndTime = combineToISO(this.form.requestedEndTime);
    }
    if (!this.isReceptionRoute && !this.form.employeeId) {
      this.errorMessage = 'Please select a host employee to continue.';
      return;
    }
    if (this.isReceptionRoute && this.departmentId) {
      const deptName = this.departments.find((d) => d.id === this.departmentId)?.name;
      if (deptName) {
        this.form.notes = [this.form.notes, `Preferred department: ${deptName}`].filter(Boolean).join('\n');
      }
    }
    const user = this.authService.currentUser;
    if (user?.visitorId) {
      this.form.visitorId = user.visitorId;
    }
    const properties = this.propertyRows
      .filter((r) => r.propertyType?.trim() || r.propertyName?.trim())
      .map((r) => ({
        propertyName: r.propertyType === 'Other' ? r.propertyName.trim() : '',
        propertyType: r.propertyType?.trim() || undefined,
        brand: r.brand?.trim() || undefined,
        model: r.model?.trim() || undefined,
        serialNumber: r.serialNumber?.trim() || undefined,
        quantity: r.quantity > 0 ? r.quantity : 1,
        description: r.description?.trim() || undefined,
      }));

    if (this.wantsProperties) {
      if (!properties.length) {
        this.errorMessage = 'Please register at least one property item.';
        return;
      }
      const missing = properties.find((p) => (!p.propertyName && p.propertyType === 'Other') || !p.serialNumber);
      if (missing) {
        this.errorMessage = 'Property Name is required for type "Other", and Serial Number is required for every property item.';
        return;
      }
    }

    this.form.hasProperties = this.wantsProperties;
    this.form.properties = this.wantsProperties ? properties : undefined;
    this.submitting = true;
    this.errorMessage = '';
    this.uploadProgress = 0;
    this.appointmentService.createAppointmentWithProgress(this.form, this.selectedFile ?? undefined).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          const res = event.body;
          if (res?.success) {
            this.uploadProgress = 100;
            this.submitting = true;
            this.successMessage = '';
            try {
              sessionStorage.setItem(APPOINTMENT_SUBMISSION_SUCCESS_KEY, '1');
            } catch {
              // Storage unavailable; the refresh still clears the form.
            }
            setTimeout(() => window.location.reload(), 1000);
          } else {
            this.submitting = false;
            this.uploadProgress = 0;
            this.errorMessage = res?.message || 'Failed to submit appointment. Please try again.';
          }
        }
      },
      error: (err) => {
        this.submitting = false;
        this.uploadProgress = 0;
        this.errorMessage = err.message || 'Failed to submit appointment. Please try again.';
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    this.selectFile(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
    const file = event.dataTransfer?.files?.[0] ?? null;
    this.selectFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  selectFile(file: File | null): void {
    this.fileError = '';
    this.uploadProgress = 0;
    if (!file) return;

    const extension = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    const typeAllowed = this.allowedTypes.includes(file.type) || file.type === '';
    if (!this.allowedExtensions.includes(extension) || !typeAllowed) {
      this.fileError = 'Unsupported file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.';
      return;
    }

    if (file.size > this.maxFileSize) {
      this.fileError = 'File is too large. Maximum allowed size is 10 MB.';
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = '';
    this.uploadProgress = 0;
  }

  formatFileSize(size: number): string {
    if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    if (size >= 1024) return (size / 1024).toFixed(1) + ' KB';
    return size + ' B';
  }

  onPropertiesToggle(): void {
    if (this.wantsProperties && !this.propertyRows.length) {
      this.addPropertyRow();
    }
  }

  addPropertyRow(): void {
    this.propertyRows.push({ propertyName: '', propertyType: '', brand: '', model: '', serialNumber: '', quantity: 1, description: '' });
  }

  onPropertyTypeChange(row: PropertyRow): void {
    if (row.propertyType !== 'Other') {
      row.propertyName = '';
    }
  }

  removePropertyRow(index: number): void {
    this.propertyRows.splice(index, 1);
  }
}
