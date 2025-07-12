'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import { apiClient } from '@/lib/api-client';
import { Customer } from '@prisma/client';

const customerSchema = z.object({
  name: z.string().min(1, '顧客名は必須です'),
  address: z.string().min(1, '住所は必須です'),
  phone: z.string().min(1, '電話番号は必須です'),
  contactPerson: z.string().min(1, '担当者名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  website: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  industry: z.string().optional(),
  isActive: z.boolean(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customerId?: string;
  customer?: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customerId, customer: providedCustomer, onSuccess, onCancel }: CustomerFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!(customerId || providedCustomer);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      contactPerson: '',
      email: '',
      website: '',
      industry: '',
      isActive: true,
    },
  });

  // 編集時のデータ取得（providedCustomerがない場合のみ）
  const { data: fetchedCustomer, isLoading, error } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const response = await apiClient.get(`/customers/${customerId}`);
      return response.data.data as Customer;
    },
    enabled: isEdit && !providedCustomer,
  });

  // 使用するcustomerデータ（providedCustomerまたはfetchedCustomer）
  const customer = providedCustomer || fetchedCustomer;

  // フォームにデータをセット
  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        contactPerson: customer.contactPerson,
        email: customer.email,
        website: customer.website || '',
        industry: customer.industry || '',
        isActive: customer.isActive,
      });
    }
  }, [customer, reset]);

  // 作成・更新処理
  const saveMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const id = customerId || customer?.id;
      if (isEdit && id) {
        const response = await apiClient.put(`/customers/${id}`, data);
        return response.data;
      } else {
        const response = await apiClient.post('/customers', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/customers');
      }
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    saveMutation.mutate(data);
  };

  // onCancelまたはonSuccessが提供されている場合は独立したコンポーネントとして動作
  const isStandalone = !onCancel && !onSuccess;

  if (isEdit && isLoading && isStandalone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isEdit && error && isStandalone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <ApiErrorAlert error={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  // 埋め込み時（詳細画面など）でローディング中またはエラーの場合
  if (isEdit && isLoading && !isStandalone) {
    return <LoadingSpinner />;
  }

  if (isEdit && error && !isStandalone) {
    return <ApiErrorAlert error={error} onRetry={() => window.location.reload()} />;
  }

  const isActive = watch('isActive');
  const industry = watch('industry');

  const formContent = (
    <>
      {/* スタンドアロン時のヘッダー */}
      {isStandalone && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? '顧客情報編集' : '顧客新規登録'}
              </h1>
              {isEdit && customer && (
                <p className="text-purple-100 mt-1">ID: {customer.id}</p>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/customers')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Button>
          </div>
        </div>
      )}

        {/* フォーム */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                基本情報
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">顧客名 *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="株式会社〇〇"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">業種</Label>
                  <Select 
                    value={industry} 
                    onValueChange={(value) => setValue('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="業種を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="製造業">製造業</SelectItem>
                      <SelectItem value="小売業">小売業</SelectItem>
                      <SelectItem value="サービス業">サービス業</SelectItem>
                      <SelectItem value="IT・通信">IT・通信</SelectItem>
                      <SelectItem value="医療・福祉">医療・福祉</SelectItem>
                      <SelectItem value="建設業">建設業</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">住所 *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  className={errors.address ? 'border-red-500' : ''}
                  placeholder="東京都千代田区〇〇"
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                連絡先情報
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">担当者名 *</Label>
                  <Input
                    id="contactPerson"
                    {...register('contactPerson')}
                    className={errors.contactPerson ? 'border-red-500' : ''}
                    placeholder="山田 太郎"
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-red-500">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号 *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="03-1234-5678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="contact@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">ウェブサイト</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    className={errors.website ? 'border-red-500' : ''}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ステータス */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                ステータス
              </h2>

              <div className="flex items-center space-x-3">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  {isActive ? 'アクティブ' : '非アクティブ'}
                </Label>
              </div>
            </div>

            {/* エラー表示 */}
            {saveMutation.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                エラーが発生しました。もう一度お試しください。
              </div>
            )}

            {/* ボタン */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || (() => router.push('/customers'))}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
    </>
  );

  return isStandalone ? (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {formContent}
      </div>
    </div>
  ) : (
    formContent
  );
}