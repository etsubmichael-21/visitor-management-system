import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH = new HttpContextToken(() => false);

export const ROLES = {
  ADMIN: 'Admin' as const,
  RECEPTIONIST: 'Receptionist' as const,
  SECURITY: 'Security' as const,
  VISITOR: 'Visitor' as const,
};

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;
