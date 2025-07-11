'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';

interface EmployeeTableColumnsProps {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const createEmployeeTableColumns = ({
  onEdit,
  onDelete,
}: EmployeeTableColumnsProps): ColumnDef<Employee>[] => [
  {
    accessorKey: 'name',
    header: '従業員名',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: '連絡先',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'department',
    header: '部署',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('department')}</Badge>
    ),
  },
  {
    accessorKey: 'position',
    header: '役職',
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue('position')}</div>
    ),
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
    header: '操作',
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => onEdit(employee)}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Edit className="h-3 w-3 mr-1" />
            編集
          </Button>
          <Button
            onClick={() => onDelete(employee)}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            削除
          </Button>
        </div>
      );
    },
  },
];