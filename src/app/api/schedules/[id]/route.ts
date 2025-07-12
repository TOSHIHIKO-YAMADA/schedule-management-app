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
import { withAuth, checkEntityOwnership } from '@/lib/auth-utils';

// 時間帯更新スキーマ
const timeSlotUpdateSchema = z.object({
  id: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  requiredPersons: z.number().min(1),
  order: z.number().default(1),
});

// 担当者割り当て更新スキーマ
const assignmentUpdateSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1),
  role: z.string().min(1),
  isManager: z.boolean().default(false),
});

// スケジュール更新スキーマ
const updateScheduleSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').optional(),
  description: z.string().optional(),
  startTime: z.string().datetime('開始日時は有効な日時形式である必要があります').optional(),
  endTime: z.string().datetime('終了日時は有効な日時形式である必要があります').optional(),
  allDay: z.boolean().optional(),
  type: z.enum(['work', 'vacation', 'meeting', 'maintenance', 'appointment', 'fieldwork']).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  
  // 現場作業関連
  siteName: z.string().optional(),
  requiredPersons: z.number().optional(),
  responsibleId: z.string().optional(),
  meetingPoint: z.string().optional(),
  meetingCategory: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  
  // 関連エンティティ
  employeeId: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  
  // 繰り返し設定
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurringEnd: z.string().datetime().optional(),
  canDuplicate: z.boolean().optional(),
  
  // 通知設定
  reminderMinutes: z.number().optional(),
  
  // 時間帯と担当者（サブエンティティ）
  timeSlots: z.array(timeSlotUpdateSchema).optional(),
  assignments: z.array(assignmentUpdateSchema).optional(),
});

