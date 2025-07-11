'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, MoreHorizontal, Upload, Download, FileText, TestTube } from 'lucide-react';
import { Employee } from '@prisma/client';
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
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { createEmployeeTableColumns } from '@/components/employees/EmployeeTableColumns';
import { apiClient } from '@/lib/api-client';

export default function EmployeesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // APIからデータを取得
  const { data: employees = [], isLoading, error, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees');
      return response.data;
    },
  });

  // 検索・フィルタリング
  const filteredEmployees = employees.filter((employee: Employee) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower);
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // ページネーション計算
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // ページ変更時に選択をリセット
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedEmployeeIds(new Set());
  };

  // 表示件数変更時にページを1に戻す
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setSelectedEmployeeIds(new Set());
  };

  const handleEdit = (employee: Employee) => {
    router.push(`/employees/${employee.id}/edit`);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleNewEmployee = () => {
    router.push('/employees/new');
  };

  const handleSeedData = async () => {
    try {
      const response = await apiClient.post('/employees/seed');
      alert(`${response.data.count}件のダミーデータを作成しました`);
      refetch(); // データを再取得
    } catch (error) {
      alert('ダミーデータの作成に失敗しました');
      console.error('Seed data creation failed:', error);
    }
  };

  const handleClearData = async () => {
    if (confirm('全ての従業員データを削除しますか？この操作は元に戻せません。')) {
      try {
        const response = await apiClient.delete('/employees/clear');
        alert(`${response.data.count}件のデータを削除しました`);
        refetch(); // データを再取得
      } catch (error) {
        alert('データの削除に失敗しました');
        console.error('Clear data failed:', error);
      }
    }
  };

  // 新しい機能のプレースホルダー関数
  const handleImport = () => {
    alert('インポート機能は実装予定です');
  };

  const handleExport = () => {
    alert('エクスポート機能は実装予定です');
  };

  const handleDownloadSample = () => {
    alert('サンプルダウンロード機能は実装予定です');
  };

  // 一括削除のmutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.delete('/employees', {
        data: { ids }
      });
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      setSelectedEmployeeIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      alert('一括削除に失敗しました');
      console.error('Bulk delete failed:', error);
    },
  });

  const handleBulkDelete = () => {
    if (selectedEmployeeIds.size === 0) {
      alert('削除する従業員を選択してください');
      return;
    }
    
    const confirmMessage = `選択した${selectedEmployeeIds.size}人の従業員情報を完全に削除します。\nこの操作は元に戻すことができません。本当に削除しますか？`;
    if (confirm(confirmMessage)) {
      const ids = Array.from(selectedEmployeeIds);
      bulkDeleteMutation.mutate(ids);
    }
  };

  const handleRowClick = (employee: Employee) => {
    router.push(`/employees/${employee.id}`);
  };

  // 選択機能のハンドラー
  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployeeIds);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployeeIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentEmployees.map((emp: Employee) => emp.id));
      setSelectedEmployeeIds(allIds);
    } else {
      setSelectedEmployeeIds(new Set());
    }
  };

  const columns = createEmployeeTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRowClick: handleRowClick,
    selectedEmployeeIds,
    onSelectEmployee: handleSelectEmployee,
    onSelectAll: handleSelectAll,
    allEmployees: currentEmployees,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">従業員管理</h1>
            <p className="text-muted-foreground mt-1">
              従業員の情報を管理・編集できます
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* メインアクション：新規従業員追加 */}
            <Button 
              onClick={handleNewEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              新規従業員追加
            </Button>
            
            {/* その他のアクション */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/80 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  その他の操作
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-2 border-blue-200 shadow-xl">
                <DropdownMenuLabel className="text-gray-700 font-semibold">データ操作</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleImport} className="hover:bg-blue-50 cursor-pointer">
                  <Upload className="mr-2 h-4 w-4 text-blue-600" />
                  <span>従業員をインポート</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} className="hover:bg-blue-50 cursor-pointer">
                  <Download className="mr-2 h-4 w-4 text-blue-600" />
                  <span>従業員リストをエクスポート</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadSample} className="hover:bg-blue-50 cursor-pointer">
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  <span>インポート用サンプルをダウンロード</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-200" />
                
                <DropdownMenuLabel className="text-gray-700 font-semibold">開発用</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleSeedData} className="hover:bg-green-50 cursor-pointer">
                  <TestTube className="mr-2 h-4 w-4 text-green-600" />
                  <span>ダミーデータを100件作成</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleClearData} 
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>全データ削除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* メインカード */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl shadow-indigo-100/50 overflow-hidden">
          {/* フィルター */}
          <div className="p-6 border-b border-gray-100/80 bg-gradient-to-r from-white/50 to-gray-50/30">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">検索・フィルター</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="名前、メールで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 border-gray-200/60 focus:bg-white focus:border-blue-300 transition-all"
                  />
                </div>
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 shadow-md hover:border-blue-400 hover:shadow-lg transition-all duration-200 font-semibold text-blue-700">
                  <SelectValue placeholder="所属で絞り込み" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-200 shadow-xl">
                  <SelectItem value="all" className="hover:bg-blue-50 text-gray-700 font-medium">すべての所属</SelectItem>
                  <SelectItem value="営業部" className="hover:bg-blue-50 text-gray-700 font-medium">営業部</SelectItem>
                  <SelectItem value="開発部" className="hover:bg-blue-50 text-gray-700 font-medium">開発部</SelectItem>
                  <SelectItem value="管理部" className="hover:bg-blue-50 text-gray-700 font-medium">管理部</SelectItem>
                  <SelectItem value="企画部" className="hover:bg-blue-50 text-gray-700 font-medium">企画部</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 shadow-md hover:border-blue-400 hover:shadow-lg transition-all duration-200 font-semibold text-blue-700">
                  <SelectValue placeholder="ステータスで絞り込み" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-200 shadow-xl">
                  <SelectItem value="all" className="hover:bg-blue-50 text-gray-700 font-medium">すべてのステータス</SelectItem>
                  <SelectItem value="ACTIVE" className="hover:bg-blue-50 text-gray-700 font-medium">アクティブ</SelectItem>
                  <SelectItem value="INACTIVE" className="hover:bg-blue-50 text-gray-700 font-medium">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 選択状態とアクション */}
          {selectedEmployeeIds.size > 0 && (
            <div className="px-6 py-4 bg-blue-50/80 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedEmployeeIds.size}件選択中
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployeeIds(new Set())}
                    className="text-blue-600 border-blue-200 hover:bg-blue-100"
                  >
                    選択を解除
                  </Button>
                </div>
                <Button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {bulkDeleteMutation.isPending ? '削除中...' : '選択した項目を削除'}
                </Button>
              </div>
            </div>
          )}

          {/* データテーブル */}
          <div className="bg-white/60">
          <DataTable
            columns={columns}
            data={currentEmployees}
          />
          
          {/* 統合ページネーション */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-gray-100/60 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
            <div className="flex items-center gap-6 mb-4 sm:mb-0">
              <div className="text-sm font-medium text-gray-700 bg-white/70 px-3 py-1 rounded-md border border-gray-200/60">
                {totalItems === 0 ? '0件のデータ' : `${startIndex + 1}-${Math.min(endIndex, totalItems)}件 / 全${totalItems}件`}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">表示件数:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => handleItemsPerPageChange(Number(value))}
                >
                  <SelectTrigger className="w-20 h-9 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 shadow-md hover:border-blue-400 hover:shadow-lg transition-all duration-200 font-semibold text-blue-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-blue-200 shadow-xl">
                    <SelectItem value="10" className="hover:bg-blue-50 text-gray-700 font-medium">10件</SelectItem>
                    <SelectItem value="20" className="hover:bg-blue-50 text-gray-700 font-medium">20件</SelectItem>
                    <SelectItem value="50" className="hover:bg-blue-50 text-gray-700 font-medium">50件</SelectItem>
                    <SelectItem value="100" className="hover:bg-blue-50 text-gray-700 font-medium">100件</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 h-9 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
              >
                最初
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 h-9 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
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
                      className={`w-9 h-9 p-0 ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                          : 'hover:bg-blue-50 hover:border-blue-300'
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
                className="px-3 h-9 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
              >
                次へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 h-9 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
              >
                最後
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

      {/* 削除確認ダイアログ */}
      {selectedEmployee && (
        <DeleteEmployeeDialog
          employee={selectedEmployee}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={() => {
            refetch();
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Note: AlertDialog temporarily replaced with confirm() for compatibility */}
    </div>
  );
}