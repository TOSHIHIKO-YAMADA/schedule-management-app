'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, MoreHorizontal, AlertTriangle, Car, FileText, TestTube } from 'lucide-react';
import { Vehicle } from '@prisma/client';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createVehicleTableColumns } from '@/components/vehicles/VehicleTableColumns';
import { DeleteVehicleDialog } from '@/components/vehicles/DeleteVehicleDialog';
import { apiClient } from '@/lib/api-client';

interface VehicleWithAlerts extends Vehicle {
  inspectionAlert?: boolean;
  insuranceAlert?: boolean;
  _count: {
    usageHistory: number;
  };
}

export default function VehiclesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // APIからデータを取得
  const { data: vehicles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', searchTerm, statusFilter, fuelTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (fuelTypeFilter !== 'all') params.set('fuelType', fuelTypeFilter);
      
      const response = await apiClient.get(`/vehicles?${params.toString()}`);
      return response.data.data as VehicleWithAlerts[];
    },
  });

  // 検索・フィルタリング（追加フィルタリング）
  const filteredVehicles = vehicles.filter((vehicle: VehicleWithAlerts) => {
    return true; // API側でフィルタリング済み
  });

  // ページネーション計算
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // アラート集計
  const alertStats = {
    inspectionExpiring: vehicles.filter(v => v.inspectionAlert).length,
    insuranceExpiring: vehicles.filter(v => v.insuranceAlert).length,
    totalAlerts: vehicles.filter(v => v.inspectionAlert || v.insuranceAlert).length,
  };

  // ページ変更時に選択をリセット
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedVehicleIds(new Set());
  };

  // 表示件数変更時にページを1に戻す
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setSelectedVehicleIds(new Set());
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleNewVehicle = () => {
    router.push('/vehicles/new');
  };

  const handleRowClick = (vehicle: Vehicle) => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  // 選択機能のハンドラー
  const handleSelectVehicle = (vehicleId: string, checked: boolean) => {
    const newSelected = new Set(selectedVehicleIds);
    if (checked) {
      newSelected.add(vehicleId);
    } else {
      newSelected.delete(vehicleId);
    }
    setSelectedVehicleIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentVehicles.map((vehicle: Vehicle) => vehicle.id));
      setSelectedVehicleIds(allIds);
    } else {
      setSelectedVehicleIds(new Set());
    }
  };

  // 一括削除のmutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.delete('/vehicles', {
        data: { ids }
      });
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      setSelectedVehicleIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      alert('一括削除に失敗しました');
      console.error('Bulk delete failed:', error);
    },
  });

  const handleBulkDelete = () => {
    if (selectedVehicleIds.size === 0) {
      alert('削除する車両を選択してください');
      return;
    }
    
    const confirmMessage = `選択した${selectedVehicleIds.size}台の車両情報を完全に削除します。\\nこの操作は元に戻すことができません。本当に削除しますか？`;
    if (confirm(confirmMessage)) {
      const ids = Array.from(selectedVehicleIds);
      bulkDeleteMutation.mutate(ids);
    }
  };

  const columns = createVehicleTableColumns({
    selectedVehicleIds,
    onSelectVehicle: handleSelectVehicle,
    onSelectAll: handleSelectAll,
    allVehicles: currentVehicles,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ApiErrorAlert error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-indigo-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ヘッダーセクション */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5 rounded-2xl blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-white via-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">車両管理</h1>
                    <p className="text-gray-600 text-lg">
                      車両情報の一元管理・運用
                    </p>
                  </div>
                </div>
                
                {/* アラート表示 */}
                {alertStats.totalAlerts > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div className="flex gap-3 text-sm">
                      {alertStats.inspectionExpiring > 0 && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                          車検期限: {alertStats.inspectionExpiring}台
                        </Badge>
                      )}
                      {alertStats.insuranceExpiring > 0 && (
                        <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">
                          保険期限: {alertStats.insuranceExpiring}台
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleNewVehicle}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新規登録
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/80 px-4 py-3 rounded-xl shadow-sm"
                    >
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      その他
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>レポート</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      車検満了日一覧
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      使用状況レポート
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター・検索セクション */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="車両名、ナンバープレート、車種、メーカーで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg text-base shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger className="w-44 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="燃料タイプ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="gasoline">ガソリン</SelectItem>
                  <SelectItem value="diesel">ディーゼル</SelectItem>
                  <SelectItem value="electric">電気</SelectItem>
                  <SelectItem value="hybrid">ハイブリッド</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* メインコンテンツ（データテーブル） */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

          {/* 選択状態とアクション */}
          {selectedVehicleIds.size > 0 && (
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-green-700">
                    {selectedVehicleIds.size}台を選択中
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVehicleIds(new Set())}
                    className="h-8 text-xs"
                  >
                    選択を解除
                  </Button>
                </div>
                <Button
                  onClick={handleBulkDelete}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white h-8"
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {bulkDeleteMutation.isPending ? '削除中...' : '選択項目を削除'}
                </Button>
              </div>
            </div>
          )}

          {/* データテーブル */}
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={currentVehicles}
              onRowClick={handleRowClick}
            />
          </div>
          
          {/* フッターセクション（ページネーション） */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center gap-6 mb-4 sm:mb-0">
              <div className="text-sm text-gray-600">
                {totalItems === 0 ? '0件のデータ' : `${startIndex + 1}-${Math.min(endIndex, totalItems)}件 / 全${totalItems}件`}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">表示件数:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => handleItemsPerPageChange(Number(value))}
                >
                  <SelectTrigger className="w-20 h-8 border-gray-300">
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
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                最初
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                前へ
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === pageNum 
                          ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 px-3"
              >
                次へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 px-3"
              >
                最後
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {selectedVehicle && (
        <DeleteVehicleDialog
          vehicle={selectedVehicle}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={() => {
            refetch();
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}