export interface DashboardStats {
  totalVisitorsToday: number;
  totalVisitorsThisWeek: number;
  totalVisitorsThisMonth: number;
  activeAppointments: number;
  pendingAppointments: number;
  checkedInVisitors: number;
  totalEmployees: number;
  totalDepartments: number;
  unreadNotifications: number;
}

export interface VisitorChart {
  labels: string[];
  data: number[];
  type: 'daily' | 'weekly' | 'monthly';
}

export interface DepartmentChart {
  labels: string[];
  data: number[];
  type?: string;
}

export interface HourlyTraffic {
  hour: string;
  count: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface TodayAppointment {
  id: number;
  visitorName: string;
  hostName: string;
  time: string;
  status: string;
  department: string;
  purpose: string;
}

export interface ActiveVisitor {
  id: number;
  visitorName: string;
  hostName: string;
  checkInTime: string;
  badgeNumber?: string;
  department: string;
  floor?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  visitorChart?: VisitorChart;
  departmentChart?: DepartmentChart;
  hourlyTraffic?: HourlyTraffic[];
  recentActivities?: RecentActivity[];
  todayAppointments?: TodayAppointment[];
  activeVisitors?: ActiveVisitor[];
  pendingApprovals?: number;
  confidentialAppointments?: number;
}
