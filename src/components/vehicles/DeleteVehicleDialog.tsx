'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Vehicle } from '@prisma/client';
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

interface DeleteVehicleDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteVehicleDialog({ 
  vehicle, 
  open, 
  onOpenChange, 
  onSuccess 
}: DeleteVehicleDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await apiClient.delete(`/vehicles/${vehicleId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onSuccess();
      onOpenChange(false);
      
      // 削除結果のメッセージを表示
      if (data.message) {
        alert(data.message);
      }
    },
    onError: (error: any) => {
      console.error('車両削除エラー:', error);
      const errorMessage = error.response?.data?.error || '車両の削除に失敗しました';
      alert(errorMessage);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(vehicle.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>車両を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                以下の車両情報を削除します。この操作は元に戻すことができません。
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium text-gray-700">車両名:</div>
                  <div>{vehicle.name}</div>
                  
                  <div className="font-medium text-gray-700">ナンバープレート:</div>
                  <div className="font-mono">{vehicle.licensePlate}</div>
                  
                  {vehicle.model && (
                    <>
                      <div className="font-medium text-gray-700">車種:</div>
                      <div>{vehicle.model}</div>
                    </>
                  )}
                  
                  {vehicle.manufacturer && (
                    <>
                      <div className="font-medium text-gray-700">メーカー:</div>
                      <div>{vehicle.manufacturer}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-amber-800 text-sm font-medium">
                  ⚠️ 注意: 使用履歴がある車両は論理削除（非アクティブ化）されます。
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={deleteMutation.isPending}
          >
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? '削除中...' : '削除する'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}