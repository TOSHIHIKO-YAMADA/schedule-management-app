'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Customer } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Mail, Phone, Globe, ArrowUpDown, Building2 } from 'lucide-react';

interface CustomerTableColumnsProps {
  onDelete: (customer: Customer) => void;
  onRowClick: (customer: Customer) => void;
  selectedCustomerIds: Set<string>;
  onSelectCustomer: (customerId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allCustomers: Customer[];
}

export const createCustomerTableColumns = ({
  onDelete,
  onRowClick,
  selectedCustomerIds,
  onSelectCustomer,
  onSelectAll,
  allCustomers,
}: CustomerTableColumnsProps): ColumnDef<Customer>[] => [
  {
    id: 'select',
    header: ({ table }) => {
      const isAllSelected = allCustomers.length > 0 && 
        allCustomers.every(cust => selectedCustomerIds.has(cust.id));
      const isIndeterminate = !isAllSelected && 
        allCustomers.some(cust => selectedCustomerIds.has(cust.id));

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
      const customer = row.original;
      const isSelected = selectedCustomerIds.has(customer.id);

      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectCustomer(customer.id, e.target.checked)}
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
          顧客名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div 
          className="flex items-center space-x-4 cursor-pointer py-2" 
          onClick={() => onRowClick(customer)}
        >
          <Avatar 
            size="md"
            src=""
            alt={customer.name}
            fallback={<Building2 className="h-5 w-5" />}
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{customer.name}</span>
            {customer.industry && (
              <span className="text-sm text-gray-500">{customer.industry}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'contactPerson',
    header: '担当者',
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div 
          className="cursor-pointer py-2" 
          onClick={() => onRowClick(customer)}
        >
          <div className="font-medium text-gray-900 text-sm">
            {row.getValue('contactPerson')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: '連絡先',
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div 
          className="space-y-2 cursor-pointer py-2" 
          onClick={() => onRowClick(customer)}
        >
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="truncate max-w-48">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-green-500" />
            <span>{customer.phone}</span>
          </div>
          {customer.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4 text-purple-500" />
              <span className="truncate max-w-48">{customer.website}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'address',
    header: '住所',
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div 
          className="cursor-pointer py-2" 
          onClick={() => onRowClick(customer)}
        >
          <div className="text-sm text-gray-900 max-w-xs truncate">
            {row.getValue('address')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'ステータス',
    cell: ({ row }) => {
      const customer = row.original;
      const isActive = row.getValue('isActive') as boolean;
      return (
        <div 
          className="cursor-pointer py-2" 
          onClick={() => onRowClick(customer)}
        >
          <Badge variant={isActive ? 'success' : 'inactive'}>
            {isActive ? 'アクティブ' : '非アクティブ'}
          </Badge>
        </div>
      );
    },
  },
];