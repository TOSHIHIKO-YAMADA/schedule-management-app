'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-gray-100 border border-gray-200 rounded"
            >
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>アクション</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(employee)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];