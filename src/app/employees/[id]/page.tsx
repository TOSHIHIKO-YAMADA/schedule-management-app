'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Badge } from '@/components/ui/badge';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { EntityDetailLayout } from '@/components/shared/EntityDetailLayout';
import { DetailSection, DetailField, MetaInfo } from '@/components/shared/DetailSection';
import { apiClient } from '@/lib/api-client';
import { Employee } from '@prisma/client';

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEdit } = useAuthorization();
  
  // クエリパラメータから編集モードを判定
  const shouldStartEditing = searchParams.get('edit') === 'true';
  const [isEditing, setIsEditing] = useState(shouldStartEditing);
  
  // Next.js 15でparamsはPromiseになったため、use()でアンラップ
  const { id } = use(params);

  const { data: employee, isLoading, error, refetch } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data.data as Employee;
    },
  });

  const handleBack = () => {
    router.push('/employees');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSuccess = () => {
    setIsEditing(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <ApiErrorAlert error={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">従業員が見つかりません</h1>
            <p className="text-gray-600 mt-2">指定された従業員情報は存在しないか、削除されています。</p>
            <Button onClick={handleBack} className="mt-4">
              従業員一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = employee?.status === 'ACTIVE';

  // 詳細表示コンテンツ
  const detailContent = employee ? (
    <div className="space-y-8">
      {/* 基本情報表示セクション */}
      <DetailSection icon={User} title="基本情報" subtitle="従業員の基本的な情報">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="氏名" value={employee.name} />
          <DetailField label="ふりがな" value={employee.nameKana} />
        </div>
        <DetailField label="所属" value={employee.department} />
      </DetailSection>

      {/* 連絡先情報表示セクション */}
      <DetailSection 
        icon={User} 
        title="連絡先情報" 
        subtitle="メールアドレスや電話番号などの連絡先"
        gradientFrom="green-200"
        gradientTo="blue-200"
      >
        <div className="space-y-6">
          <DetailField label="メールアドレス" value={employee.email} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailField label="電話番号" value={employee.phone} />
            <DetailField label="LINE ID" value={employee.lineId} />
          </div>
          <DetailField 
            label="通知方法" 
            value={employee.notificationMethod}
            formatValue={(value) => {
              switch(value) {
                case 'email': return 'メール';
                case 'line': return 'LINE';
                case 'both': return 'メール・LINE';
                default: return value;
              }
            }}
          />
        </div>
      </DetailSection>

      {/* 勤務情報表示セクション */}
      <DetailSection 
        icon={User} 
        title="勤務情報" 
        subtitle="勤務先や通勤に関する情報"
        gradientFrom="purple-200"
        gradientTo="pink-200"
      >
        <DetailField label="最寄り駅" value={employee.nearestStation} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField 
            label="主な通勤手段" 
            value={employee.transportation}
            formatValue={(value) => {
              switch(value) {
                case 'train': return '電車';
                case 'car': return '車';
                case 'bicycle': return '自転車';
                case 'walk': return '徒歩';
                case 'bus': return 'バス';
                default: return value;
              }
            }}
          />
          <DetailField 
            label="ステータス" 
            value={isActive ? 'アクティブ' : '非アクティブ'}
          />
        </div>
      </DetailSection>

      {/* メタ情報 */}
      <MetaInfo createdAt={employee.createdAt} updatedAt={employee.updatedAt} />
    </div>
  ) : null;

  // 編集コンテンツ
  const editContent = employee ? (
    <EmployeeForm 
      employee={employee}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  ) : null;

  return (
    <EntityDetailLayout
      entity={employee}
      entityName="従業員"
      entityTitle={`${employee?.name || ''}さん`}
      isLoading={isLoading}
      error={error}
      isEditing={isEditing}
      canEdit={canEdit}
      onBack={handleBack}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onRefetch={refetch}
      statusBadge={
        employee && (
          <Badge variant={isActive ? 'success' : 'inactive'} className="text-sm px-3 py-1">
            {isActive ? 'アクティブ' : '非アクティブ'}
          </Badge>
        )
      }
      subtitle={employee?.department}
      detailContent={detailContent}
      editContent={editContent}
    />
  );
}