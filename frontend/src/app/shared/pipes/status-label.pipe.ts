import { Pipe, PipeTransform } from '@angular/core';
import { VisitStatus } from '../../core/models/visit.model';
import { AppointmentStatus } from '../../core/models/appointment.model';
import { EmployeeStatus } from '../../core/models/employee.model';
import { UserRole } from '../../core/models/user.model';

type StatusLike = VisitStatus | AppointmentStatus | EmployeeStatus | UserRole | string;

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: StatusLike): string {
    if (!value) return '';
    return value
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }
}
