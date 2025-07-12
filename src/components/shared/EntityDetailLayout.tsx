'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';

interface EntityDetailLayoutProps {
  // エンティティ情報
  entity: any;
  entityName: string; // "従業員" or "顧客"
  entityTitle: string; // 例: "山田太郎さん" or "株式会社○○"
  
  // 状態
  isLoading: boolean;
  error: any;
  isEditing: boolean;
  canEdit: boolean;
  
  // アクション
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onRefetch: () => void;
  
  // 表示コンテンツ
  statusBadge?: ReactNode;
  subtitle?: string;
  detailContent: ReactNode; // 詳細表示時のコンテンツ
  editContent: ReactNode; // 編集時のコンテンツ
  
  // オプション
  showProgress?: boolean;
  progressSteps?: Array<{ number: number; label: string; active: boolean }>;
}

export function EntityDetailLayout({
  entity,
  entityName,
  entityTitle,
  isLoading,
  error,
  isEditing,
  canEdit,
  onBack,
  onEdit,
  onCancel,
  onRefetch,
  statusBadge,
  subtitle,
  detailContent,
  editContent,
  showProgress = true,
  progressSteps = [
    { number: 1, label: '情報編集', active: true },
    { number: 2, label: '確認・保存', active: false }
  ]
}: EntityDetailLayoutProps) {
  const router = useRouter();

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
          <ApiErrorAlert error={error} onRetry={onRefetch} />
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{entityName}が見つかりません</h1>
            <p className="text-gray-600 mt-2">指定された{entityName}情報は存在しないか、削除されています。</p>
            <Button onClick={onBack} className="mt-4">
              {entityName}一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/80 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                {isEditing ? (
                  <Edit className="w-8 h-8 text-white" />
                ) : (
                  <FileText className="w-8 h-8 text-white" />
                )}
              </div>
              
              {!isEditing && canEdit && (
                <Button
                  onClick={onEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  編集モード
                </Button>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isEditing ? `${entityName}情報編集` : `${entityName}詳細`}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {entityTitle}の情報を{isEditing ? '編集' : '確認'}できます
            </p>
            
            {(statusBadge || subtitle) && (
              <div className="flex items-center justify-center gap-3">
                {statusBadge}
                {statusBadge && subtitle && <span className="text-gray-500">•</span>}
                {subtitle && <span className="text-gray-600 font-medium">{subtitle}</span>}
              </div>
            )}
          </div>

          {/* プログレス表示（編集モード時のみ） */}
          {isEditing && showProgress && progressSteps && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                {progressSteps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${step.active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'} rounded-full flex items-center justify-center text-sm font-medium`}>
                        {step.number}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${step.active ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className="flex-1 h-1 bg-gray-200 rounded max-w-20 ml-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* フォームカード */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden">
            <div className="p-8">
              {isEditing ? editContent : detailContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}