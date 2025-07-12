'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Trash2, X } from 'lucide-react';
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
    appendTimeSlot(defaultTimeSlot);
  };

  const addAssignment = () => {
    appendAssignment({
      employeeId: '',
      role: '',
      isManager: false,
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className=\"max-w-4xl max-h-[90vh] overflow-y-auto\">
        <DialogHeader>
          <div className=\"flex items-center justify-between\">
            <DialogTitle className=\"text-xl font-bold text-gray-900\">
              現場予定追加
            </DialogTitle>
            <Button variant=\"ghost\" size=\"sm\" onClick={onCancel}>
              <X className=\"h-4 w-4\" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-6\">
          {/* 基本情報 */}
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
            <div>
              <Label htmlFor=\"date\" className=\"text-sm font-medium text-gray-700\">
                日付 <span className=\"text-red-500\">*</span>
              </Label>
              <Input
                id=\"date\"
                type=\"date\"
                {...register('date')}
                className=\"mt-1\"
              />
              {errors.date && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor=\"siteName\" className=\"text-sm font-medium text-gray-700\">
                現場名 <span className=\"text-red-500\">*</span>
              </Label>
              <Input
                id=\"siteName\"
                {...register('siteName')}
                className=\"mt-1\"
                placeholder=\"現場名を入力\"
              />
              {errors.siteName && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.siteName.message}</p>
              )}
            </div>
          </div>

          {/* 住所 */}
          <div>
            <Label htmlFor=\"address\" className=\"text-sm font-medium text-gray-700\">
              現場住所 <span className=\"text-red-500\">*</span>
            </Label>
            <Input
              id=\"address\"
              {...register('address')}
              className=\"mt-1\"
              placeholder=\"住所を入力すると、Google Mapsリンクが自動生成されます\"
            />
            {errors.address && (
              <p className=\"mt-1 text-sm text-red-600\">{errors.address.message}</p>
            )}
          </div>

          {/* 責任者 */}
          <div>
            <Label className=\"text-sm font-medium text-gray-700\">
              責任者 <span className=\"text-red-500\">*</span>
            </Label>
            <div className=\"mt-1 relative\">
              <Input
                placeholder=\"責任者を入力または検索...\"
                value={responsibleSearch}
                onChange={(e) => setResponsibleSearch(e.target.value)}
                className=\"pr-10\"
              />
              <Search className=\"absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
            </div>
            {errors.responsibleId && (
              <p className=\"mt-1 text-sm text-red-600\">{errors.responsibleId.message}</p>
            )}
          </div>

          {/* 資機材 */}
          <div>
            <Label className=\"text-sm font-medium text-gray-700 mb-3 block\">資機材</Label>
            <div className=\"grid grid-cols-2 md:grid-cols-3 gap-3\">
              {equipmentOptions.map((equipment) => (
                <div key={equipment.id} className=\"flex items-center space-x-2\">
                  <Checkbox
                    id={equipment.id}
                    checked={watchedEquipment?.includes(equipment.id) || false}
                    onCheckedChange={(checked) => 
                      handleEquipmentChange(equipment.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={equipment.id} className=\"text-sm cursor-pointer\">
                    {equipment.icon} {equipment.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 動線関係者・担当者 */}
          <div>
            <div className=\"flex items-center justify-between mb-4\">
              <Label className=\"text-sm font-medium text-gray-700\">
                動線関係者・担当者 <span className=\"text-red-500\">*</span>
              </Label>
            </div>

            {/* 時間帯 */}
            <div className=\"space-y-4\">
              {timeSlotFields.map((field, index) => (
                <div key={field.id} className=\"border rounded-lg p-4 bg-gray-50\">
                  <div className=\"flex items-center justify-between mb-3\">
                    <h4 className=\"font-medium text-gray-900\">時間帯 {index + 1}</h4>
                    {timeSlotFields.length > 1 && (
                      <Button
                        type=\"button\"
                        variant=\"ghost\"
                        size=\"sm\"
                        onClick={() => removeTimeSlot(index)}
                      >
                        <Trash2 className=\"h-4 w-4\" />
                      </Button>
                    )}
                  </div>

                  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                    <div>
                      <Label className=\"text-sm text-gray-600\">開始予定 <span className=\"text-red-500\">*</span></Label>
                      <Input
                        type=\"time\"
                        {...register(`timeSlots.${index}.startTime`)}
                        className=\"mt-1\"
                      />
                      {errors.timeSlots?.[index]?.startTime && (
                        <p className=\"mt-1 text-sm text-red-600\">
                          {errors.timeSlots[index]?.startTime?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className=\"text-sm text-gray-600\">終了予定 <span className=\"text-red-500\">*</span></Label>
                      <Input
                        type=\"time\"
                        {...register(`timeSlots.${index}.endTime`)}
                        className=\"mt-1\"
                      />
                      {errors.timeSlots?.[index]?.endTime && (
                        <p className=\"mt-1 text-sm text-red-600\">
                          {errors.timeSlots[index]?.endTime?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className=\"text-sm text-gray-600\">必要人数 <span className=\"text-red-500\">*</span></Label>
                      <Input
                        type=\"number\"
                        min=\"1\"
                        {...register(`timeSlots.${index}.requiredPersons`, { valueAsNumber: true })}
                        className=\"mt-1\"
                      />
                      {errors.timeSlots?.[index]?.requiredPersons && (
                        <p className=\"mt-1 text-sm text-red-600\">
                          {errors.timeSlots[index]?.requiredPersons?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type=\"button\"
                variant=\"outline\"
                onClick={addTimeSlot}
                className=\"w-full\"
              >
                <Plus className=\"h-4 w-4 mr-2\" />
                時間帯を追加
              </Button>
            </div>
          </div>

          {/* 担当者割り当て */}
          <div>
            <div className=\"flex items-center justify-between mb-4\">
              <Label className=\"text-sm font-medium text-gray-700\">担当者割り当て (1名):</Label>
              <Button
                type=\"button\"
                variant=\"outline\"
                size=\"sm\"
                onClick={addAssignment}
              >
                <Plus className=\"h-4 w-4 mr-2\" />
                担当者追加
              </Button>
            </div>

            {assignmentFields.map((field, index) => (
              <div key={field.id} className=\"border rounded-lg p-4 bg-gray-50 mb-3\">
                <div className=\"flex items-center justify-between mb-3\">
                  <h4 className=\"font-medium text-gray-900\">担当者 {index + 1}</h4>
                  <Button
                    type=\"button\"
                    variant=\"ghost\"
                    size=\"sm\"
                    onClick={() => removeAssignment(index)}
                  >
                    <Trash2 className=\"h-4 w-4\" />
                  </Button>
                </div>

                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div>
                    <Label className=\"text-sm text-gray-600\">役職</Label>
                    <Select>
                      <SelectTrigger className=\"mt-1\">
                        <SelectValue placeholder=\"未選択\" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=\"general\">本部/◯当て</SelectItem>
                        <SelectItem value=\"supervisor\">主任</SelectItem>
                        <SelectItem value=\"manager\">課長</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className=\"flex items-center space-x-2 mt-6\">
                    <Checkbox
                      id={`manager-${index}`}
                      {...register(`assignments.${index}.isManager`)}
                    />
                    <Label htmlFor={`manager-${index}`} className=\"text-sm\">
                      管理者として割り当て
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 集合場所 */}
          <div>
            <Label className=\"text-sm font-medium text-gray-700 mb-3 block\">集合場所 (収集員 1)</Label>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              <div>
                <Label className=\"text-sm text-gray-600\">区分</Label>
                <Select>
                  <SelectTrigger className=\"mt-1\">
                    <SelectValue placeholder=\"未選択\" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"office\">事務所</SelectItem>
                    <SelectItem value=\"site\">現場</SelectItem>
                    <SelectItem value=\"other\">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className=\"text-sm text-gray-600\">住所</Label>
                <Input
                  placeholder=\"種別を選択\"
                  {...register('meetingPoint')}
                  className=\"mt-1\"
                />
              </div>
            </div>
          </div>

          {/* 繰り返し設定 */}
          <div>
            <Button
              type=\"button\"
              variant=\"ghost\"
              onClick={() => setShowRecurring(!showRecurring)}
              className=\"p-0 h-auto text-blue-600 hover:text-blue-800\"
            >
              🔄 繰り返し設定（オプション）
            </Button>

            {showRecurring && (
              <div className=\"mt-3 p-4 border rounded-lg bg-gray-50\">
                <div className=\"space-y-4\">
                  <div className=\"flex items-center space-x-2\">
                    <Checkbox
                      id=\"isRecurring\"
                      {...register('isRecurring')}
                    />
                    <Label htmlFor=\"isRecurring\">繰り返しスケジュールとして設定</Label>
                  </div>

                  {watch('isRecurring') && (
                    <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                      <div>
                        <Label className=\"text-sm text-gray-600\">繰り返しパターン</Label>
                        <Select>
                          <SelectTrigger className=\"mt-1\">
                            <SelectValue placeholder=\"選択してください\" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=\"daily\">毎日</SelectItem>
                            <SelectItem value=\"weekly\">毎週</SelectItem>
                            <SelectItem value=\"monthly\">毎月</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className=\"text-sm text-gray-600\">終了日</Label>
                        <Input
                          type=\"date\"
                          {...register('recurringEnd')}
                          className=\"mt-1\"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 備考 */}
          <div>
            <Label htmlFor=\"notes\" className=\"text-sm font-medium text-gray-700\">
              備考
            </Label>
            <Textarea
              id=\"notes\"
              {...register('notes')}
              className=\"mt-1\"
              rows={4}
              placeholder=\"追加の情報や注意事項を入力してください\"
            />
          </div>

          {/* 複製オプション */}
          <div className=\"flex items-center space-x-2\">
            <Checkbox
              id=\"canDuplicate\"
              {...register('canDuplicate')}
            />
            <Label htmlFor=\"canDuplicate\" className=\"text-sm\">
              この現場予定を複製する
            </Label>
          </div>

          {/* フォームアクション */}
          <div className=\"flex justify-end space-x-3 pt-6 border-t\">
            <Button
              type=\"button\"
              variant=\"outline\"
              onClick={onCancel}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              type=\"submit\"
              disabled={isLoading}
              className=\"bg-blue-600 hover:bg-blue-700\"
            >
              {isLoading ? '追加中...' : '現場予定を追加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}