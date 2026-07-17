export interface Department {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface DepartmentCreate {
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface DepartmentUpdate extends DepartmentCreate {}
