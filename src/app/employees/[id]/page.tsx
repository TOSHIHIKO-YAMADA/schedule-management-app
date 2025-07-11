'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, User, Eye } from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
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
      return response.data as Employee;
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

  const isActive = employee.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-white/80 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                {isEditing ? (
                  <Edit className="w-8 h-8 text-white" />
                ) : (
                  <Eye className="w-8 h-8 text-white" />
                )}
              </div>
              
              {!isEditing && canEdit && (
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  編集モード
                </Button>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isEditing ? '従業員情報編集' : '従業員詳細'}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {employee.name}さんの情報を{isEditing ? '編集' : '確認'}できます
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Badge variant={isActive ? 'success' : 'inactive'} className="text-sm px-3 py-1">
                {isActive ? 'アクティブ' : '非アクティブ'}
              </Badge>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600 font-medium">{employee.department}</span>
            </div>
          </div>

          {/* プログレス表示（編集モード時のみ） */}
          {isEditing && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-blue-600">情報編集</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded max-w-20"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-500">確認・保存</span>
                </div>
              </div>
            </div>
          )}

          {/* フォームカード */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden">
            <div className="p-8">
              {isEditing ? (
                <EmployeeForm 
                  employee={employee}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="space-y-8">
                  {/* 基本情報表示セクション */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gradient-to-r from-blue-200 to-indigo-200">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">基本情報</h3>
                        <p className="text-sm text-gray-600">従業員の基本的な情報</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">氏名</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                          {employee.name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">ふりがな</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                          {employee.nameKana}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">所属</label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                        {employee.department}
                      </p>
                    </div>
                  </div>

                  {/* 連絡先情報表示セクション */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gradient-to-r from-green-200 to-blue-200">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">連絡先情報</h3>
                        <p className="text-sm text-gray-600">メールアドレスや電話番号などの連絡先</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">メールアドレス</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                          {employee.email}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">電話番号</label>
                          <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                            {employee.phone || '未設定'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">LINE ID</label>
                          <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                            {employee.lineId || '未設定'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">通知方法</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                          {employee.notificationMethod === 'email' ? 'メール' : 
                           employee.notificationMethod === 'line' ? 'LINE' : 
                           employee.notificationMethod === 'both' ? 'メール・LINE' : employee.notificationMethod}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 勤務情報表示セクション */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gradient-to-r from-purple-200 to-pink-200">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">勤務情報</h3>
                        <p className="text-sm text-gray-600">勤務先や通勤に関する情報</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">最寄り駅</label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                        {employee.nearestStation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">主な通勤手段</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                          {employee.transportation === 'train' ? '電車' :
                           employee.transportation === 'car' ? '車' :
                           employee.transportation === 'bicycle' ? '自転車' :
                           employee.transportation === 'walk' ? '徒歩' :
                           employee.transportation === 'bus' ? 'バス' : employee.transportation}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">ステータス</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
                          {isActive ? 'アクティブ' : '非アクティブ'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* メタ情報 */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">作成日:</span> {new Date(employee.createdAt).toLocaleString('ja-JP')}
                      </div>
                      <div>
                        <span className="font-medium">更新日:</span> {new Date(employee.updatedAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}