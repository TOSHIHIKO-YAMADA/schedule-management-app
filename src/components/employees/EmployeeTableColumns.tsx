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
          <Badge variant={isActive ? 'default' : 'secondary'} className={`
            ${isActive 
              ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
            }
          `}>
            {isActive ? 'アクティブ' : '非アクティブ'}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRowClick(employee);
              }}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              詳細を表示
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                // 編集機能の実装
              }}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(employee);
              }}
              className="cursor-pointer text-red-600 focus:text-red-600"
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