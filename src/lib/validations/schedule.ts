import { z } from 'zod';

// 資機材の定義
export const equipmentOptions = [
  { id: 'boots', label: '長靴', icon: '🔺' },
  { id: 'workPants', label: '作業スボン', icon: '📷' },
  { id: 'blueGloves', label: '青手', icon: '🏷️' },
  { id: 'cutter', label: 'カッター', icon: '⚠️' },
  { id: 'jacket', label: '上着', icon: '👤' },
  { id: 'helmet', label: 'ヘルメット', icon: '⛑️' },
] as const;

// 時間帯スキーマ
export const timeSlotSchema = z.object({
  startTime: z.string().min(1, '開始時間を入力してください'),
  endTime: z.string().min(1, '終了時間を入力してください'),
  requiredPersons: z.number().min(1, '必要人数は1人以上を指定してください'),
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`);
  const end = new Date(`2000-01-01T${data.endTime}`);
  return start < end;
}, {
  message: '終了時間は開始時間より後である必要があります',
  path: ['endTime'],
});

// 担当者割り当てスキーマ
export const assignmentSchema = z.object({
  employeeId: z.string().min(1, '担当者を選択してください'),
  role: z.string().min(1, '役職を選択してください'),
  isManager: z.boolean().default(false),
});

// 現場予定追加フォームスキーマ
export const fieldworkScheduleSchema = z.object({
  // 基本情報
  date: z.string().min(1, '日付を選択してください'),
  siteName: z.string().min(1, '現場名を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  
  // 責任者
  responsibleId: z.string().min(1, '責任者を選択してください'),
  
  // 資機材
  equipment: z.array(z.string()).default([]),
  
  // 時間帯（動的配列）
  timeSlots: z.array(timeSlotSchema).min(1, '少なくとも1つの時間帯を追加してください'),
  
  // 担当者割り当て
  assignments: z.array(assignmentSchema).default([]),
  
  // 集合場所
  meetingCategory: z.string().optional(),
  meetingPoint: z.string().optional(),
  
  // 繰り返し設定
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurringEnd: z.string().optional(),
  
  // その他
  notes: z.string().optional(),
  canDuplicate: z.boolean().default(false),
});

export type FieldworkScheduleFormData = z.infer<typeof fieldworkScheduleSchema>;
export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;

// デフォルト値
export const defaultTimeSlot: TimeSlotFormData = {
  startTime: '09:00',
  endTime: '17:00',
  requiredPersons: 1,
};

export const defaultFormValues: Partial<FieldworkScheduleFormData> = {
  date: new Date().toISOString().split('T')[0],
  timeSlots: [defaultTimeSlot],
  equipment: [],
  assignments: [],
  isRecurring: false,
  canDuplicate: false,
};