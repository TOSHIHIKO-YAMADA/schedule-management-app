'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Train, Bell, Save, X } from 'lucide-react';
import { updateEmployeeSchema } from '@/lib/validations/employee';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { Employee } from '@prisma/client';
import { z } from 'zod';

type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canEdit } = useAuthorization();
  const [isEditing, setIsEditing] = useState(false);
  
  // Next.js 15でparamsはPromiseになったため、use()でアンラップ
  const { id } = use(params);

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data as Employee;
    },
  });

  const form = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {},
  });

  // フォームのデフォルト値を更新
  useEffect(() => {
    if (employee) {
      form.reset(employee);
    }
  }, [employee, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateEmployeeFormData) => {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsEditing(false);
      alert('従業員情報を更新しました');
    },
    onError: (error) => {
      alert('更新に失敗しました');
      console.error('Update failed:', error);
    },
  });

  const handleBack = () => {
    router.push('/employees');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset(employee);
    setIsEditing(false);
  };

  const handleSubmit = (data: UpdateEmployeeFormData) => {
    updateMutation.mutate(data);
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">従業員詳細</h1>
                <p className="text-gray-600 mt-1">従業員の詳細情報を確認できます</p>
              </div>
            </div>
            {!isEditing && canEdit && (
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                編集する
              </Button>
            )}
            {isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  form="employee-form"
                  disabled={!form.formState.isDirty || updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? '更新中...' : '更新する'}
                </Button>
              </div>
            )}
          </div>

          {/* メインカード */}
          <form
            id="employee-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl shadow-indigo-100/50 overflow-hidden"
          >
            {/* 基本情報セクション */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">氏名</label>
                            <Input {...form.register('name')} className="mt-1" />
                            {form.formState.errors.name && (
                              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">ふりがな</label>
                            <Input {...form.register('nameKana')} className="mt-1" />
                            {form.formState.errors.nameKana && (
                              <p className="text-sm text-red-500 mt-1">{form.formState.errors.nameKana.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">ステータス</label>
                            <Select
                              value={form.watch('status')}
                              onValueChange={(value) => form.setValue('status', value, { shouldDirty: true })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">アクティブ</SelectItem>
                                <SelectItem value="INACTIVE">非アクティブ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">所属</label>
                            <Input {...form.register('department')} className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">役職</label>
                            <Input {...form.register('position')} className="mt-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                        <p className="text-lg text-gray-600">{employee.nameKana}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={isActive ? 'success' : 'inactive'}>
                            {isActive ? 'アクティブ' : '非アクティブ'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {employee.department} / {employee.position}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 連絡先情報 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  連絡先情報
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">メールアドレス</p>
                      {isEditing ? (
                        <>
                          <Input {...form.register('email')} type="email" className="mt-1" />
                          {form.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                          )}
                        </>
                      ) : (
                        <p className="font-medium text-gray-900">{employee.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {employee.phone && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">電話番号</p>
                        <p className="font-medium text-gray-900">{employee.phone}</p>
                      </div>
                    </div>
                  )}

                  {employee.lineId && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">LINE</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">LINE ID</p>
                        <p className="font-medium text-gray-900">{employee.lineId}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">通知方法</p>
                      <p className="font-medium text-gray-900">
                        {employee.notificationMethod === 'email' ? 'メール' : 
                         employee.notificationMethod === 'line' ? 'LINE' : 
                         employee.notificationMethod === 'both' ? 'メール・LINE' : employee.notificationMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 勤務情報 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  勤務情報
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">最寄り駅</p>
                      <p className="font-medium text-gray-900">{employee.nearestStation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Train className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">主な通勤手段</p>
                      <p className="font-medium text-gray-900">
                        {employee.transportation === 'train' ? '電車' :
                         employee.transportation === 'car' ? '車' :
                         employee.transportation === 'bicycle' ? '自転車' :
                         employee.transportation === 'walk' ? '徒歩' :
                         employee.transportation === 'bus' ? 'バス' : employee.transportation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>作成日: {new Date(employee.createdAt).toLocaleString('ja-JP')}</span>
                <span>更新日: {new Date(employee.updatedAt).toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}