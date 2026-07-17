import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats').pipe(map((res) => res.data));
  }
}
