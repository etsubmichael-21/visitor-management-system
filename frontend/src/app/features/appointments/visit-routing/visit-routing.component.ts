import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VisitorRoutingService } from '../../../core/services/visitor-routing.service';
import { VisitorRoutingDecision } from '../../../core/models/visitor-routing.model';

@Component({
  selector: 'app-visit-routing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="visit-routing-page fade-in">
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
          <div class="step-header">
            <span class="step-badge">1</span>
            <div>
              <h2 class="step-title">Visit Routing</h2>
              <p class="step-subtitle">Answer a few quick questions so we can route your visit correctly.</p>
            </div>
          </div>

          <form [formGroup]="routingForm" (ngSubmit)="onContinue()">
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>lock</mat-icon>
                Confidentiality
              </h3>
              <p class="question">Is your visit confidential?</p>

              <mat-radio-group formControlName="confidential" class="radio-group">
                <mat-radio-button value="yes">Yes – Confidential</mat-radio-button>
                <mat-radio-button value="no">No – Non-Confidential</mat-radio-button>
              </mat-radio-group>

              @if (confidential === 'yes') {
                <div class="info-box">
                  <mat-icon>info</mat-icon>
                  <span>This visit contains confidential information. You may schedule your appointment directly with the employee.</span>
                </div>
              }
            </div>

            @if (confidential === 'no') {
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon>person_search</mat-icon>
                  Destination
                </h3>
                <p class="question">Do you already know the employee you want to visit?</p>

                <mat-radio-group formControlName="knowsEmployee" class="radio-group">
                  <mat-radio-button value="yes">Yes</mat-radio-button>
                  <mat-radio-button value="no">No</mat-radio-button>
                </mat-radio-group>

                @if (knowsEmployee === 'yes') {
                  <div class="info-box">
                    <mat-icon>info</mat-icon>
                    <span>You may schedule directly with the employee.</span>
                  </div>
                } @else if (knowsEmployee === 'no') {
                  <div class="info-box">
                    <mat-icon>info</mat-icon>
                    <span>Our receptionist will assist you in finding the correct destination.</span>
                  </div>
                }
              </div>
            }

            <div class="form-actions">
              <a mat-stroked-button routerLink="/appointments">Cancel</a>
              <button mat-flat-button color="primary" type="submit" [disabled]="routingForm.invalid || submitting">
                @if (submitting) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <span>Continue</span>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./visit-routing.component.scss'],
})
export class VisitRoutingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private routingService = inject(VisitorRoutingService);

  routingForm = this.fb.group({
    confidential: ['', Validators.required],
    knowsEmployee: [''],
  });

  confidential = '';
  knowsEmployee = '';
  submitting = false;

  ngOnInit(): void {
    const existing = this.routingService.getDecision();
    if (existing) {
      this.routingForm.patchValue({
        confidential: existing.isConfidential ? 'yes' : 'no',
        knowsEmployee: existing.knowsEmployee ? 'yes' : 'no',
      });
    }

    this.routingForm.get('confidential')?.valueChanges.subscribe(() => this.onConfidentialChange());
    this.routingForm.get('knowsEmployee')?.valueChanges.subscribe(() => this.onKnowsEmployeeChange());
    this.onConfidentialChange();
  }

  onConfidentialChange(): void {
    this.confidential = this.routingForm.get('confidential')?.value ?? '';
    const knowsControl = this.routingForm.get('knowsEmployee');
    if (this.confidential === 'yes') {
      knowsControl?.setValue('', { emitEvent: false });
      knowsControl?.clearValidators();
      this.knowsEmployee = '';
    } else if (this.confidential === 'no') {
      knowsControl?.setValidators(Validators.required);
    }
    knowsControl?.updateValueAndValidity({ emitEvent: false });
  }

  onKnowsEmployeeChange(): void {
    this.knowsEmployee = this.routingForm.get('knowsEmployee')?.value ?? '';
  }

  onContinue(): void {
    const confidential = this.routingForm.get('confidential')?.value;
    const knowsEmployee = this.routingForm.get('knowsEmployee')?.value;

    if (!confidential) return;

    const isConfidential = confidential === 'yes';
    const knows = knowsEmployee === 'yes';
    const decision: VisitorRoutingDecision = {
      isConfidential,
      knowsEmployee: knows,
      routeType: isConfidential || knows ? 'DirectEmployee' : 'Reception',
    };

    this.routingService.setDecision(decision);
    this.submitting = true;
    this.router.navigate(['/appointments/new/details']);
  }
}
