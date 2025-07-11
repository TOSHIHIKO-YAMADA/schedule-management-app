'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Employee } from '@prisma/client';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { createEmployeeTableColumns } from '@/components/employees/EmployeeTableColumns';
import { apiClient } from '@/lib/api-client';

export default function EmployeesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());

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
      const allIds = new Set(filteredEmployees.map((emp: Employee) => emp.id));
      setSelectedEmployeeIds(allIds);
    } else {
      setSelectedEmployeeIds(new Set());
    }
  };

  const columns = createEmployeeTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    selectedEmployeeIds,
    onSelectEmployee: handleSelectEmployee,
    onSelectAll: handleSelectAll,
    allEmployees: filteredEmployees,
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
          <div className="flex gap-3">
            <Button 
              onClick={handleSeedData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              ダミーデータ100件作成
            </Button>
            <Button 
              onClick={handleNewEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新規従業員追加
            </Button>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="名前、メールで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="部署で絞り込み" />
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
              <SelectTrigger>
                <SelectValue placeholder="ステータスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="ACTIVE">アクティブ</SelectItem>
                <SelectItem value="INACTIVE">非アクティブ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* データテーブル */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <DataTable
            columns={columns}
            data={filteredEmployees}
          />
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
    </div>
  );
}