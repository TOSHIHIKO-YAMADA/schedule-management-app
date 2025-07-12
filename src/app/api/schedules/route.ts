import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-utils';

// 時間帯作成スキーマ
const timeSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  requiredPersons: z.number().min(1),
  order: z.number().default(1),
});

// 担当者割り当てスキーマ
const assignmentSchema = z.object({
  employeeId: z.string().min(1),
  role: z.string().min(1),
  isManager: z.boolean().default(false),
});

// スケジュール作成スキーマ
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
  recurringPattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurringEnd: z.string().datetime().optional(),
  canDuplicate: z.boolean().default(false),
  
  // 通知設定
  reminderMinutes: z.number().optional(),
  
  // 時間帯と担当者（サブエンティティ）
  timeSlots: z.array(timeSlotSchema).default([]),
  assignments: z.array(assignmentSchema).default([]),
});

// GET /api/schedules - スケジュール一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const employeeId = searchParams.get('employeeId');
    const customerId = searchParams.get('customerId');
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // クエリ条件の構築
    const where: any = {};
    
    // 日付範囲フィルター
    if (startDate && endDate) {
      where.OR = [
        {
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          endTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          AND: [
            { startTime: { lte: new Date(startDate) } },
            { endTime: { gte: new Date(endDate) } },
          ],
        },
      ];
    }
    
    // 各種フィルター
    if (type) where.type = type;
    if (employeeId) where.employeeId = employeeId;
    if (customerId) where.customerId = customerId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    
    // 検索フィルター
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: search } },
        { description: { contains: search } },
        { siteName: { contains: search } },
        { location: { contains: search } },
        { address: { contains: search } },
      ];
    }

    // 権限に基づくフィルタリング
    if (user.role === 'general') {
      where.OR = [
        ...(where.OR || []),
        { employeeId: user.id },
        { responsibleId: user.id },
        { 
          assignments: {
            some: { employeeId: user.id }
          }
        },
      ];
    }

    const schedules = await prisma.schedule.findMany({
      where,
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
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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
      orderBy: {
        startTime: 'asc',
      },
    });

    // 機密情報の処理
    const processedSchedules = schedules.map(schedule => ({
      ...schedule,
      equipment: schedule.equipment ? JSON.parse(schedule.equipment) : [],
    }));

    return createSuccessResponse(processedSchedules);
  });
});

// POST /api/schedules - スケジュール作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createScheduleSchema, body);
    const { timeSlots, assignments, equipment, ...scheduleData } = validatedData;

    // 車両の重複予約チェック
    if (scheduleData.vehicleId) {
      const conflictingSchedule = await prisma.schedule.findFirst({
        where: {
          vehicleId: scheduleData.vehicleId,
          status: {
            not: 'cancelled',
          },
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(scheduleData.endTime) } },
                { endTime: { gte: new Date(scheduleData.startTime) } },
              ],
            },
          ],
        },
      });

      if (conflictingSchedule) {
        return createErrorResponse(
          '指定された車両は既に予約されています',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // 開始時刻と終了時刻の検証
    const startTime = new Date(scheduleData.startTime);
    const endTime = new Date(scheduleData.endTime);
    
    if (startTime >= endTime) {
      return createErrorResponse(
        '終了時刻は開始時刻より後である必要があります',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // トランザクションでスケジュールと関連データを作成
    const result = await prisma.$transaction(async (tx) => {
      // スケジュール作成
      const schedule = await tx.schedule.create({
        data: {
          ...scheduleData,
          startTime: new Date(scheduleData.startTime),
          endTime: new Date(scheduleData.endTime),
          equipment: equipment.length > 0 ? JSON.stringify(equipment) : null,
          recurringEnd: scheduleData.recurringEnd ? new Date(scheduleData.recurringEnd) : null,
          createdBy: user.id,
        },
      });

      // 時間帯作成
      if (timeSlots.length > 0) {
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
      if (assignments.length > 0) {
        await tx.scheduleAssignment.createMany({
          data: assignments.map((assignment) => ({
            scheduleId: schedule.id,
            employeeId: assignment.employeeId,
            role: assignment.role,
            isManager: assignment.isManager,
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
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // 機密情報の処理
    const processedSchedule = {
      ...createdSchedule,
      equipment: createdSchedule?.equipment ? JSON.parse(createdSchedule.equipment) : [],
    };

    return createSuccessResponse(
      processedSchedule,
      'スケジュールが作成されました',
      HTTP_STATUS.CREATED
    );
  });
});

// DELETE /api/schedules - 一括削除
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        '削除するスケジュールIDを指定してください',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 権限チェック: 一般ユーザーは自分の作成したスケジュールのみ削除可能
    let whereCondition: any = { id: { in: ids } };
    
    if (user.role === 'general') {
      whereCondition.createdBy = user.id;
    }

    const deletedCount = await prisma.schedule.deleteMany({
      where: whereCondition,
    });

    return createSuccessResponse(
      { deletedCount: deletedCount.count },
      `${deletedCount.count}件のスケジュールを削除しました`
    );
  });
});