'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Customer } from '@prisma/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api-client';

interface DeleteCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCustomerDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/customers/${customer.id}`);
      return response.data;
    },
    onSuccess: () => {
      onDeleted();
      onOpenChange(false);
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'エラーが発生しました');
    },
  });

  const handleConfirm = () => {
    setError(null);
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>顧客を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold">{customer.name}</span> を削除します。
            この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending ? '削除中...' : '削除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}