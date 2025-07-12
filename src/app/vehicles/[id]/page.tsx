'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Car, AlertTriangle, Calendar, Fuel, Users } from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { EntityDetailLayout } from '@/components/shared/EntityDetailLayout';
import { DetailSection, DetailField, MetaInfo } from '@/components/shared/DetailSection';
import { apiClient } from '@/lib/api-client';
import { Vehicle } from '@prisma/client';

interface VehicleWithAlerts extends Vehicle {
  alerts: {
    inspection: {
      date: Date;
      isExpired: boolean;
      isExpiringSoon: boolean;
      daysUntilExpiry: number;
    } | null;
    insurance: {
      date: Date;
      isExpired: boolean;
      isExpiringSoon: boolean;
      daysUntilExpiry: number;
    } | null;
  };
  _count: {
    usageHistory: number;
  };
  usageHistory: any[];
}

interface VehicleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEdit } = useAuthorization();
  
  // クエリパラメータから編集モードを判定
  const shouldStartEditing = searchParams.get('edit') === 'true';
  const [isEditing, setIsEditing] = useState(shouldStartEditing);
  
  // Next.js 15でparamsはPromiseになったため、use()でアンラップ
  const { id } = use(params);

  const { data: vehicle, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles/${id}`);
      return response.data.data as VehicleWithAlerts;
    },
  });

  const handleBack = () => {
    router.push('/vehicles');
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

  // ヘルパー関数
  const formatFuelType = (fuelType: string) => {
    const fuelTypeMap = {
      gasoline: 'ガソリン',
      diesel: 'ディーゼル',
      electric: '電気',
      hybrid: 'ハイブリッド',
    };
    return fuelTypeMap[fuelType as keyof typeof fuelTypeMap] || fuelType;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '未設定';
    return new Date(date).toLocaleDateString('ja-JP');
  };

  const formatMileage = (mileage: number | null) => {
    if (!mileage) return '未設定';
    return `${mileage.toLocaleString()}km`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <ApiErrorAlert error={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">車両が見つかりません</h1>
            <p className="text-gray-600 mt-2">指定された車両情報は存在しないか、削除されています。</p>
            <Button onClick={handleBack} className="mt-4">
              車両一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = vehicle?.isActive;

  // アラートバッジの作成
  const createAlertBadges = () => {
    const badges = [];
    
    if (vehicle.alerts.inspection) {
      const { isExpired, isExpiringSoon, daysUntilExpiry } = vehicle.alerts.inspection;
      if (isExpired) {
        badges.push(
          <Badge key="inspection-expired" variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            車検期限切れ
          </Badge>
        );
      } else if (isExpiringSoon) {
        badges.push(
          <Badge key="inspection-soon" variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            車検期限{daysUntilExpiry}日後
          </Badge>
        );
      }
    }
    
    if (vehicle.alerts.insurance) {
      const { isExpired, isExpiringSoon, daysUntilExpiry } = vehicle.alerts.insurance;
      if (isExpired) {
        badges.push(
          <Badge key="insurance-expired" variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            保険期限切れ
          </Badge>
        );
      } else if (isExpiringSoon) {
        badges.push(
          <Badge key="insurance-soon" variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            保険期限{daysUntilExpiry}日後
          </Badge>
        );
      }
    }
    
    return badges;
  };

  // 詳細表示コンテンツ
  const detailContent = vehicle ? (
    <div className="space-y-8">
      {/* 基本情報表示セクション */}
      <DetailSection icon={Car} title="基本情報" subtitle="車両の基本的な情報">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="車両名" value={vehicle.name} />
          <DetailField label="ナンバープレート" value={vehicle.licensePlate} 
            formatValue={(value) => (
              <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                {value}
              </span>
            )} 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="メーカー" value={vehicle.manufacturer} />
          <DetailField label="車種・型式" value={vehicle.model} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DetailField label="年式" value={vehicle.year} 
            formatValue={(value) => value ? `${value}年` : '未設定'} 
          />
          <DetailField label="色" value={vehicle.color} />
          <DetailField label="乗車定員" value={vehicle.capacity} 
            formatValue={(value) => value ? `${value}人` : '未設定'} 
          />
        </div>
      </DetailSection>

      {/* 燃料・走行距離情報 */}
      <DetailSection 
        icon={Fuel} 
        title="燃料・走行距離" 
        subtitle="燃料タイプと走行距離の情報"
        gradientFrom="emerald-200"
        gradientTo="green-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="燃料タイプ" value={vehicle.fuelType} 
            formatValue={(value) => formatFuelType(value)} 
          />
          <DetailField label="現在の走行距離" value={vehicle.mileage} 
            formatValue={(value) => formatMileage(value)} 
          />
        </div>
      </DetailSection>

      {/* 車検・保険情報 */}
      <DetailSection 
        icon={Calendar} 
        title="車検・保険情報" 
        subtitle="法定点検や保険の期限情報"
        gradientFrom="orange-200"
        gradientTo="red-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="車検満了日" value={vehicle.inspectionDate} 
            formatValue={(value) => formatDate(value)} 
          />
          <DetailField label="保険期限" value={vehicle.insuranceDate} 
            formatValue={(value) => formatDate(value)} 
          />
        </div>
        
        {/* アラート表示 */}
        {createAlertBadges().length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-amber-800">期限に関する注意</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {createAlertBadges()}
            </div>
          </div>
        )}
      </DetailSection>

      {/* 使用状況 */}
      <DetailSection 
        icon={Users} 
        title="使用状況" 
        subtitle="車両の使用履歴と統計情報"
        gradientFrom="blue-200"
        gradientTo="indigo-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="総使用回数" value={vehicle._count.usageHistory} 
            formatValue={(value) => `${value}回`} 
          />
          <DetailField 
            label="ステータス" 
            value={isActive ? 'アクティブ' : '非アクティブ'}
          />
        </div>
        {vehicle.notes && (
          <DetailField label="備考" value={vehicle.notes} />
        )}
      </DetailSection>

      {/* メタ情報 */}
      <MetaInfo createdAt={vehicle.createdAt} updatedAt={vehicle.updatedAt} />
    </div>
  ) : null;

  // 編集コンテンツ
  const editContent = vehicle ? (
    <VehicleForm 
      vehicle={vehicle}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  ) : null;

  return (
    <EntityDetailLayout
      entity={vehicle}
      entityName="車両"
      entityTitle={`${vehicle?.name || ''}`}
      isLoading={isLoading}
      error={error}
      isEditing={isEditing}
      canEdit={canEdit}
      onBack={handleBack}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onRefetch={refetch}
      statusBadge={
        vehicle && (
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'success' : 'inactive'} className="text-sm px-3 py-1">
              {isActive ? 'アクティブ' : '非アクティブ'}
            </Badge>
            {createAlertBadges()}
          </div>
        )
      }
      subtitle={vehicle?.licensePlate}
      detailContent={detailContent}
      editContent={editContent}
    />
  );
}