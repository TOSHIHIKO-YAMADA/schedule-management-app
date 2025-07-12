import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';

// 時間帯作成スキーマ
const timeSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  requiredPersons: z.number().min(1),
  order: z.number().default(1),
});

// 担当者割り当てスキーマ
const assignmentSchema = z.object({
  employeeId: z.string().optional(),
  role: z.string().optional(),
  isManager: z.boolean().default(false),
  gatheringPlace: z.string().optional(),
  gatheringAddress: z.string().optional(),
});

// スケジュール作成スキーマ（テスト用 - 認証なし）
const createScheduleSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  startTime: z.string().datetime('開始日時は有効な日時形式である必要があります'),
  endTime: z.string().datetime('終了日時は有効な日時形式である必要があります'),
  allDay: z.boolean().default(false),
  type: z.enum(['work', 'vacation', 'meeting', 'maintenance', 'appointment', 'fieldwork']).default('work'),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  location: z.string().optional(),
  address: z.string().optional(),
  
  // 現場作業関連
  siteName: z.string().optional(),
  requiredPersons: z.number().optional(),
  responsibleId: z.string().optional(),
  meetingPoint: z.string().optional(),
  meetingCategory: z.string().optional(),
  equipment: z.array(z.string()).default([]),
  
  // 関連エンティティ
  employeeId: z.string().min(1, '担当従業員は必須です'),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  
  // 繰り返し設定
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.string()).optional(),
  recurringEnd: z.string().datetime().optional(),
  canDuplicate: z.boolean().default(false),
  
  // 通知設定
  reminderMinutes: z.number().optional(),
  
  // 確定状態
  isConfirmed: z.boolean().default(false),
  
  // 時間帯と担当者（サブエンティティ）
  timeSlots: z.array(timeSlotSchema).default([]),
  assignments: z.array(assignmentSchema).default([]),
});

// POST /api/test/schedules - テスト用スケジュール作成（認証なし）
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = validateRequestBody(createScheduleSchema, body);
  const { timeSlots, assignments, equipment, ...scheduleData } = validatedData;

  // 開始時刻と終了時刻の検証
  const startTime = new Date(scheduleData.startTime);
  const endTime = new Date(scheduleData.endTime);
  
  if (startTime >= endTime) {
    return createErrorResponse(
      '終了時刻は開始時刻より後である必要があります',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // テスト用のデフォルトcreatedBy (最初の従業員を使用)
  const firstEmployee = await prisma.employee.findFirst();
  if (!firstEmployee) {
    return createErrorResponse(
      'テストを実行するには従業員データが必要です',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  try {
    // トランザクションでスケジュールと関連データを作成
    const result = await prisma.$transaction(async (tx) => {
      // スケジュール作成
      const schedule = await tx.schedule.create({
        data: {
          title: scheduleData.title,
          description: scheduleData.description,
          startTime: new Date(scheduleData.startTime),
          endTime: new Date(scheduleData.endTime),
          allDay: scheduleData.allDay ?? false,
          type: scheduleData.type || 'work',
          status: scheduleData.status || 'scheduled',
          location: scheduleData.location,
          address: scheduleData.address,
          siteName: scheduleData.siteName,
          requiredPersons: scheduleData.requiredPersons,
          responsibleId: scheduleData.responsibleId,
          meetingPoint: scheduleData.meetingPoint,
          meetingCategory: scheduleData.meetingCategory,
          equipment: equipment && equipment.length > 0 ? JSON.stringify(equipment) : null,
          employeeId: scheduleData.employeeId,
          customerId: scheduleData.customerId,
          vehicleId: scheduleData.vehicleId,
          isRecurring: scheduleData.isRecurring ?? false,
          recurringPattern: scheduleData.recurringDays ? JSON.stringify(scheduleData.recurringDays) : null,
          recurringEnd: scheduleData.recurringEnd ? new Date(scheduleData.recurringEnd) : null,
          canDuplicate: scheduleData.canDuplicate ?? false,
          reminderMinutes: scheduleData.reminderMinutes,
          isConfirmed: scheduleData.isConfirmed ?? false,
          createdBy: firstEmployee.id, // テスト用
        },
      });

      // 時間帯作成
      if (timeSlots && timeSlots.length > 0) {
        await tx.scheduleTimeSlot.createMany({
          data: timeSlots.map((slot, index) => ({
            scheduleId: schedule.id,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            requiredPersons: slot.requiredPersons,
            order: index + 1,
          })),
        });
      }

      // 担当者割り当て作成
      if (assignments && assignments.length > 0) {
        await tx.scheduleAssignment.createMany({
          data: assignments.map((assignment) => ({
            scheduleId: schedule.id,
            employeeId: assignment.employeeId || null,
            role: assignment.role || null,
            isManager: assignment.isManager ?? false,
            gatheringPlace: assignment.gatheringPlace || null,
            gatheringAddress: assignment.gatheringAddress || null,
          })),
        });
      }

      return schedule;
    });

    // 作成されたスケジュールを関連データと一緒に取得
    const createdSchedule = await prisma.schedule.findUnique({
      where: { id: result.id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
          },
        },
        timeSlots: {
          orderBy: { order: 'asc' },
        },
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                position: true,
              },
            },
          },
        },
      },
    });

    const processedSchedule = {
      ...createdSchedule,
      equipment: createdSchedule?.equipment ? JSON.parse(createdSchedule.equipment) : [],
      recurringDays: createdSchedule?.recurringPattern ? JSON.parse(createdSchedule.recurringPattern) : [],
    };

    return createSuccessResponse(processedSchedule, 'スケジュールが作成されました');

  } catch (error) {
    console.error('スケジュール作成エラー:', error);
    return createErrorResponse(
      '外部キー制約違反またはデータエラーが発生しました',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
});