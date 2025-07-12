'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, MoreHorizontal, Upload, Download, FileText, TestTube } from 'lucide-react';
import { Customer } from '@prisma/client';
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
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DeleteCustomerDialog } from '@/components/customers/DeleteCustomerDialog';
import { ImportDialog } from '@/components/customers/ImportDialog';
import { createCustomerTableColumns } from '@/components/customers/CustomerTableColumns';
import { apiClient } from '@/lib/api-client';

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // APIからデータを取得
  const { data: customersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data;
    },
  });

  // APIレスポンス形式に応じてデータを取得
  const customers = customersResponse?.data || customersResponse || [];

  // 検索・フィルタリング
  const filteredCustomers = customers.filter((customer: Customer) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.contactPerson.toLowerCase().includes(searchLower);
    
    const matchesIndustry = industryFilter === 'all' || customer.industry === industryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'ACTIVE' && customer.isActive) || 
      (statusFilter === 'INACTIVE' && !customer.isActive);
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  // ページネーション計算
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // ページ変更時に選択をリセット
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedCustomerIds(new Set());
  };

  // 表示件数変更時にページを1に戻す
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setSelectedCustomerIds(new Set());
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleNewCustomer = () => {
    router.push('/customers/new');
  };

  const handleRowClick = (customer: Customer) => {
    router.push(`/customers/${customer.id}`);
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/customers/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await apiClient.get('/customers/sample', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers_sample.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Sample download failed:', error);
    }
  };

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/customers/seed');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleSeedData = () => {
    if (confirm('100件のダミー顧客データを作成しますか？')) {
      seedMutation.mutate();
    }
  };

  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/customers/all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleClearData = () => {
    if (confirm('本当にすべての顧客データを削除しますか？この操作は取り消せません。')) {
      clearMutation.mutate();
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    const newSet = new Set(selectedCustomerIds);
    if (checked) {
      newSet.add(customerId);
    } else {
      newSet.delete(customerId);
    }
    setSelectedCustomerIds(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentCustomers.map(c => c.id));
      setSelectedCustomerIds(allIds);
    } else {
      setSelectedCustomerIds(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.size === 0) return;
    
    if (confirm(`選択した${selectedCustomerIds.size}件の顧客を削除しますか？`)) {
      try {
        await Promise.all(
          Array.from(selectedCustomerIds).map(id =>
            apiClient.delete(`/customers/${id}`)
          )
        );
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        setSelectedCustomerIds(new Set());
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const columns = createCustomerTableColumns({
    onDelete: handleDelete,
    onRowClick: handleRowClick,
    selectedCustomerIds,
    onSelectCustomer: handleSelectCustomer,
    onSelectAll: handleSelectAll,
    allCustomers: currentCustomers,
  });

  if (error) {
    return <ApiErrorAlert error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ヘッダーセクション */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">顧客管理</h1>
                    <p className="text-gray-600 text-lg">
                      顧客情報を効率的に管理・運用
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
              <Button 
                onClick={handleNewCustomer}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
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
                  <DropdownMenuLabel>データ操作</DropdownMenuLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem onClick={handleImport}>
                        <Upload className="mr-2 h-4 w-4" />
                        インポート
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>CSVファイルから顧客データを一括登録</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        エクスポート
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>現在の顧客データをCSV形式でダウンロード</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem onClick={handleDownloadSample}>
                        <FileText className="mr-2 h-4 w-4" />
                        サンプル
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>インポート用のCSVテンプレートをダウンロード</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>開発用</DropdownMenuLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem onClick={handleSeedData}>
                        <TestTube className="mr-2 h-4 w-4" />
                        ダミーデータを100件作成
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>テスト用の顧客データを自動生成</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem onClick={handleClearData} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        全データ削除
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>すべての顧客データを削除（注意：復元不可）</p>
                    </TooltipContent>
                  </Tooltip>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター・検索セクション */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="顧客名、メールアドレス、担当者名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-44 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="業種" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての業種</SelectItem>
                  <SelectItem value="製造業">製造業</SelectItem>
                  <SelectItem value="小売業">小売業</SelectItem>
                  <SelectItem value="サービス業">サービス業</SelectItem>
                  <SelectItem value="IT・通信">IT・通信</SelectItem>
                  <SelectItem value="医療・福祉">医療・福祉</SelectItem>
                  <SelectItem value="建設業">建設業</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

          {/* 選択状態とアクション */}
          {selectedCustomerIds.size > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedCustomerIds.size}件を選択中
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomerIds(new Set())}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    選択解除
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  選択した顧客を削除
                </Button>
              </div>
            </div>
          )}

          <DataTable
            columns={columns}
            data={currentCustomers}
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
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(Number(value))}>
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
                    onClick={() => handlePageChange(currentPage - 1)}
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
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  }).filter(Boolean)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ダイアログ */}
      {selectedCustomer && (
        <DeleteCustomerDialog
          customer={selectedCustomer}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={() => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setSelectedCustomer(null);
          }}
        />
      )}

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }}
      />
    </div>
  );
}