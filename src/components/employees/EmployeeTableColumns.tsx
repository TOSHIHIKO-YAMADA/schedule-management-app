'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Mail, Phone, MoreHorizontal, ArrowUpDown, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 従業員の名前からイニシャルを生成するヘルパー関数
const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length === 0) return '?';
  const firstInitial = names[0][0] || '';
  const lastInitial = names.length > 1 ? names[names.length - 1][0] || '' : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

interface EmployeeTableColumnsProps {
  onDelete: (employee: Employee) => void;
  onRowClick: (employee: Employee) => void;
  selectedEmployeeIds: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allEmployees: Employee[];
}

export const createEmployeeTableColumns = ({
  onDelete,
  onRowClick,
  selectedEmployeeIds,
  onSelectEmployee,
  onSelectAll,
  allEmployees,
}: EmployeeTableColumnsProps): ColumnDef<Employee>[] => [
  {
    id: 'select',
    header: ({ table }) => {
      const isAllSelected = allEmployees.length > 0 && 
        allEmployees.every(emp => selectedEmployeeIds.has(emp.id));
      const isIndeterminate = !isAllSelected && 
        allEmployees.some(emp => selectedEmployeeIds.has(emp.id));

      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            suppressHydrationWarning
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const employee = row.original;
      const isSelected = selectedEmployeeIds.has(employee.id);

      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectEmployee(employee.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            suppressHydrationWarning
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-medium"
        >
          従業員
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div 
          className="flex items-center space-x-4 cursor-pointer py-2" 
          onClick={() => onRowClick(employee)}
        >
          <Avatar 
            size="md"
            src=""
            alt={employee.name}
            fallback={getInitials(employee.name)}
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{employee.name}</span>
            <span className="text-sm text-gray-500">{employee.nameKana}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: '連絡先',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div 
          className="space-y-2 cursor-pointer py-2" 
          onClick={() => onRowClick(employee)}
        >
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="truncate max-w-48">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-green-500" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'department',
    header: '所属部署',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div 
          className="cursor-pointer py-2" 
          onClick={() => onRowClick(employee)}
        >
          <div className="font-medium text-gray-900 text-sm">
            {row.getValue('department')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'ステータス',
    cell: ({ row }) => {
      const employee = row.original;
      const status = row.getValue('status') as string;
      const isActive = status === 'ACTIVE';
      return (
        <div 
          className="cursor-pointer py-2" 
          onClick={() => onRowClick(employee)}
        >
          <Badge variant={isActive ? 'success' : 'inactive'}>
            {isActive ? 'アクティブ' : '非アクティブ'}
          </Badge>
        </div>
      );
    },
  },
];