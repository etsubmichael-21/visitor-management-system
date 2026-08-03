import { Injectable } from '@angular/core';
import { VisitorRoutingDecision } from '../models/visitor-routing.model';

const STORAGE_KEY = 'ecx_visitor_routing_decision';

@Injectable({ providedIn: 'root' })
export class VisitorRoutingService {
  getDecision(): VisitorRoutingDecision | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as VisitorRoutingDecision;
    } catch {
      return null;
    }
  }

  setDecision(decision: VisitorRoutingDecision): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decision));
  }

  clearDecision(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