// GET /api/schedules/[id] - スケジュール詳細取得
export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  return withAuth(request, async (request, user) => {
    const { id } = params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
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
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            model: true,
            manufacturer: true,
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

    if (!schedule) {
      return createErrorResponse(
        'スケジュールが見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 権限チェック: 一般ユーザーは関連スケジュールのみ閲覧可能
    if (user.role === 'general') {
      const hasAccess = 
        schedule.employeeId === user.id ||
        schedule.responsibleId === user.id ||
        schedule.createdBy === user.id ||
        schedule.assignments.some(assignment => assignment.employeeId === user.id);

      if (!hasAccess) {
        return createErrorResponse(
          'このスケジュールにアクセスする権限がありません',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    // 機密情報の処理
    const processedSchedule = {
      ...schedule,
      equipment: schedule.equipment ? JSON.parse(schedule.equipment) : [],
    };

    return createSuccessResponse(processedSchedule);
  });
});

// PUT /api/schedules/[id] - スケジュール更新
export const PUT = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  return withAuth(request, async (request, user) => {
    const { id } = params;
    const body = await request.json();
    const validatedData = validateRequestBody(updateScheduleSchema, body);
    const { timeSlots, assignments, equipment, ...scheduleData } = validatedData;

    // スケジュールの存在確認
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    });

    if (!existingSchedule) {
      return createErrorResponse(
        'スケジュールが見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 権限チェック: 一般ユーザーは自分の作成したスケジュールまたは担当スケジュールのみ更新可能
    if (user.role === 'general') {
      const hasAccess = 
        existingSchedule.employeeId === user.id ||
        existingSchedule.responsibleId === user.id ||
        existingSchedule.createdBy === user.id ||
        existingSchedule.assignments.some(assignment => assignment.employeeId === user.id);

      if (!hasAccess) {
        return createErrorResponse(
          'このスケジュールを更新する権限がありません',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    // 車両の重複予約チェック（車両が変更される場合）
    if (scheduleData.vehicleId && scheduleData.vehicleId !== existingSchedule.vehicleId) {
      const startTime = scheduleData.startTime ? new Date(scheduleData.startTime) : existingSchedule.startTime;
      const endTime = scheduleData.endTime ? new Date(scheduleData.endTime) : existingSchedule.endTime;

      const conflictingSchedule = await prisma.schedule.findFirst({
        where: {
          vehicleId: scheduleData.vehicleId,
          id: { not: id },
          status: { not: 'cancelled' },
          OR: [
            {
              AND: [
                { startTime: { lte: endTime } },
                { endTime: { gte: startTime } },
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
    if (scheduleData.startTime && scheduleData.endTime) {
      const startTime = new Date(scheduleData.startTime);
      const endTime = new Date(scheduleData.endTime);
      
      if (startTime >= endTime) {
        return createErrorResponse(
          '終了時刻は開始時刻より後である必要があります',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // トランザクションでスケジュールと関連データを更新
    const result = await prisma.$transaction(async (tx) => {
      // スケジュール更新
      const updateData: any = {
        ...scheduleData,
      };

      if (scheduleData.startTime) updateData.startTime = new Date(scheduleData.startTime);
      if (scheduleData.endTime) updateData.endTime = new Date(scheduleData.endTime);
      if (equipment !== undefined) updateData.equipment = equipment.length > 0 ? JSON.stringify(equipment) : null;
      if (scheduleData.recurringEnd) updateData.recurringEnd = new Date(scheduleData.recurringEnd);

      const schedule = await tx.schedule.update({
        where: { id },
        data: updateData,
      });

      // 時間帯更新（完全置換）
      if (timeSlots !== undefined) {
        // 既存の時間帯削除
        await tx.scheduleTimeSlot.deleteMany({
          where: { scheduleId: id },
        });

        // 新しい時間帯作成
        if (timeSlots.length > 0) {
          await tx.scheduleTimeSlot.createMany({
            data: timeSlots.map((slot, index) => ({
              scheduleId: id,
              startTime: new Date(slot.startTime),
              endTime: new Date(slot.endTime),
              requiredPersons: slot.requiredPersons,
              order: index + 1,
            })),
          });
        }
      }

      // 担当者割り当て更新（完全置換）
      if (assignments !== undefined) {
        // 既存の担当者削除
        await tx.scheduleAssignment.deleteMany({
          where: { scheduleId: id },
        });

        // 新しい担当者作成
        if (assignments.length > 0) {
          await tx.scheduleAssignment.createMany({
            data: assignments.map((assignment) => ({
              scheduleId: id,
              employeeId: assignment.employeeId,
              role: assignment.role,
              isManager: assignment.isManager,
            })),
          });
        }
      }

      return schedule;
    });

    // 更新されたスケジュールを関連データと一緒に取得
    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id },
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
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            model: true,
            manufacturer: true,
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
      ...updatedSchedule,
      equipment: updatedSchedule?.equipment ? JSON.parse(updatedSchedule.equipment) : [],
    };

    return createSuccessResponse(
      processedSchedule,
      'スケジュールが更新されました'
    );
  });
});

// DELETE /api/schedules/[id] - スケジュール削除
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  return withAuth(request, async (request, user) => {
    const { id } = params;

    // スケジュールの存在確認
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdBy: true,
        employeeId: true,
        responsibleId: true,
        assignments: {
          select: { employeeId: true },
        },
      },
    });

    if (!existingSchedule) {
      return createErrorResponse(
        'スケジュールが見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 権限チェック: 管理者以外は自分の作成したスケジュールのみ削除可能
    if (user.role === 'general') {
      const hasAccess = 
        existingSchedule.createdBy === user.id ||
        existingSchedule.employeeId === user.id ||
        existingSchedule.responsibleId === user.id ||
        existingSchedule.assignments.some(assignment => assignment.employeeId === user.id);

      if (!hasAccess) {
        return createErrorResponse(
          'このスケジュールを削除する権限がありません',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    // スケジュール削除（カスケード削除により関連データも自動削除）
    await prisma.schedule.delete({
      where: { id },
    });

    return createSuccessResponse(
      { id },
      'スケジュールが削除されました'
    );
  });
});