import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  validateEntityExists,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth, checkEntityOwnership, isAdmin } from '@/lib/auth-utils';

// バリデーションスキーマ
const updateScheduleSchema = z.object({
  title: z.string().min(1, '件名は必須です').optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, '開始日は必須です').optional(),
  endDate: z.string().min(1, '終了日は必須です').optional(),
  startTime: z.string().min(1, '開始時間は必須です').optional(),
  endTime: z.string().min(1, '終了時間は必須です').optional(),
  category: z.enum(['meeting', 'review', 'report', 'travel', 'maintenance']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  location: z.string().min(1, '場所は必須です').optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  customerId: z.string().nullable().optional(),
  vehicleId: z.string().nullable().optional(),
  attendeeIds: z.array(z.string()).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderMinutesBefore: z.number().nullable().optional(),
});

// GET /api/schedules/[id] - スケジュール詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const schedule = await validateEntityExists(
      await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        vehicle: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        activityLogs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    }),
    'スケジュール'
  );

    return createSuccessResponse(schedule);
  });
});

// PUT /api/schedules/[id] - スケジュール更新
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(updateScheduleSchema, body);
    const { attendeeIds, ...scheduleData } = validatedData;

    // 既存のスケジュールを確認
    const existingSchedule = await validateEntityExists(
      await prisma.schedule.findUnique({
        where: { id: params.id },
      }),
      'スケジュール'
    );

    // 所有者チェック（管理者でない場合は自分が作成したスケジュールのみ更新可能）
    const isOwner = await checkEntityOwnership('schedule', params.id, user.id);
    if (!isOwner && !isAdmin(user.role)) {
      return createErrorResponse(
        'このスケジュールを更新する権限がありません',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // 車両の重複予約チェック（車両が変更される場合）
    if (scheduleData.vehicleId && scheduleData.vehicleId !== existingSchedule.vehicleId) {
      const conflictingSchedule = await prisma.schedule.findFirst({
        where: {
          id: { not: params.id },
          vehicleId: scheduleData.vehicleId,
          status: { not: 'cancelled' },
          OR: [
            {
              AND: [
                { startDate: { lte: scheduleData.endDate || existingSchedule.endDate } },
                { endDate: { gte: scheduleData.startDate || existingSchedule.startDate } },
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

    // トランザクションで更新
    const result = await prisma.$transaction(async (tx) => {
      // スケジュール更新
      const updatedSchedule = await tx.schedule.update({
        where: { id: params.id },
        data: scheduleData,
      });

      // 参加者更新（指定された場合）
      if (attendeeIds !== undefined) {
        // 既存の参加者を削除
        await tx.scheduleAttendee.deleteMany({
          where: { scheduleId: params.id },
        });

        // 新しい参加者を追加
        if (attendeeIds.length > 0) {
          await tx.scheduleAttendee.createMany({
            data: attendeeIds.map((employeeId) => ({
              scheduleId: params.id,
              employeeId,
            })),
          });
        }
      }

      // 活動ログ記録
      await tx.activityLog.create({
        data: {
          action: 'update',
          entityType: 'schedule',
          entityId: params.id,
          entityName: updatedSchedule.title,
          description: `スケジュール「${updatedSchedule.title}」を更新しました`,
          userId: existingSchedule.createdBy,
        },
      });

      return updatedSchedule;
    });

    // 更新されたスケジュールを関連データと一緒に取得
    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        vehicle: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return createSuccessResponse(
      updatedSchedule,
      'スケジュールが更新されました'
    );

  });
});

// DELETE /api/schedules/[id] - スケジュール削除
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    // 既存のスケジュールを確認
    const existingSchedule = await validateEntityExists(
      await prisma.schedule.findUnique({
        where: { id: params.id },
      }),
      'スケジュール'
    );

    // トランザクションで削除
    await prisma.$transaction(async (tx) => {
      // 関連データを削除（Cascade設定により自動削除されるものもあり）
      await tx.scheduleAttendee.deleteMany({
        where: { scheduleId: params.id },
      });

      await tx.task.deleteMany({
        where: { scheduleId: params.id },
      });

      await tx.activityLog.deleteMany({
        where: { 
          entityType: 'schedule',
          entityId: params.id,
        },
      });

      // 活動ログ記録
      await tx.activityLog.create({
        data: {
          action: 'delete',
          entityType: 'schedule',
          entityId: params.id,
          entityName: existingSchedule.title,
          description: `スケジュール「${existingSchedule.title}」を削除しました`,
          userId: existingSchedule.createdBy,
        },
      });

      // スケジュール削除
      await tx.schedule.delete({
        where: { id: params.id },
      });
    });

    return createSuccessResponse(
      null,
      'スケジュールが削除されました'
    );

  });
});