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
import { ImportDialog } from '@/components/employees/ImportDialog';
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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

  // インポート・エクスポート機能
  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      window.open('/api/employees/export', '_blank');
    } catch (error) {
      alert('エクスポートに失敗しました');
      console.error('Export failed:', error);
    }
  };

  const handleDownloadSample = () => {
    window.open('/api/employees/sample', '_blank');
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ヘッダーセクション */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">従業員管理</h1>
              <p className="text-gray-600 text-lg">
                チーム全体の情報を効率的に管理・運用
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleNewEmployee}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                新規登録
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-4 py-3 rounded-lg shadow-sm"
                  >
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    その他
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>データ操作</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    インポート
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    エクスポート
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadSample}>
                    <FileText className="mr-2 h-4 w-4" />
                    サンプル
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>開発用</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleSeedData}>
                    <TestTube className="mr-2 h-4 w-4" />
                    ダミーデータを100件作成
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearData} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    全データ削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* フィルター・検索セクション */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="従業員名、メールアドレス、部署で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-44 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="所属部署" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての部署</SelectItem>
                  <SelectItem value="営業部">営業部</SelectItem>
                  <SelectItem value="開発部">開発部</SelectItem>
                  <SelectItem value="管理部">管理部</SelectItem>
                  <SelectItem value="企画部">企画部</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="ACTIVE">アクティブ</SelectItem>
                  <SelectItem value="INACTIVE">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* メインコンテンツ（データテーブル） */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* 選択状態とアクション */}
          {selectedEmployeeIds.size > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedEmployeeIds.size}人を選択中
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployeeIds(new Set())}
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
              data={currentEmployees}
            />
          </div>
          
          {/* フッターセクション（ページネーション） */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50/50">
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
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
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

      {/* インポートダイアログ */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Note: AlertDialog temporarily replaced with confirm() for compatibility */}
    </div>
  );
}