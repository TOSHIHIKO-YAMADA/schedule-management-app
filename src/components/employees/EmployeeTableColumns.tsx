'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';

interface EmployeeTableColumnsProps {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  selectedEmployeeIds: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allEmployees: Employee[];
}

export const createEmployeeTableColumns = ({
  onEdit,
  onDelete,
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
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: '従業員',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">{employee.nameKana}</div>
          <div className="font-medium">{employee.name}</div>
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
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'department',
    header: '所属',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{employee.department}</div>
          <div className="text-xs text-gray-500">{employee.position}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'ステータス',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isActive = status === 'ACTIVE';
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'アクティブ' : '非アクティブ'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '編集',
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <Button
          onClick={() => onEdit(employee)}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Edit className="h-3 w-3 mr-1" />
          編集
        </Button>
      );
    },
  },
];