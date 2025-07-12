'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Vehicle } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

// バリデーションスキーマ
const vehicleFormSchema = z.object({
  name: z.string().min(1, '車両名は必須です'),
  licensePlate: z.string().min(1, 'ナンバープレートは必須です'),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional().or(z.literal('')),
  color: z.string().optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
  capacity: z.number().min(1).max(50).optional().or(z.literal('')),
  mileage: z.number().min(0).optional().or(z.literal('')),
  inspectionDate: z.string().optional(),
  insuranceDate: z.string().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!vehicle;

  // フォームの初期値設定
  const defaultValues: Partial<VehicleFormData> = {
    name: vehicle?.name || '',
    licensePlate: vehicle?.licensePlate || '',
    model: vehicle?.model || '',
    manufacturer: vehicle?.manufacturer || '',
    year: vehicle?.year || '',
    color: vehicle?.color || '',
    fuelType: (vehicle?.fuelType as 'gasoline' | 'diesel' | 'electric' | 'hybrid') || 'gasoline',
    capacity: vehicle?.capacity || '',
    mileage: vehicle?.mileage || '',
    inspectionDate: vehicle?.inspectionDate 
      ? new Date(vehicle.inspectionDate).toISOString().split('T')[0] 
      : '',
    insuranceDate: vehicle?.insuranceDate 
      ? new Date(vehicle.insuranceDate).toISOString().split('T')[0] 
      : '',
    isActive: vehicle?.isActive ?? true,
    notes: vehicle?.notes || '',
  };

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues,
  });

  // API mutation
  const mutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      // 空文字列をundefinedに変換
      const cleanedData = {
        ...data,
        year: data.year === '' ? undefined : Number(data.year),
        capacity: data.capacity === '' ? undefined : Number(data.capacity),
        mileage: data.mileage === '' ? undefined : Number(data.mileage),
        model: data.model || undefined,
        manufacturer: data.manufacturer || undefined,
        color: data.color || undefined,
        inspectionDate: data.inspectionDate || undefined,
        insuranceDate: data.insuranceDate || undefined,
        notes: data.notes || undefined,
      };

      if (isEditing) {
        const response = await apiClient.put(`/vehicles/${vehicle.id}`, cleanedData);
        return response.data;
      } else {
        const response = await apiClient.post('/vehicles', cleanedData);
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] });
      }
      onSuccess();
      
      // 成功メッセージ表示
      if (data.message) {
        alert(data.message);
      }
    },
    onError: (error: any) => {
      console.error('車両保存エラー:', error);
      const errorMessage = error.response?.data?.error || '車両の保存に失敗しました';
      alert(errorMessage);
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    mutation.mutate(data);
  };

  const fuelTypeOptions = [
    { value: 'gasoline', label: 'ガソリン' },
    { value: 'diesel', label: 'ディーゼル' },
    { value: 'electric', label: '電気' },
    { value: 'hybrid', label: 'ハイブリッド' },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>車両の基本的な情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">車両名 *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="営業車1号"
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">ナンバープレート *</Label>
              <Input
                id="licensePlate"
                {...form.register('licensePlate')}
                placeholder="横浜 123 あ 4567"
                className={`font-mono ${form.formState.errors.licensePlate ? 'border-red-500' : ''}`}
              />
              {form.formState.errors.licensePlate && (
                <p className="text-sm text-red-500">{form.formState.errors.licensePlate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">メーカー</Label>
              <Input
                id="manufacturer"
                {...form.register('manufacturer')}
                placeholder="トヨタ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">車種・型式</Label>
              <Input
                id="model"
                {...form.register('model')}
                placeholder="プリウス"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="year">年式</Label>
              <Input
                id="year"
                type="number"
                {...form.register('year', { valueAsNumber: true })}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">色</Label>
              <Input
                id="color"
                {...form.register('color')}
                placeholder="白"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">乗車定員</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register('capacity', { valueAsNumber: true })}
                placeholder="5"
                min="1"
                max="50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 燃料・走行距離 */}
      <Card>
        <CardHeader>
          <CardTitle>燃料・走行距離</CardTitle>
          <CardDescription>燃料タイプと走行距離の情報</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fuelType">燃料タイプ *</Label>
              <Select
                value={form.watch('fuelType')}
                onValueChange={(value) => form.setValue('fuelType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="燃料タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">現在の走行距離 (km)</Label>
              <Input
                id="mileage"
                type="number"
                {...form.register('mileage', { valueAsNumber: true })}
                placeholder="50000"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 車検・保険情報 */}
      <Card>
        <CardHeader>
          <CardTitle>車検・保険情報</CardTitle>
          <CardDescription>法定点検や保険の期限情報</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="inspectionDate">車検満了日</Label>
              <Input
                id="inspectionDate"
                type="date"
                {...form.register('inspectionDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceDate">保険期限</Label>
              <Input
                id="insuranceDate"
                type="date"
                {...form.register('insuranceDate')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 管理設定 */}
      <Card>
        <CardHeader>
          <CardTitle>管理設定</CardTitle>
          <CardDescription>車両の管理に関する設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">アクティブ状態</Label>
            <span className="text-sm text-gray-500">
              非アクティブにすると一覧に表示されなくなります
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="車両に関する備考やメモを入力してください"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* フォームアクション */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {mutation.isPending 
            ? (isEditing ? '更新中...' : '登録中...') 
            : (isEditing ? '更新' : '登録')
          }
        </Button>
      </div>
    </form>
  );
}