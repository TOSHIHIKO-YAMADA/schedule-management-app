'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@/types/employee';
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

const roleLabels = {
  super: 'スーパー管理者',
  admin: '管理者',
  limited_admin: '制限付き管理者',
  general: '一般',
};

const roleColors = {
  super: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  limited_admin: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export const EmployeeTableColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'employeeNumber',
    header: '社員番号',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('employeeNumber')}</div>
    ),
  },
  {
    accessorKey: 'name',
    header: '氏名',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div>
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-muted-foreground">{employee.nameKana}</div>
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
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{employee.phone}</span>
          </div>
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
    accessorKey: 'role',
    header: '権限',
    cell: ({ row }) => {
      const role = row.getValue('role') as keyof typeof roleLabels;
      return (
        <Badge className={roleColors[role]}>
          {roleLabels[role]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'nearestStation',
    header: '最寄り駅',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="text-sm">
          <div>{employee.nearestStation}</div>
          <div className="text-muted-foreground">{employee.transportation}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'ステータス',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>アクション</DropdownMenuLabel>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];