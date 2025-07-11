import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Employee } from '@/types/employee';

interface UseEmployeesOptions {
  department?: string;
  role?: string;
  isActive?: boolean;
}

export function useEmployees(options?: UseEmployeesOptions) {
  return useQuery({
    queryKey: ['employees', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (options?.department) {
        params.append('department', options.department);
      }
      if (options?.role) {
        params.append('role', options.role);
      }
      if (options?.isActive !== undefined) {
        params.append('isActive', String(options.isActive));
      }

      const queryString = params.toString();
      const url = `/employees${queryString ? `?${queryString}` : ''}`;
      
      return api.get<Employee[]>(url);
    },
  });
}