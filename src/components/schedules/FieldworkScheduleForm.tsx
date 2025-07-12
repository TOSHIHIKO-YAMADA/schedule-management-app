'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Trash2, X, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  fieldworkScheduleSchema,
  type FieldworkScheduleFormData,
  equipmentOptions,
  defaultTimeSlot,
  defaultFormValues,
} from '@/lib/validations/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FieldworkScheduleFormProps {
  onSubmit: (data: FieldworkScheduleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<FieldworkScheduleFormData>;
}

export function FieldworkScheduleForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}: FieldworkScheduleFormProps) {
  const [showRecurring, setShowRecurring] = useState(false);
  const [responsibleSearch, setResponsibleSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  // 顧客データを取得
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data.data;
    },
  });
  
  // 従業員データを取得
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees');
      return response.data.data;
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldworkScheduleFormData>({
    resolver: zodResolver(fieldworkScheduleSchema),
    defaultValues: {
      ...defaultFormValues,
      ...initialData,
    },
  });

  const { fields: timeSlotFields, append: appendTimeSlot, remove: removeTimeSlot } = useFieldArray({
    control,
    name: 'timeSlots',
  });

  const { fields: assignmentFields, append: appendAssignment, remove: removeAssignment } = useFieldArray({
    control,
    name: 'assignments',
  });

  const watchedEquipment = watch('equipment');

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    const currentEquipment = watchedEquipment || [];
    if (checked) {
      setValue('equipment', [...currentEquipment, equipmentId]);
    } else {
      setValue('equipment', currentEquipment.filter(id => id !== equipmentId));
    }
  };

  const addTimeSlot = () => {
    if (timeSlotFields.length < 10) {
      appendTimeSlot(defaultTimeSlot);
    }
  };

  const addAssignment = () => {
    appendAssignment({
      employeeId: '',
      role: '',
      isManager: false,
    });
  };

  // 時間帯の必要人数を監視し、担当者割り当てを動的に調整
  const watchedTimeSlots = watch('timeSlots');
  const totalRequiredPersons = watchedTimeSlots?.reduce((total, slot) => total + (slot.requiredPersons || 0), 0) || 0;

  // 担当者割り当て数を必要人数に合わせて調整
  React.useEffect(() => {
    const currentAssignments = assignmentFields.length;
    if (totalRequiredPersons > currentAssignments) {
      // 足りない分を追加
      for (let i = currentAssignments; i < totalRequiredPersons; i++) {
        appendAssignment({
          employeeId: '',
          role: '',
          isManager: false,
        });
      }
    } else if (totalRequiredPersons < currentAssignments && totalRequiredPersons > 0) {
      // 余分な分を削除
      for (let i = currentAssignments - 1; i >= totalRequiredPersons; i--) {
        removeAssignment(i);
      }
    }
  }, [totalRequiredPersons, assignmentFields.length, appendAssignment, removeAssignment]);

  // 勤務時間計算関数
  const calculateWorkingHours = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);
    
    // 終了時刻が開始時刻より前の場合（翌日扱い）
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return `${diffHours}時間`;
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              現場予定追加
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                日付 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className="mt-1"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                現場名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="siteName"
                {...register('siteName')}
                className="mt-1"
                placeholder="現場名を入力"
              />
              {errors.siteName && (
                <p className="mt-1 text-sm text-red-600">{errors.siteName.message}</p>
              )}
            </div>
          </div>

          {/* 住所 */}
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              現場住所 <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              <Input
                id="address"
                {...register('address')}
                className="mt-1"
                placeholder="住所を入力すると、Google Mapsリンクが自動生成されます"
              />
              {watch('address') && (
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(watch('address'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Google Mapsで確認
                </a>
              )}
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* 顧客選択 */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              顧客 <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 space-y-3">
              <div className="relative">
                <Input
                  placeholder="顧客を検索..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              {customerSearch && (
                <div className="border rounded-lg max-h-32 overflow-y-auto">
                  {customers
                    .filter((customer: any) => 
                      customer.name.toLowerCase().includes(customerSearch.toLowerCase())
                    )
                    .map((customer: any) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setValue('customerId', customer.id);
                          setCustomerSearch(customer.name);
                        }}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.contactPerson}</div>
                      </button>
                    ))}
                  <button
                    type="button"
                    className="w-full text-left p-2 hover:bg-gray-50 text-blue-600 font-medium"
                    onClick={() => setShowNewCustomer(true)}
                  >
                    + 新しい顧客を追加
                  </button>
                </div>
              )}
              
              {showNewCustomer && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <Label className="text-sm font-medium text-gray-700">新規顧客名</Label>
                  <Input
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="mt-1"
                    placeholder="顧客名を入力"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        // TODO: 新規顧客作成API呼び出し
                        setCustomerSearch(newCustomerName);
                        setShowNewCustomer(false);
                        setNewCustomerName('');
                      }}
                    >
                      追加
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewCustomer(false);
                        setNewCustomerName('');
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
            )}
          </div>

          {/* 責任者 */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              責任者 <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 space-y-3">
              <div className="relative">
                <Input
                  placeholder="責任者を検索..."
                  value={responsibleSearch}
                  onChange={(e) => setResponsibleSearch(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              {responsibleSearch && (
                <div className="border rounded-lg max-h-32 overflow-y-auto">
                  {employees
                    .filter((employee: any) => 
                      employee.name.toLowerCase().includes(responsibleSearch.toLowerCase()) ||
                      employee.department.toLowerCase().includes(responsibleSearch.toLowerCase())
                    )
                    .map((employee: any) => (
                      <button
                        key={employee.id}
                        type="button"
                        className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setValue('responsibleId', employee.id);
                          setResponsibleSearch(`${employee.name} (${employee.department})`);
                        }}
                      >
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.department} - {employee.position}</div>
                      </button>
                    ))}
                  {employees.filter((employee: any) => 
                    employee.name.toLowerCase().includes(responsibleSearch.toLowerCase()) ||
                    employee.department.toLowerCase().includes(responsibleSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      該当する従業員が見つかりません
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.responsibleId && (
              <p className="mt-1 text-sm text-red-600">{errors.responsibleId.message}</p>
            )}
          </div>

          {/* 資機材 */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">資機材</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipmentOptions.map((equipment) => (
                <div key={equipment.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment.id}
                    checked={watchedEquipment?.includes(equipment.id) || false}
                    onCheckedChange={(checked) => 
                      handleEquipmentChange(equipment.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={equipment.id} className="text-sm cursor-pointer">
                    {equipment.icon} {equipment.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 動線関係者・担当者 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">
                動線関係者・担当者 <span className="text-red-500">*</span>
              </Label>
            </div>

            {/* 時間帯 */}
            <div className="space-y-4">
              {timeSlotFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">時間帯 {index + 1}</h4>
                      {field.startTime && field.endTime && (
                        <span className="text-sm text-blue-600 font-medium">
                          {calculateWorkingHours(field.startTime, field.endTime)}
                        </span>
                      )}
                    </div>
                    {timeSlotFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">開始予定 <span className="text-red-500">*</span></Label>
                      <Input
                        type="time"
                        {...register(`timeSlots.${index}.startTime`)}
                        className="mt-1"
                      />
                      {errors.timeSlots?.[index]?.startTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.timeSlots[index]?.startTime?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">終了予定 <span className="text-red-500">*</span></Label>
                      <Input
                        type="time"
                        {...register(`timeSlots.${index}.endTime`)}
                        className="mt-1"
                      />
                      {errors.timeSlots?.[index]?.endTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.timeSlots[index]?.endTime?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">必要人数 <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`timeSlots.${index}.requiredPersons`, { valueAsNumber: true })}
                        className="mt-1"
                      />
                      {errors.timeSlots?.[index]?.requiredPersons && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.timeSlots[index]?.requiredPersons?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addTimeSlot}
                disabled={timeSlotFields.length >= 10}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                時間帯を追加 {timeSlotFields.length >= 10 && '(最大10件)'}
              </Button>
            </div>
          </div>

          {/* 担当者割り当て */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">
                担当者割り当て ({totalRequiredPersons}名必要)
              </Label>
              <span className="text-sm text-gray-500">
                時間帯の必要人数に応じて自動調整されます
              </span>
            </div>

            {assignmentFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 bg-gray-50 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">担当者 {index + 1}</h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* 従業員選択 */}
                  <div>
                    <Label className="text-sm text-gray-600">従業員 <span className="text-red-500">*</span></Label>
                    <Select
                      value={watch(`assignments.${index}.employeeId`) || ''}
                      onValueChange={(value) => setValue(`assignments.${index}.employeeId`, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="従業員を選択または未割り当て" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">未割り当て</SelectItem>
                        {employees.map((employee: any) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.department} - {employee.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignments?.[index]?.employeeId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.assignments[index]?.employeeId?.message}
                      </p>
                    )}
                  </div>

                  {/* 役職と管理者設定 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">役職</Label>
                      <Select
                        value={watch(`assignments.${index}.role`) || ''}
                        onValueChange={(value) => setValue(`assignments.${index}.role`, value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="役職を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">作業員</SelectItem>
                          <SelectItem value="leader">リーダー</SelectItem>
                          <SelectItem value="supervisor">主任</SelectItem>
                          <SelectItem value="manager">課長</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        id={`manager-${index}`}
                        {...register(`assignments.${index}.isManager`)}
                      />
                      <Label htmlFor={`manager-${index}`} className="text-sm">
                        管理者として割り当て
                      </Label>
                    </div>
                  </div>

                  {/* 集合場所設定 */}
                  <div>
                    <Label className="text-sm text-gray-600">集合場所</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <div>
                        <Select
                          value={watch(`assignments.${index}.gatheringPlace`) || ''}
                          onValueChange={(value) => setValue(`assignments.${index}.gatheringPlace`, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="集合場所を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="site">現場</SelectItem>
                            <SelectItem value="office">事務所</SelectItem>
                            <SelectItem value="nearby">現場近隣</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {watch(`assignments.${index}.gatheringPlace`) === 'nearby' && (
                        <div>
                          <Input
                            placeholder="近隣の住所を入力"
                            {...register(`assignments.${index}.gatheringAddress`)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {totalRequiredPersons === 0 && (
              <div className="text-center py-4 text-gray-500">
                時間帯に必要人数を設定すると、担当者割り当て欄が表示されます
              </div>
            )}
          </div>


          {/* 繰り返し設定 */}
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRecurring(!showRecurring)}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
            >
              🔄 繰り返し設定（オプション）
            </Button>

            {showRecurring && (
              <div className="mt-3 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRecurring"
                      {...register('isRecurring')}
                    />
                    <Label htmlFor="isRecurring">繰り返しスケジュールとして設定</Label>
                  </div>

                  {watch('isRecurring') && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-3 block">繰り返す曜日（複数選択可）</Label>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                          {[
                            { id: 'monday', label: '月' },
                            { id: 'tuesday', label: '火' },
                            { id: 'wednesday', label: '水' },
                            { id: 'thursday', label: '木' },
                            { id: 'friday', label: '金' },
                            { id: 'saturday', label: '土' },
                            { id: 'sunday', label: '日' },
                          ].map((day) => (
                            <div key={day.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day.id}`}
                                checked={watch('recurringDays')?.includes(day.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentDays = watch('recurringDays') || [];
                                  if (checked) {
                                    setValue('recurringDays', [...currentDays, day.id]);
                                  } else {
                                    setValue('recurringDays', currentDays.filter(d => d !== day.id));
                                  }
                                }}
                              />
                              <Label htmlFor={`day-${day.id}`} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-gray-600">繰り返し終了日</Label>
                        <Input
                          type="date"
                          {...register('recurringEnd')}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          この日まで繰り返し予定を作成します
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 備考 */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              備考
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              className="mt-1"
              rows={4}
              placeholder="追加の情報や注意事項を入力してください"
            />
          </div>

          {/* オプション設定 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="canDuplicate"
                {...register('canDuplicate')}
              />
              <Label htmlFor="canDuplicate" className="text-sm">
                この現場予定を複製する
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isConfirmed"
                {...register('isConfirmed')}
              />
              <Label htmlFor="isConfirmed" className="text-sm font-medium">
                この現場予定を確定する
              </Label>
            </div>
          </div>

          {/* フォームアクション */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? '追加中...' : '現場予定を追加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}