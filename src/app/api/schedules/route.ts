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

// バリデーションスキーマ
const createScheduleSchema = z.object({
  title: z.string().min(1, '件名は必須です'),
  description: z.string().default(''),
  startDate: z.string().min(1, '開始日は必須です'),
  endDate: z.string().min(1, '終了日は必須です'),
  startTime: z.string().min(1, '開始時間は必須です'),
  endTime: z.string().min(1, '終了時間は必須です'),
  category: z.enum(['meeting', 'review', 'report', 'travel', 'maintenance']).default('meeting'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  location: z.string().min(1, '場所は必須です'),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  createdBy: z.string().min(1, '作成者は必須です'),
  attendeeIds: z.array(z.string()).default([]),
  reminderEnabled: z.boolean().default(false),
  reminderMinutesBefore: z.number().optional(),
});

// GET /api/schedules - スケジュール一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');
    const vehicleId = searchParams.get('vehicleId');

    // クエリ条件の構築
    const where: any = {};
    
    if (startDate && endDate) {
      where.startDate = {
        gte: startDate,
        lte: endDate,
      };
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const schedules = await prisma.schedule.findMany({
      where,
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
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return createSuccessResponse(schedules);
  });
});

// POST /api/schedules - スケジュール作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createScheduleSchema, body);
    const { attendeeIds, ...scheduleData } = validatedData;

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
                { startDate: { lte: scheduleData.endDate } },
                { endDate: { gte: scheduleData.startDate } },
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

    // トランザクションでスケジュールと参加者を作成
    const result = await prisma.$transaction(async (tx) => {
      // スケジュール作成
      const schedule = await tx.schedule.create({
        data: scheduleData,
      });

      // 参加者追加
      if (attendeeIds.length > 0) {
        await tx.scheduleAttendee.createMany({
          data: attendeeIds.map((employeeId) => ({
            scheduleId: schedule.id,
            employeeId,
          })),
        });
      }

      // 活動ログ記録
      await tx.activityLog.create({
        data: {
          action: 'create',
          entityType: 'schedule',
          entityId: schedule.id,
          entityName: schedule.title,
          description: `スケジュール「${schedule.title}」を作成しました`,
          userId: scheduleData.createdBy,
        },
      });

      return schedule;
    });

    // 作成されたスケジュールを関連データと一緒に取得
    const createdSchedule = await prisma.schedule.findUnique({
      where: { id: result.id },
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
      createdSchedule,
      'スケジュールが作成されました',
      HTTP_STATUS.CREATED
    );
  });
});