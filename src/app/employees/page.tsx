'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { InteractiveCard, InteractiveButton } from '@/components/animations/InteractiveCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { useEmployees } from '@/hooks/useEmployees';
import { EmployeeTableColumns } from '@/components/employees/EmployeeTableColumns';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // APIからデータを取得
  const { data: employees = [], isLoading, error, refetch } = useEmployees({
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    isActive: true,
  });

  // 検索フィルタリング（クライアントサイド）
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.nameKana.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.employeeNumber.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-6 space-y-6">
          {/* ヘッダー */}
          <StaggerContainer>
            <StaggerItem>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">従業員管理</h1>
                  <p className="text-muted-foreground mt-1">
                    従業員の情報を管理・編集できます
                  </p>
                </div>
                <InteractiveButton variant="default" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  新規従業員追加
                </InteractiveButton>
              </div>
            </StaggerItem>

            {/* フィルター */}
            <StaggerItem>
              <InteractiveCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="名前、メール、社員番号で検索..."
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
                      <SelectItem value="技術部">技術部</SelectItem>
                      <SelectItem value="管理部">管理部</SelectItem>
                      <SelectItem value="企画部">企画部</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="権限で絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての権限</SelectItem>
                      <SelectItem value="super">スーパー管理者</SelectItem>
                      <SelectItem value="admin">管理者</SelectItem>
                      <SelectItem value="limited_admin">制限付き管理者</SelectItem>
                      <SelectItem value="general">一般</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </InteractiveCard>
            </StaggerItem>

            {/* エラー表示 */}
            {error && (
              <StaggerItem>
                <ApiErrorAlert error={error} onRetry={refetch} />
              </StaggerItem>
            )}

            {/* データテーブル */}
            <StaggerItem>
              <InteractiveCard>
                <DataTable
                  columns={EmployeeTableColumns}
                  data={filteredEmployees}
                  isLoading={isLoading}
                />
              </InteractiveCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}