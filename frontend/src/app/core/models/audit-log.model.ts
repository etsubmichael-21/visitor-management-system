export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  entityName: string;
  entityId: number;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
