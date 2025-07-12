'use client';

import { ReactNode } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

interface DataTableContainerProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  selectedItems: Set<string>;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  entityName: string; // "従業員" or "顧客"
  bulkDeleteLoading?: boolean;
}

export function DataTableContainer<TData>({
  columns,
  data,
  isLoading = false,
  selectedItems,
  onClearSelection,
  onBulkDelete,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  entityName,
  bulkDeleteLoading = false,
}: DataTableContainerProps<TData>) {
  const { currentPage, totalPages, totalItems, itemsPerPage, startIndex, endIndex } = pagination;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* 選択状態とアクション */}
      {selectedItems.size > 0 && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedItems.size}{entityName === '従業員' ? '人' : '件'}を選択中
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-blue-600 hover:text-blue-800"
              >
                選択解除
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {bulkDeleteLoading 
                ? '削除中...' 
                : `選択した${entityName}を削除`
              }
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
      />

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {totalItems}件中 {startIndex + 1}-{Math.min(endIndex, totalItems)}件を表示
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10件</SelectItem>
                  <SelectItem value="20">20件</SelectItem>
                  <SelectItem value="50">50件</SelectItem>
                  <SelectItem value="100">100件</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                前へ
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = currentPage - 2 + i;
                if (pageNumber < 1 || pageNumber > totalPages) return null;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              }).filter(Boolean)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                次へ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}