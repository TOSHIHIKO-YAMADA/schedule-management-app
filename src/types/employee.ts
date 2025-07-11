export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  lineId: string | null;
  notificationMethod: string;
  nearestStation: string;
  transportation: string;
  role: 'super' | 'admin' | 'limited_admin' | 'general';
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clerkId: string | null;
}

export interface CreateEmployeeInput {
  employeeNumber: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  lineId?: string;
  notificationMethod?: string;
  nearestStation: string;
  transportation?: string;
  role?: 'super' | 'admin' | 'limited_admin' | 'general';
  department: string;
  isActive?: boolean;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string;
}