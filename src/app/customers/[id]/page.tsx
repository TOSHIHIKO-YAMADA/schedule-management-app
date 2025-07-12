'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Building2, Mail, Phone, Globe } from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Badge } from '@/components/ui/badge';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { EntityDetailLayout } from '@/components/shared/EntityDetailLayout';
import { DetailSection, DetailField, MetaInfo } from '@/components/shared/DetailSection';
import { apiClient } from '@/lib/api-client';
import { Customer } from '@prisma/client';

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEdit } = useAuthorization();
  
  // クエリパラメータから編集モードを判定
  const shouldStartEditing = searchParams.get('edit') === 'true';
  const [isEditing, setIsEditing] = useState(shouldStartEditing);
  
  // Next.js 15でparamsはPromiseになったため、use()でアンラップ
  const { id } = use(params);

  const { data: customer, isLoading, error, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data.data as Customer;
    },
  });

  const handleBack = () => {
    router.push('/customers');
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

  const isActive = customer?.isActive;

  // 詳細表示コンテンツ
  const detailContent = customer ? (
    <div className="space-y-8">
      {/* 基本情報表示セクション */}
      <DetailSection icon={Building2} title="基本情報" subtitle="顧客の基本的な情報">
        <DetailField label="会社名" value={customer.name} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="業種" value={customer.industry} />
          <DetailField label="担当者" value={customer.contactPerson} />
        </div>
      </DetailSection>

      {/* 連絡先情報表示セクション */}
      <DetailSection 
        icon={Mail} 
        title="連絡先情報" 
        subtitle="メールアドレスや電話番号などの連絡先"
        gradientFrom="green-200"
        gradientTo="blue-200"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailField 
              label="メールアドレス" 
              value={customer.email}
              formatValue={(value) => (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  {value}
                </div>
              )}
            />
            <DetailField 
              label="電話番号" 
              value={customer.phone}
              formatValue={(value) => (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  {value}
                </div>
              )}
            />
          </div>
          {customer.website && (
            <DetailField 
              label="ウェブサイト" 
              value={customer.website}
              formatValue={(value) => (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {value}
                  </a>
                </div>
              )}
            />
          )}
        </div>
      </DetailSection>

      {/* 所在地情報表示セクション */}
      <DetailSection 
        icon={Building2} 
        title="所在地情報" 
        subtitle="住所や関連情報"
        gradientFrom="purple-200"
        gradientTo="pink-200"
      >
        <DetailField label="住所" value={customer.address} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField 
            label="ステータス" 
            value={isActive ? 'アクティブ' : '非アクティブ'}
          />
          <DetailField 
            label="登録日" 
            value={customer.createdAt}
            formatValue={(value) => new Date(value).toLocaleDateString('ja-JP')}
          />
        </div>
      </DetailSection>

      {/* メタ情報 */}
      <MetaInfo createdAt={customer.createdAt} updatedAt={customer.updatedAt} />
    </div>
  ) : null;

  // 編集コンテンツ
  const editContent = customer ? (
    <CustomerForm 
      customer={customer}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  ) : null;

  return (
    <EntityDetailLayout
      entity={customer}
      entityName="顧客"
      entityTitle={customer?.name || ''}
      isLoading={isLoading}
      error={error}
      isEditing={isEditing}
      canEdit={canEdit}
      onBack={handleBack}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onRefetch={refetch}
      statusBadge={
        customer && (
          <Badge variant={isActive ? 'success' : 'inactive'} className="text-sm px-3 py-1">
            {isActive ? 'アクティブ' : '非アクティブ'}
          </Badge>
        )
      }
      subtitle={customer?.industry}
      detailContent={detailContent}
      editContent={editContent}
    />
  );
}